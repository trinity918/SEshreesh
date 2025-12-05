import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InternshipCard } from '@/components/cards/InternshipCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Internship } from '@/mock/mockInternships';
import { toast } from '@/hooks/use-toast';
import { Search, Filter, Loader2 } from 'lucide-react';

// TODO: Load internships from MongoDB internships collection
// POST application to /api/internships/:id/apply (MongoDB subdocument or separate applications collection)

const skillOptions = ['Python', 'Machine Learning', 'TensorFlow/PyTorch', 'NLP', 'React', 'Node.js', 'MongoDB', 'TypeScript', 'Java', 'SQL', 'AWS/GCP'];

export const InternshipHubPage = () => {
  const { user } = useAuth();
  const { internships, loadInternships, applyToInternship, isLoading } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadInternships({
      skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    });
  }, [selectedSkills]);

  const filteredInternships = internships.filter(internship => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        internship.title.toLowerCase().includes(search) ||
        internship.company.toLowerCase().includes(search) ||
        internship.requiredSkills.some(s => s.toLowerCase().includes(search))
      );
    }
    return true;
  });

  const handleApply = (internship: Internship) => {
    setSelectedInternship(internship);
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async () => {
  if (!selectedInternship || !user || !resumeFileName) {
    toast({
      title: 'Error',
      description: 'Please upload your resume',
      variant: 'destructive',
    });
    return;
  }

  // ✅ Get internship ID from both possible fields
  const internshipId = selectedInternship.id || selectedInternship._id;
  
  if (!internshipId) {
    toast({
      title: 'Error',
      description: 'Invalid internship ID',
      variant: 'destructive',
    });
    return;
  }

  setIsSubmitting(true);

  try {
    // ✅ Get user ID from both possible fields
    const userId = user.id || user._id;
    
    await applyToInternship(internshipId, {
      studentId: userId,
      studentName: user.name,
      resumeFileName,
      coverLetter: coverLetter || undefined,
    });

    toast({
      title: 'Application Submitted!',
      description: `Your application for ${selectedInternship.title} has been submitted`,
    });

    setIsApplyModalOpen(false);
    setSelectedInternship(null);
    setResumeFileName('');
    setCoverLetter('');
  } catch (error) {
    console.error('Application error:', error);
    toast({
      title: 'Error',
      description: 'Failed to submit application',
      variant: 'destructive',
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const hasApplied = (internship: Internship) => {
  // ✅ Add comprehensive null checks and handle MongoDB _id
  if (!user?.id || !internship?.applicants) {
    return false;
  }
  
  // Handle both MongoDB _id and mock id
  const userId = user.id || user._id;
  return internship.applicants.some(a => {
    // Handle different applicant structures
    const applicantId = a?.studentId || a?.student || a?.student?._id;
    return applicantId === userId;
  });
};
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Internship Hub</h1>
          <p className="text-muted-foreground">Discover and apply for internship opportunities</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, company, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <Button
                    key={skill}
                    variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            {selectedSkills.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSkills([])}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredInternships.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-foreground">No internships found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
       {filteredInternships.map((internship, index) => (
  <InternshipCard
    key={internship.id || internship._id || `internship-${index}`}
    internship={internship}
    onApply={handleApply}
    hasApplied={hasApplied(internship)}
  />
))}
          </div>
        )}

        {/* Apply Modal */}
        <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Internship</DialogTitle>
              <DialogDescription>
                {selectedInternship?.title} at {selectedInternship?.company}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="resume">Resume *</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFileName(e.target.files?.[0]?.name || '')}
                />
                {resumeFileName && (
                  <p className="text-sm text-muted-foreground">Selected: {resumeFileName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Write a brief cover letter explaining why you're a good fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitApplication} disabled={isSubmitting || !resumeFileName}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};
