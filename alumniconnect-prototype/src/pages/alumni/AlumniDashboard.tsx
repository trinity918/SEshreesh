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
import { Calendar, Briefcase, FileText, MessageSquare, Users, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

// TODO: Load alumni dashboard data from MongoDB (collections: users, mentorships, internships, resources)

export const AlumniDashboard = () => {
  const { user } = useAuth();

  // Type assertion to extend user with additional fields
  const extendedUser = user as (typeof user & {
    avatar?: string;
    designation?: string;
    company?: string;
    expertise?: string[];
    availability?: number;
  }) | null;
  const {
    mentorshipRequests,
    loadMentorshipRequests,
    updateMentorshipRequestStatus,
    myInternships,
    loadMyInternships,
    myResources,
    loadMyResources,
  } = useData();

  useEffect(() => {
    loadMentorshipRequests();
    loadMyInternships();
    loadMyResources();
  }, []);

  // Filter mentor's requests - FIXED with null checks
  const myRequests = mentorshipRequests?.filter(m => 
    m && m.mentor && (m.mentor.id === user?.id || m.mentor._id === user?.id || m.mentorId === user?.id)
  ) || [];

  const pendingRequests = myRequests.filter(m => m.status === 'pending');
  const acceptedMeetings = myRequests.filter(m => m.status === 'accepted');

  const handleAccept = (id: string) => {
    // TODO: Update MongoDB collection mentorshipRequests
    updateMentorshipRequestStatus(id, 'accepted');
  };

  const handleDecline = (id: string) => {
    // TODO: Update MongoDB collection mentorshipRequests
    updateMentorshipRequestStatus(id, 'declined');
  };

  return (
    <DashboardLayout requiredRole="alumni">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Manage your mentorship activities and contributions</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/alumni/internships">
                <Briefcase className="mr-2 h-4 w-4" />
                Post Internship
              </Link>
            </Button>
            <Button asChild>
              <Link to="/alumni/resources">
                <FileText className="mr-2 h-4 w-4" />
                Upload Resource
              </Link>
            </Button>
          </div>
        </div>

        {/* Profile Summary */}
        <Card className="hero-gradient text-primary-foreground">
          <CardContent className="flex items-center gap-6 p-6">
            <Avatar className="h-20 w-20 border-2 border-primary-foreground/20">
              <AvatarImage src={extendedUser?.avatar} alt={extendedUser?.name} />
              <AvatarFallback className="bg-primary-foreground text-primary text-xl">
                {extendedUser?.name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{extendedUser?.name}</h2>
              <p className="opacity-90">{extendedUser?.designation} at {extendedUser?.company}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {extendedUser?.expertise?.slice(0, 4).map(skill => (
                  <Badge key={skill} className="bg-primary-foreground/20 text-primary-foreground border-0">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{extendedUser?.availability || 3}</p>
              <p className="text-sm opacity-90">slots/week</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{acceptedMeetings.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myInternships?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Internships Posted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myResources?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Resources Shared</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Mentorship Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Mentorship Requests</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/alumni/requests">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.slice(0, 3).map((request, index) => {
                    // Get the ID safely
                    const requestId = request.id || request._id || `request-${index}`;
                    // Get student info safely
                    const student = request.student || {};
                    const studentName = student.name || student.username || 'Student';
                    const studentAvatar = student.avatar;
                    const purpose = request.purpose || request.message || 'No message';
                    const preferredDate = request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'No date';
                    const preferredTime = request.preferredTime || 'No time';
                    
                    return (
                      <div key={requestId} className="flex items-start gap-4 rounded-lg border p-4">
                        <Avatar>
                          <AvatarImage src={studentAvatar} alt={studentName} />
                          <AvatarFallback>{studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{studentName}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{purpose}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {preferredDate} at {preferredTime}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAccept(request.id || request._id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDecline(request.id || request._id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <MeetingScheduler meetings={myRequests} userRole="alumni" title="Upcoming Sessions" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Posted Internships */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Posted Internships</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/alumni/internships">
                  Manage <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {(!myInternships || myInternships.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">No internships posted yet</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/alumni/internships">Post your first internship</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myInternships.slice(0, 3).map((internship, index) => {
                    const internshipId = internship.id || internship._id || `internship-${index}`;
                    const title = internship.title || 'Untitled Internship';
                    const applicants = internship.applicants?.length || 0;
                    const status = internship.status || 'active';
                    
                    return (
                      <div key={internshipId} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{title}</p>
                          <p className="text-sm text-muted-foreground">{applicants} applicants</p>
                        </div>
                        <Badge className={status === 'active' ? 'bg-success/10 text-success' : 'bg-muted'}>
                          {status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Resources */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Shared Resources</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/alumni/resources">
                  Manage <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {(!myResources || myResources.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">No resources uploaded yet</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/alumni/resources">Upload your first resource</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myResources.slice(0, 3).map((resource, index) => {
                    const resourceId = resource.id || resource._id || `resource-${index}`;
                    const title = resource.title || 'Untitled Resource';
                    const downloads = resource.downloads || 0;
                    const fileType = resource.fileType || resource.type || 'file';
                    
                    return (
                      <div key={resourceId} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{title}</p>
                            <p className="text-sm text-muted-foreground">{downloads} downloads</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{fileType}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
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
                <Link to="/alumni/requests">
                  <Users className="h-6 w-6" />
                  <span>View Requests</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link to="/alumni/internships">
                  <Briefcase className="h-6 w-6" />
                  <span>Post Internship</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link to="/alumni/resources">
                  <FileText className="h-6 w-6" />
                  <span>Upload Resource</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link to="/alumni/messages">
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