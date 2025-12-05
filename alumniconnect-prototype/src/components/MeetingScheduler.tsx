import { MentorshipRequest } from '@/mock/mockMentorships';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MessageSquare } from 'lucide-react';

// TODO: Map this to MongoDB 'meetings' collection via Express API

interface MeetingSchedulerProps {
  meetings: MentorshipRequest[];
  userRole: 'student' | 'alumni';
  title?: string;
}

const getStatusBadge = (status: MentorshipRequest['status']) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
    case 'accepted':
      return <Badge className="bg-success/10 text-success border-success/20">Accepted</Badge>;
    case 'declined':
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Declined</Badge>;
    case 'completed':
      return <Badge className="bg-muted text-muted-foreground">Completed</Badge>;
    default:
      return null;
  }
};

export const MeetingScheduler = ({ meetings, userRole, title = 'Scheduled Meetings' }: MeetingSchedulerProps) => {
  const upcomingMeetings = meetings.filter(m => m && (m.status === 'accepted' || m.status === 'pending'));
  
  if (!upcomingMeetings || upcomingMeetings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">No upcoming meetings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingMeetings.map((meeting, index) => {
          // Safely get other person info
          const otherPerson = userRole === 'student' 
            ? { 
                name: meeting.mentorName || meeting.mentor?.name || meeting.mentor?.username || 'Mentor',
                avatar: meeting.mentorAvatar || meeting.mentor?.avatar
              }
            : { 
                name: meeting.studentName || meeting.student?.name || meeting.student?.username || 'Student',
                avatar: meeting.studentAvatar || meeting.student?.avatar
              };

          // Safely get initials
          const getInitials = (name: string) => {
            if (!name || typeof name !== 'string') return '?';
            return name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
          };

          // Safely format date
          const formatDate = (dateString?: string) => {
            if (!dateString) return 'Date not set';
            try {
              const date = new Date(dateString);
              return date.toLocaleDateString();
            } catch {
              return 'Invalid date';
            }
          };

          return (
            <div
              key={meeting.id || meeting._id || `meeting-${index}`}
              className="flex items-start gap-4 rounded-lg border border-border/50 p-4 transition-colors hover:bg-secondary/50"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherPerson.avatar} alt={otherPerson.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(otherPerson.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{otherPerson.name}</p>
                  {getStatusBadge(meeting.status)}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(meeting.preferredDate)}
                  </span>
                  {meeting.preferredTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {meeting.preferredTime}
                    </span>
                  )}
                </div>
                
                {(meeting.purpose || meeting.message) && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {meeting.purpose || meeting.message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};