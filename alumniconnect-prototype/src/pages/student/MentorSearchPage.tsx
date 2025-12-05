import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MentorCard } from '@/components/cards/MentorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Mentor } from '@/mock/mockMentors';
import { toast } from '@/hooks/use-toast';
import { Search, Filter, Loader2 } from 'lucide-react';

// TODO: Replace mockMentors with MongoDB query on mentors collection (with filters)

const skillOptions = ['Machine Learning', 'Deep Learning', 'NLP', 'Python', 'Full Stack Development', 'React', 'Node.js', 'AWS', 'System Design', 'FinTech', 'Algorithmic Trading', 'Risk Management', 'Java'];
const industryOptions = ['Technology', 'Finance', 'Consulting', 'Startups', 'Healthcare'];

export const MentorSearchPage = () => {
  const { user } = useAuth();
  const { mentors, loadMentors, createMentorship, isLoading } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [meetingPurpose, setMeetingPurpose] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMentors({
      skills: selectedSkills.length > 0 ? selectedSkills : undefined,
      industry: selectedIndustry || undefined,
      available: showAvailableOnly || undefined,
    });
  }, [selectedSkills, selectedIndustry, showAvailableOnly]);

  const filteredMentors = mentors.filter(mentor => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        mentor.name?.toLowerCase().includes(search) ||
        mentor.company?.toLowerCase().includes(search) ||
        (mentor.skills || mentor.expertise || []).some((s: string) => s.toLowerCase().includes(search))
      );
    }
    return true;
  });

  const handleRequestMentorship = (mentor: Mentor) => {
    // ✅ Check if user is logged in
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to request mentorship',
        variant: 'destructive',
      });
      return;
    }
    
    // ✅ Check if mentor has availability
    const availableSlots = mentor.availability ?? 0;
    if (availableSlots <= 0) {
      toast({
        title: 'Mentor Unavailable',
        description: 'This mentor currently has no available slots',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedMentor(mentor);
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedMentor || !user || !meetingPurpose || !preferredDate || !preferredTime) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Get correct IDs (handle both id and _id fields)
      const mentorId = selectedMentor.id || selectedMentor._id;
      const studentId = user.id || user._id;
      
      if (!mentorId || !studentId) {
        throw new Error('Missing mentor or student ID');
      }

      // ✅ Prepare payload for backend
      await createMentorship({
        studentId: studentId,
        studentName: user.name,
        studentEmail: user.email,
        mentorId: mentorId, // ✅ Use correct mentor ID (not userId)
        mentorName: selectedMentor.name,
        purpose: meetingPurpose,
        preferredDate,
        preferredTime,
        status: 'pending',
        studentAvatar: user.avatar || '',
        mentorAvatar: selectedMentor.avatar,
      });

      toast({
        title: 'Request Sent!',
        description: `Your mentorship request has been sent to ${selectedMentor.name}`,
      });

      setIsModalOpen(false);
      setSelectedMentor(null);
      setMeetingPurpose('');
      setPreferredDate('');
      setPreferredTime('');
    } catch (error) {
      console.error('Failed to send mentorship request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send mentorship request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold text-foreground">Find Mentors</h1>
          <p className="text-muted-foreground">Connect with alumni mentors who match your interests</p>
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
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, company, or skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industryOptions.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={showAvailableOnly ? 'default' : 'outline'}
                onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              >
                Available Only
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
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

            {(selectedSkills.length > 0 || selectedIndustry || showAvailableOnly) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSkills([]);
                  setSelectedIndustry('');
                  setShowAvailableOnly(false);
                }}
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
        ) : filteredMentors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-foreground">No mentors found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMentors.map((mentor, index) => (
              <MentorCard
                key={mentor.id || mentor._id || `mentor-${index}`}
                mentor={mentor}
                onRequestMentorship={handleRequestMentorship}
              />
            ))}
          </div>
        )}

        {/* Request Mentorship Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Mentorship</DialogTitle>
              <DialogDescription>
                Send a mentorship request to {selectedMentor?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Meeting Purpose *</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe what you'd like to discuss..."
                  value={meetingPurpose}
                  onChange={(e) => setMeetingPurpose(e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Preferred Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time *</Label>
                  <Select value={preferredTime} onValueChange={setPreferredTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="14:00">02:00 PM</SelectItem>
                      <SelectItem value="15:00">03:00 PM</SelectItem>
                      <SelectItem value="16:00">04:00 PM</SelectItem>
                      <SelectItem value="17:00">05:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRequest} disabled={isSubmitting || !meetingPurpose || !preferredDate || !preferredTime}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};