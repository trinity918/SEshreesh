import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MeetingScheduler } from '@/components/MeetingScheduler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MessageSquare, CheckCircle, XCircle, Hourglass } from 'lucide-react';

// TODO: Map this to MongoDB 'meetings' or 'mentorships' collection via Express API

export const StudentMeetingsPage = () => {
  const { user } = useAuth();
  const { mentorshipRequests, loadMentorshipRequests } = useData();

  useEffect(() => {
    loadMentorshipRequests();
  }, []);

  const myMeetings = mentorshipRequests.filter(m => m.studentId === user?.id);
  const pendingMeetings = myMeetings.filter(m => m.status === 'pending');
  const acceptedMeetings = myMeetings.filter(m => m.status === 'accepted');
  const completedMeetings = myMeetings.filter(m => m.status === 'completed');
  const declinedMeetings = myMeetings.filter(m => m.status === 'declined');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Hourglass className="h-4 w-4 text-warning" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const MeetingsList = ({ meetings, emptyMessage }: { meetings: typeof myMeetings; emptyMessage: string }) => (
    meetings.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    ) : (
      <div className="space-y-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardContent className="flex items-start gap-4 p-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={meeting.mentorAvatar} alt={meeting.mentorName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {meeting.mentorName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{meeting.mentorName}</h3>
                  <Badge className={
                    meeting.status === 'pending' ? 'bg-warning/10 text-warning' :
                    meeting.status === 'accepted' ? 'bg-success/10 text-success' :
                    meeting.status === 'completed' ? 'bg-muted text-muted-foreground' :
                    'bg-destructive/10 text-destructive'
                  }>
                    {getStatusIcon(meeting.status)}
                    <span className="ml-1 capitalize">{meeting.status}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(meeting.preferredDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {meeting.preferredTime}
                  </span>
                </div>
                <p className="flex items-start gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  {meeting.purpose}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  );

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Meetings</h1>
          <p className="text-muted-foreground">View and manage your mentorship sessions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Hourglass className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingMeetings.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{acceptedMeetings.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedMeetings.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{declinedMeetings.length}</p>
                <p className="text-xs text-muted-foreground">Declined</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meetings Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>All Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming ({acceptedMeetings.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingMeetings.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedMeetings.length})</TabsTrigger>
                <TabsTrigger value="declined">Declined ({declinedMeetings.length})</TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <TabsContent value="upcoming">
                  <MeetingsList meetings={acceptedMeetings} emptyMessage="No upcoming meetings" />
                </TabsContent>
                <TabsContent value="pending">
                  <MeetingsList meetings={pendingMeetings} emptyMessage="No pending requests" />
                </TabsContent>
                <TabsContent value="completed">
                  <MeetingsList meetings={completedMeetings} emptyMessage="No completed meetings yet" />
                </TabsContent>
                <TabsContent value="declined">
                  <MeetingsList meetings={declinedMeetings} emptyMessage="No declined requests" />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
