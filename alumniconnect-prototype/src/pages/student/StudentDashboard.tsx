import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MeetingScheduler } from '@/components/MeetingScheduler';
import { Search, Briefcase, FileText, MessageSquare, Calendar, ArrowRight, Star } from 'lucide-react';

// TODO: Load student dashboard data from MongoDB (collections: users, mentorships, internships, resources)

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { 
    mentors, 
    loadMentors, 
    mentorshipRequests, 
    loadMentorshipRequests,
    internships,
    loadInternships,
    resources,
    loadResources,
  } = useData();

  useEffect(() => {
    loadMentors();
    loadMentorshipRequests();
    loadInternships();
    loadResources();
  }, []);

  // Filter student's mentorship requests
  const myMeetings = mentorshipRequests.filter(m => m.studentId === user?.id);
  const suggestedMentors = mentors.filter(m => m.isAvailable).slice(0, 3);
  const recentResources = resources.slice(0, 3);
  const myApplications = internships.filter(i => 
    i.applicants.some(a => a.studentId === user?.id)
  );

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your mentorship journey</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/student/mentors">
                <Search className="mr-2 h-4 w-4" />
                Find Mentors
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myMeetings.filter(m => m.status === 'accepted').length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Meetings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Briefcase className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myApplications.length}</p>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Star className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mentors.length}</p>
                <p className="text-sm text-muted-foreground">Available Mentors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                <FileText className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resources.length}</p>
                <p className="text-sm text-muted-foreground">Resources</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Meetings */}
          <MeetingScheduler meetings={myMeetings} userRole="student" title="Upcoming Mentorships" />

          {/* My Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Internship Applications</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/internships">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {myApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">No applications yet</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/student/internships">Browse internships</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myApplications.slice(0, 3).map((internship, index) => {
                    const application = internship.applicants.find(a => a.studentId === user?.id);
                    return (
                      <div key={internship.id || internship._id || `application-${index}`} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{internship.title}</p>
                          <p className="text-sm text-muted-foreground">{internship.company}</p>
                        </div>
                        <Badge className={
                          application?.status === 'pending' ? 'bg-warning/10 text-warning' :
                          application?.status === 'reviewed' ? 'bg-info/10 text-info' :
                          application?.status === 'accepted' ? 'bg-success/10 text-success' :
                          'bg-destructive/10 text-destructive'
                        }>
                          {application?.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Suggested Mentors */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Suggested Mentors</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/mentors">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedMentors.map((mentor, index) => (
                <div key={mentor.id || mentor._id || `mentor-${index}`} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                    <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{mentor.name}</p>
                    <p className="text-sm text-muted-foreground">{mentor.designation} at {mentor.company}</p>
                  </div>
                  <div className="flex items-center gap-1 text-warning">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{mentor.rating}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Resources */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Resources</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/resources">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentResources.map((resource, index) => (
                <div key={resource.id || resource._id || `resource-${index}`} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-sm text-muted-foreground">by {resource.uploadedByName}</p>
                  </div>
                  <Badge variant="secondary">{resource.fileType}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link to="/student/mentors">
                  <Search className="h-6 w-6" />
                  <span>Search Mentors</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link to="/student/internships">
                  <Briefcase className="h-6 w-6" />
                  <span>Apply for Internship</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link to="/student/resources">
                  <FileText className="h-6 w-6" />
                  <span>Browse Resources</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link to="/student/messages">
                  <MessageSquare className="h-6 w-6" />
                  <span>Messages</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};