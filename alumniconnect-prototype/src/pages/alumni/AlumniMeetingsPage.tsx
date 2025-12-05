import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MessageSquare, CheckCircle, XCircle, Hourglass } from 'lucide-react';

// TODO: Map this to MongoDB 'meetings' or 'mentorships' collection via Express API

export const AlumniMeetingsPage = () => {
  const { user } = useAuth();
  const { mentorshipRequests, loadMentorshipRequests } = useData();

  useEffect(() => {
    loadMentorshipRequests();
  }, []);

  const myMeetings = mentorshipRequests.filter(m => m.mentorId === user?.id);
  const acceptedMeetings = myMeetings.filter(m => m.status === 'accepted');
  const completedMeetings = myMeetings.filter(m => m.status === 'completed');

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
                <AvatarImage src={meeting.studentAvatar} alt={meeting.studentName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {meeting.studentName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{meeting.studentName}</h3>
                  <Badge className={
                    meeting.status === 'accepted' ? 'bg-success/10 text-success' :
                    'bg-muted text-muted-foreground'
                  }>
                    {meeting.status === 'accepted' ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Upcoming
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                      </>
                    )}
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
    <DashboardLayout requiredRole="alumni">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Sessions</h1>
          <p className="text-muted-foreground">View your upcoming and past mentorship sessions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{acceptedMeetings.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <CheckCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedMeetings.length}</p>
                <p className="text-sm text-muted-foreground">Completed Sessions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>All Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming ({acceptedMeetings.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedMeetings.length})</TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <TabsContent value="upcoming">
                  <MeetingsList meetings={acceptedMeetings} emptyMessage="No upcoming sessions" />
                </TabsContent>
                <TabsContent value="completed">
                  <MeetingsList meetings={completedMeetings} emptyMessage="No completed sessions yet" />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
