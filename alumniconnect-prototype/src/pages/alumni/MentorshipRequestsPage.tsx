import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, MessageSquare, CheckCircle, XCircle, Users, Hourglass, Mail, RefreshCw } from 'lucide-react';

export const MentorshipRequestsPage = () => {
  const { user } = useAuth();
  const { mentorshipRequests, loadMentorshipRequests, updateMentorshipRequestStatus } = useData();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    console.log('🔄 Loading mentorship requests for alumni:', {
      userId: user?.id,
      role: user?.role
    });
    
    await loadMentorshipRequests();
    setIsLoading(false);
  };

  // Debug: Log what we received
  console.log('📊 All mentorship requests received:', mentorshipRequests);
  console.log('📊 Number of requests:', mentorshipRequests.length);
  
  // IMPORTANT: The backend ALREADY filters requests for this alumni
  // So we should use ALL requests returned
  const myRequests = [...mentorshipRequests];
  
  console.log('✅ My requests (all returned by backend):', myRequests.length);

  const pendingRequests = myRequests.filter(m => m.status === 'pending');
  const acceptedRequests = myRequests.filter(m => m.status === 'accepted');
  const declinedRequests = myRequests.filter(m => m.status === 'declined');
  const completedRequests = myRequests.filter(m => m.status === 'completed');

  const handleAccept = async (id: string) => {
    try {
      console.log('✅ Accepting request ID:', id);
      await updateMentorshipRequestStatus(id, 'accepted');
      toast({
        title: 'Request Accepted',
        description: 'The mentorship session has been scheduled.',
      });
      // Reload to see updated status
      await loadRequests();
    } catch (error) {
      console.error('❌ Error accepting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept request',
        variant: 'destructive',
      });
    }
  };

  const handleDecline = async (id: string) => {
    try {
      console.log('❌ Declining request ID:', id);
      await updateMentorshipRequestStatus(id, 'declined');
      toast({
        title: 'Request Declined',
        description: 'The student has been notified.',
      });
      // Reload to see updated status
      await loadRequests();
    } catch (error) {
      console.error('❌ Error declining request:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline request',
        variant: 'destructive',
      });
    }
  };

  const RequestCard = ({ request, showActions = false }: { request: any; showActions?: boolean }) => {
    // Get request ID (could be id or _id)
    const requestId = request.id || request._id;
    
    // Get student info - backend returns populated student object
    const student = request.student || {};
    const studentName = student.name || student.username || 'Student';
    const studentEmail = student.email || '';
    const studentAvatar = student.avatar || '';
    
    // Get purpose/message
    const purpose = request.purpose || request.message || 'No purpose specified';
    
    // Get mentor info (for debugging)
    const mentor = request.mentor || {};
    const mentorId = mentor._id || mentor.id || request.mentorId;
    
    console.log('📝 Request Card details:', {
      requestId,
      studentName,
      mentorId,
      status: request.status
    });

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={studentAvatar} alt={studentName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {studentName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{studentName}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {studentEmail}
                  </p>
                </div>
                {!showActions && (
                  <Badge className={
                    request.status === 'pending' ? 'bg-warning/10 text-warning' :
                    request.status === 'accepted' ? 'bg-success/10 text-success' :
                    request.status === 'completed' ? 'bg-muted text-muted-foreground' :
                    'bg-destructive/10 text-destructive'
                  }>
                    {request.status}
                  </Badge>
                )}
              </div>
              
              <div className="mt-3 space-y-2">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Purpose:</span> {purpose}
                </p>
                {request.preferredDate && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(request.preferredDate).toLocaleDateString()}
                    </span>
                    {request.preferredTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {request.preferredTime}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {showActions && (
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => handleAccept(requestId)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button variant="outline" onClick={() => handleDecline(requestId)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const RequestsList = ({ requests, emptyMessage, showActions = false }: { 
    requests: any[]; 
    emptyMessage: string;
    showActions?: boolean;
  }) => (
    requests.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadRequests}
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    ) : (
      <div className="space-y-4">
        {requests.map((request, index) => (
          <RequestCard 
            key={request.id || request._id || `request-${index}`}
            request={request} 
            showActions={showActions} 
          />
        ))}
      </div>
    )
  );

  return (
    <DashboardLayout requiredRole="alumni">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mentorship Requests</h1>
            <p className="text-muted-foreground">Manage requests from students seeking your guidance</p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadRequests}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Hourglass className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
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
                <p className="text-2xl font-bold">{acceptedRequests.length}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedRequests.length}</p>
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
                <p className="text-2xl font-bold">{declinedRequests.length}</p>
                <p className="text-xs text-muted-foreground">Declined</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
                <TabsTrigger value="accepted">Accepted ({acceptedRequests.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
                <TabsTrigger value="declined">Declined ({declinedRequests.length})</TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <TabsContent value="pending">
                  <RequestsList requests={pendingRequests} emptyMessage="No pending requests" showActions />
                </TabsContent>
                <TabsContent value="accepted">
                  <RequestsList requests={acceptedRequests} emptyMessage="No accepted requests" />
                </TabsContent>
                <TabsContent value="completed">
                  <RequestsList requests={completedRequests} emptyMessage="No completed sessions yet" />
                </TabsContent>
                <TabsContent value="declined">
                  <RequestsList requests={declinedRequests} emptyMessage="No declined requests" />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};