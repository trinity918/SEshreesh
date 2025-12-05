import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Loader2, FileText } from 'lucide-react';
import axios from 'axios';

// TODO: Connect to MongoDB resources collection (with file URL / GridFS reference)

const topicOptions = ['AI/ML', 'Data Science', 'Interview Prep', 'Career', 'System Design', 'Backend', 'Architecture', 'Finance', 'FinTech', 'Resume', 'Projects', 'Startups', 'Entrepreneurship'];

export const AlumniResourcesPage = () => {
  const { user } = useAuth();
  const { myResources, loadMyResources, addResource, isLoading } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [fileType, setFileType] = useState<'PDF' | 'PPT' | 'DOCX' | 'XLSX'>('PDF');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');

  useEffect(() => {
    loadMyResources();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // IMPORTANT: actually store the file so validation and upload work
      setFile(selectedFile);

      setFileName(selectedFile.name);
      // Format file size
      const sizeInKB = selectedFile.size / 1024;
      if (sizeInKB > 1024) {
        setFileSize(`${(sizeInKB / 1024).toFixed(1)} MB`);
      } else {
        setFileSize(`${sizeInKB.toFixed(0)} KB`);
      }
      // Detect file type
      const ext = selectedFile.name.split('.').pop()?.toUpperCase();
      if (ext === 'PDF' || ext === 'PPT' || ext === 'PPTX' || ext === 'DOCX' || ext === 'XLSX') {
        setFileType(ext === 'PPTX' ? 'PPT' : (ext as typeof fileType));
      }
    }
  };

  const handleSubmit = async () => {
    // ✅ Only title and file are required for the backend
    if (!title || !file) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields: Title and File',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file to backend upload endpoint
      const formData = new FormData();
      formData.append('file', file);

      // ✅ Match backend: POST /api/resources/upload and read `url`
      const uploadResponse = await axios.post('http://localhost:5000/api/resources/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = uploadResponse.data.url;
      if (!fileUrl) {
        throw new Error('File upload failed: No file URL returned');
      }

      // Call resource creation logic with file URL and other (optional) fields
      await addResource({
        title,
        description,                 // optional for backend
        uploadedBy: user?.id || '',
        uploadedByName: user?.name || '',
        topics,                      // optional
        fileType,
        fileName: file.name,
        fileSize,
        fileUrl,
      });

      toast({
        title: 'Resource Uploaded!',
        description: 'Your resource is now available for students.',
      });

      // Reset form
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setTopics([]);
      setFileType('PDF');
      setFileName('');
      setFileSize('');
      setFile(null);
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading your resource. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTopic = (topic: string) => {
    if (topics.includes(topic)) {
      setTopics(topics.filter(t => t !== topic));
    } else {
      setTopics([...topics, topic]);
    }
  };

  return (
    <DashboardLayout requiredRole="alumni">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Resources</h1>
            <p className="text-muted-foreground">Upload and share learning materials with students</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Resource
          </Button>
        </div>

        {/* Uploaded Resources */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : myResources && myResources.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myResources.map((resource, index) =>
              resource ? (
                <ResourceCard
                  key={(resource as any).id || (resource as any)._id || index}
                  resource={resource}
                />
              ) : null
            )}

          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-foreground">No resources uploaded yet</p>
              <p className="text-sm text-muted-foreground">Share your knowledge by uploading helpful materials</p>
              <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Your First Resource
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upload Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Resource</DialogTitle>
              <DialogDescription>
                Share learning materials with students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Machine Learning Interview Guide"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                {/* ✅ Description is no longer required */}
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this resource covers (optional)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Topics (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {topicOptions.map((topic) => (
                    <Button
                      key={topic}
                      type="button"
                      variant={topics.includes(topic) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTopic(topic)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xlsx"
                  onChange={handleFileSelect}
                />
                {fileName && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {fileName} ({fileSize})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileType">File Type</Label>
                <Select value={fileType} onValueChange={(v) => setFileType(v as typeof fileType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="PPT">PPT / PPTX</SelectItem>
                    <SelectItem value="DOCX">DOCX</SelectItem>
                    <SelectItem value="XLSX">XLSX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload Resource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};
