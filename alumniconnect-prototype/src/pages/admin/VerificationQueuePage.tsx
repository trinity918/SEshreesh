import { useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { UserCheck, CheckCircle, XCircle, Mail, Building2, GraduationCap, Linkedin } from 'lucide-react';

// TODO: Wire to admin APIs for user verification (MongoDB collection: users)

export const VerificationQueuePage = () => {
  const { pendingUsers, loadAdminData, approveUserAction, rejectUserAction } = useData();

  useEffect(() => {
    loadAdminData();
  }, []);

  const pendingStudents = pendingUsers.filter(u => u.role === 'student');
  const pendingAlumni = pendingUsers.filter(u => u.role === 'alumni');

  const handleApprove = (userId: string, userName: string) => {
    // TODO: PATCH /api/admin/users/:id/approve to MongoDB
    approveUserAction(userId);
    toast({
      title: 'User Approved',
      description: `${userName} has been verified and approved.`,
    });
  };

  const handleReject = (userId: string, userName: string) => {
    // TODO: PATCH /api/admin/users/:id/reject to MongoDB
    rejectUserAction(userId);
    toast({
      title: 'User Rejected',
      description: `${userName}'s registration has been rejected.`,
    });
  };

  const UserCard = ({ pendingUser }: { pendingUser: typeof pendingUsers[0] }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={pendingUser.avatar} alt={pendingUser.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {pendingUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{pendingUser.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {pendingUser.email}
                </p>
              </div>
              <Badge className="capitalize">{pendingUser.role}</Badge>
            </div>

            {pendingUser.role === 'student' ? (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{pendingUser.year} - {pendingUser.branch}</span>
                </p>
                {pendingUser.skills && pendingUser.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pendingUser.skills.slice(0, 5).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{pendingUser.designation} at {pendingUser.company}</span>
                </p>
                <p className="text-muted-foreground">Industry: {pendingUser.industry}</p>
                {pendingUser.linkedInUrl && (
                  <a 
                    href={pendingUser.linkedInUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-info hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    View LinkedIn Profile
                  </a>
                )}
                {pendingUser.expertise && pendingUser.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pendingUser.expertise.slice(0, 5).map(exp => (
                      <Badge key={exp} variant="secondary" className="text-xs">{exp}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Registered on {new Date(pendingUser.createdAt).toLocaleDateString()}
            </p>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => handleApprove(pendingUser.id, pendingUser.name)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button variant="outline" onClick={() => handleReject(pendingUser.id, pendingUser.name)}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const UserList = ({ users, emptyMessage }: { users: typeof pendingUsers; emptyMessage: string }) => (
    users.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UserCheck className="h-16 w-16 text-muted-foreground/50" />
        <p className="mt-4 text-lg font-medium text-foreground">All caught up!</p>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    ) : (
      <div className="space-y-4">
        {users.map(user => (
          <UserCard key={user.id} pendingUser={user} />
        ))}
      </div>
    )
  );

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verification Queue</h1>
          <p className="text-muted-foreground">Review and approve new user registrations</p>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <UserCheck className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingUsers.length}</p>
                <p className="text-sm text-muted-foreground">Total Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingStudents.length}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Building2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingAlumni.length}</p>
                <p className="text-sm text-muted-foreground">Alumni</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All ({pendingUsers.length})</TabsTrigger>
                <TabsTrigger value="students">Students ({pendingStudents.length})</TabsTrigger>
                <TabsTrigger value="alumni">Alumni ({pendingAlumni.length})</TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <TabsContent value="all">
                  <UserList users={pendingUsers} emptyMessage="No pending registrations" />
                </TabsContent>
                <TabsContent value="students">
                  <UserList users={pendingStudents} emptyMessage="No pending student registrations" />
                </TabsContent>
                <TabsContent value="alumni">
                  <UserList users={pendingAlumni} emptyMessage="No pending alumni registrations" />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
