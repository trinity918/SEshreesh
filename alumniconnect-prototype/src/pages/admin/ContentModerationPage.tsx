import { useEffect, useState } from 'react';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Shield, Flag, CheckCircle, Briefcase, FileText, AlertTriangle } from 'lucide-react';

// TODO: Wire to admin moderation APIs (MongoDB collections: internships, resources)

export const ContentModerationPage = () => {
  const { allInternships, allResources, loadAdminData, toggleContentFlagAction } = useData();

  useEffect(() => {
    loadAdminData();
  }, []);

  const flaggedInternships = allInternships.filter(i => i.status === 'flagged');
  const flaggedResources = allResources.filter(r => r.status === 'flagged');

  const handleToggleInternshipFlag = (id: string, title: string, currentStatus: string) => {
    // TODO: PATCH /api/admin/internships/:id/flag to MongoDB
    toggleContentFlagAction('internship', id);
    toast({
      title: currentStatus === 'flagged' ? 'Internship Unflagged' : 'Internship Flagged',
      description: `"${title}" has been ${currentStatus === 'flagged' ? 'unflagged' : 'flagged'}.`,
    });
  };

  const handleToggleResourceFlag = (id: string, title: string, currentStatus: string) => {
    // TODO: PATCH /api/admin/resources/:id/flag to MongoDB
    toggleContentFlagAction('resource', id);
    toast({
      title: currentStatus === 'flagged' ? 'Resource Unflagged' : 'Resource Flagged',
      description: `"${title}" has been ${currentStatus === 'flagged' ? 'unflagged' : 'flagged'}.`,
    });
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Moderation</h1>
          <p className="text-muted-foreground">Review and moderate platform content</p>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{flaggedInternships.length + flaggedResources.length}</p>
                <p className="text-sm text-muted-foreground">Total Flagged</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allInternships.length}</p>
                <p className="text-sm text-muted-foreground">Total Internships</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allResources.length}</p>
                <p className="text-sm text-muted-foreground">Total Resources</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Content Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="internships">
              <TabsList>
                <TabsTrigger value="internships">
                  Internships ({allInternships.length})
                </TabsTrigger>
                <TabsTrigger value="resources">
                  Resources ({allResources.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="internships" className="mt-6">
                {allInternships.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">No internships to review</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Posted By</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allInternships.map((internship) => (
                        <TableRow key={internship.id}>
                          <TableCell className="font-medium">{internship.title}</TableCell>
                          <TableCell>{internship.company}</TableCell>
                          <TableCell>{internship.postedByName}</TableCell>
                          <TableCell>{internship.applicants.length}</TableCell>
                          <TableCell>
                            {internship.status === 'flagged' ? (
                              <Badge variant="destructive">Flagged</Badge>
                            ) : internship.status === 'active' ? (
                              <Badge className="bg-success/10 text-success">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Closed</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={internship.status === 'flagged' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleInternshipFlag(
                                internship.id, 
                                internship.title, 
                                internship.status
                              )}
                            >
                              {internship.status === 'flagged' ? (
                                <>
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Unflag
                                </>
                              ) : (
                                <>
                                  <Flag className="mr-1 h-4 w-4" />
                                  Flag
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                {allResources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">No resources to review</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allResources.map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">{resource.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{resource.fileType}</Badge>
                          </TableCell>
                          <TableCell>{resource.uploadedByName}</TableCell>
                          <TableCell>{resource.downloads}</TableCell>
                          <TableCell>
                            {resource.status === 'flagged' ? (
                              <Badge variant="destructive">Flagged</Badge>
                            ) : (
                              <Badge className="bg-success/10 text-success">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={resource.status === 'flagged' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleToggleResourceFlag(
                                resource.id, 
                                resource.title, 
                                resource.status
                              )}
                            >
                              {resource.status === 'flagged' ? (
                                <>
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Unflag
                                </>
                              ) : (
                                <>
                                  <Flag className="mr-1 h-4 w-4" />
                                  Flag
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
