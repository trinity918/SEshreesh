import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, UserCheck, Briefcase, FileText, MessageSquare, Shield, 
  ArrowRight, BarChart3, CheckCircle, XCircle, TrendingUp 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// TODO: Wire this to admin APIs (MongoDB collections: users, internships, resources, reports)

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { 
    analytics, 
    pendingUsers, 
    loadAdminData,
    approveUserAction,
    rejectUserAction,
  } = useData();

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApprove = (userId: string, userName: string) => {
    // TODO: PATCH /api/admin/users/:id/approve in MongoDB
    approveUserAction(userId);
    toast({
      title: 'User Approved',
      description: `${userName} has been approved successfully.`,
    });
  };

  const handleReject = (userId: string, userName: string) => {
    // TODO: PATCH /api/admin/users/:id/reject in MongoDB
    rejectUserAction(userId);
    toast({
      title: 'User Rejected',
      description: `${userName}'s registration has been rejected.`,
    });
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}. Here's your overview.</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalStudents || 0}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <UserCheck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalAlumni || 0}</p>
                  <p className="text-xs text-muted-foreground">Alumni</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Briefcase className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalInternships || 0}</p>
                  <p className="text-xs text-muted-foreground">Internships</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                  <FileText className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalResources || 0}</p>
                  <p className="text-xs text-muted-foreground">Resources</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalMentorships || 0}</p>
                  <p className="text-xs text-muted-foreground">Mentorships</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.pendingApprovals || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Verification Queue</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/verification">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <UserCheck className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.slice(0, 4).map((pendingUser, index) => {
                    const safeId =
                      (pendingUser as any).id ||
                      (pendingUser as any)._id ||
                      (pendingUser as any).email ||
                      `pending-${index}`;

                    return (
                      <div
                        key={safeId}
                        className="flex items-center gap-4 rounded-lg border p-3"
                      >
                        <Avatar>
                          <AvatarImage src={pendingUser.avatar} alt={pendingUser.name} />
                          <AvatarFallback>
                            {pendingUser.name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <p className="font-medium">{pendingUser.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {pendingUser.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {pendingUser.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(safeId, pendingUser.name)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(safeId, pendingUser.name)}
                          >
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

          {/* Quick Stats Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Students (This Week)</span>
                  <span className="font-medium">+12</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-3/4 rounded-full bg-primary" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Alumni (This Week)</span>
                  <span className="font-medium">+5</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-1/2 rounded-full bg-accent" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mentorship Sessions</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-2/3 rounded-full bg-success" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Internship Applications</span>
                  <span className="font-medium">48</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-4/5 rounded-full bg-info" />
                </div>
              </div>
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
                <Link to="/admin/verification">
                  <UserCheck className="h-6 w-6" />
                  <span>Verification Queue</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link to="/admin/users">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link to="/admin/moderation">
                  <Shield className="h-6 w-6" />
                  <span>Content Moderation</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link to="/admin/analytics">
                  <BarChart3 className="h-6 w-6" />
                  <span>View Analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
