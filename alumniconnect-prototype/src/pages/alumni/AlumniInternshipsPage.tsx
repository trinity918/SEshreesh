import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InternshipCard } from '@/components/cards/InternshipCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Loader2, Briefcase } from 'lucide-react';

// TODO: Connect to MongoDB internships collection

const skillOptions = [
  'Python',
  'Machine Learning',
  'TensorFlow/PyTorch',
  'NLP',
  'React',
  'Node.js',
  'MongoDB',
  'TypeScript',
  'Java',
  'SQL',
  'AWS/GCP',
  'Data Analysis',
  'Communication',
  'Problem Solving',
];

export const AlumniInternshipsPage = () => {
  const { user } = useAuth();
  const { myInternships, loadMyInternships, addInternship, isLoading } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [stipend, setStipend] = useState('');
  const [deadline, setDeadline] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    loadMyInternships();
  }, []);

  // Optional: pre-fill company from logged-in alumni profile (if you stored it there)
  useEffect(() => {
    if (user?.company && !company) {
      setCompany(user.company);
    }
  }, [user, company]);

  const handleSubmit = async () => {
    if (
      !title ||
      !description ||
      requiredSkills.length === 0 ||
      !duration ||
      !location ||
      !deadline
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    if (!company) {
      toast({
        title: 'Error',
        description: 'Please enter the company name',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // POST /api/internships to MongoDB (via apiMock + backend)
    await addInternship({
      title,
      company,
      postedBy: user?.id || '',
      postedByName: user?.name || '',
      description,
      skillsRequired: requiredSkills,
      duration,
      location,
      stipend: stipend || undefined,
      deadline,
    });

    toast({
      title: 'Internship Posted!',
      description: 'Your internship has been published successfully.',
    });

    // Reset form
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setRequiredSkills([]);
    setDuration('');
    setLocation('');
    setStipend('');
    setDeadline('');
    setCompany('');
    setIsSubmitting(false);
  };

  const toggleSkill = (skill: string) => {
    if (requiredSkills.includes(skill)) {
      setRequiredSkills(requiredSkills.filter((s) => s !== skill));
    } else {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  const handleViewDetails = (internship: (typeof myInternships)[0]) => {
    // Could open a details modal showing applicants
    toast({
      title: internship.title,
      description: `${internship.applicants.length} applicants - View full details coming soon!`,
    });
  };

  return (
    <DashboardLayout requiredRole="alumni">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Internships</h1>
            <p className="text-muted-foreground">
              Post and manage internship opportunities
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Post Internship
          </Button>
        </div>

        {/* Posted Internships */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : myInternships.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-foreground">
                No internships posted yet
              </p>
              <p className="text-sm text-muted-foreground">
                Create your first internship posting to start receiving applications
              </p>
              <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Post Your First Internship
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myInternships.map((internship, index) => (
              <InternshipCard
                key={
                  (internship as any).id ||
                  (internship as any)._id ||
                  index
                }
                internship={internship}
                onView={handleViewDetails}
                showApplicants
              />
            ))}
          </div>
        )}

        {/* Post Internship Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Post New Internship</DialogTitle>
              <DialogDescription>
                Create an internship opportunity for students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Machine Learning Intern"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* ✅ New: Company field */}
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  placeholder="e.g., Google, Microsoft, Startup XYZ"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what the intern will learn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Required Skills *</Label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant={
                        requiredSkills.includes(skill) ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="2 months">2 months</SelectItem>
                      <SelectItem value="3 months">3 months</SelectItem>
                      <SelectItem value="4 months">4 months</SelectItem>
                      <SelectItem value="6 months">6 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Bangalore (On-site)">
                        Bangalore (On-site)
                      </SelectItem>
                      <SelectItem value="Mumbai (On-site)">
                        Mumbai (On-site)
                      </SelectItem>
                      <SelectItem value="Delhi (On-site)">
                        Delhi (On-site)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stipend">Stipend (Optional)</Label>
                  <Input
                    id="stipend"
                    placeholder="e.g., ₹30,000/month"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Post Internship
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};
