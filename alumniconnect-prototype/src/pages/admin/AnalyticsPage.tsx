import { useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, UserCheck, Briefcase, FileText, MessageSquare, 
  TrendingUp, BarChart3, PieChart, Activity 
} from 'lucide-react';

// TODO: Wire to admin analytics APIs (MongoDB aggregation across multiple collections)

export const AnalyticsPage = () => {
  const { analytics, loadAdminData, allUsers, allInternships, allResources } = useData();

  useEffect(() => {
    loadAdminData();
  }, []);

  const activeStudents = allUsers.filter(u => u.role === 'student' && u.status === 'approved').length;
  const activeAlumni = allUsers.filter(u => u.role === 'alumni' && u.status === 'approved').length;
  const activeInternships = allInternships.filter(i => i.status === 'active').length;
  const totalApplications = allInternships.reduce((acc, i) => acc + i.applicants.length, 0);
  const totalDownloads = allResources.reduce((acc, r) => acc + r.downloads, 0);

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
          <p className="text-muted-foreground">Overview of platform usage and engagement</p>
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeStudents}</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +12 this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Alumni</CardTitle>
              <UserCheck className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeAlumni}</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +5 this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Internships</CardTitle>
              <Briefcase className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeInternships}</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +3 this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mentorship Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.totalMentorships || 0}</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +8 this week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Internship Applications</span>
                  <span className="font-medium">{totalApplications}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-secondary">
                  <div 
                    className="h-3 rounded-full bg-primary" 
                    style={{ width: `${Math.min((totalApplications / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Resource Downloads</span>
                  <span className="font-medium">{totalDownloads}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-secondary">
                  <div 
                    className="h-3 rounded-full bg-accent" 
                    style={{ width: `${Math.min((totalDownloads / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Pending Approvals</span>
                  <span className="font-medium">{analytics?.pendingApprovals || 0}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-secondary">
                  <div 
                    className="h-3 rounded-full bg-warning" 
                    style={{ width: `${Math.min(((analytics?.pendingApprovals || 0) / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Students</p>
                      <p className="text-sm text-muted-foreground">{activeStudents} active accounts</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {allUsers.length > 0 
                      ? Math.round((activeStudents / allUsers.length) * 100)
                      : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">Alumni Mentors</p>
                      <p className="text-sm text-muted-foreground">{activeAlumni} active mentors</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-accent">
                    {allUsers.length > 0 
                      ? Math.round((activeAlumni / allUsers.length) * 100)
                      : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Administrators</p>
                      <p className="text-sm text-muted-foreground">1 admin account</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-muted-foreground">
                    {allUsers.length > 0 
                      ? Math.round((1 / allUsers.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60">
                  <FileText className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resources Shared</p>
                  <p className="text-3xl font-bold">{allResources.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/60">
                  <Briefcase className="h-7 w-7 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-3xl font-bold">{totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-success to-success/60">
                  <TrendingUp className="h-7 w-7 text-success-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resource Downloads</p>
                  <p className="text-3xl font-bold">{totalDownloads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
