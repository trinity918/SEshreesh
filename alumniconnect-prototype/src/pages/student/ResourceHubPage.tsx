import { useEffect, useState } from 'react';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceCard } from '@/components/cards/ResourceCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter, Loader2 } from 'lucide-react';

// TODO: Connect to MongoDB resources collection for storing metadata & file URLs

const topicOptions = ['AI/ML', 'Data Science', 'Interview Prep', 'Career', 'System Design', 'Backend', 'Architecture', 'Finance', 'FinTech', 'Resume', 'Projects', 'Startups', 'Entrepreneurship'];

export const ResourceHubPage = () => {
  const { resources, loadResources, isLoading } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    loadResources({
      topics: selectedTopics.length > 0 ? selectedTopics : undefined,
    });
  }, [selectedTopics]);

  const filteredResources = resources.filter(resource => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        resource.title.toLowerCase().includes(search) ||
        resource.description.toLowerCase().includes(search) ||
        resource.topics.some(t => t.toLowerCase().includes(search))
      );
    }
    return true;
  });

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  return (
    <DashboardLayout requiredRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resource Hub</h1>
          <p className="text-muted-foreground">Access learning materials shared by alumni mentors</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2">
              <Label>Topics</Label>
              <div className="flex flex-wrap gap-2">
                {topicOptions.map((topic) => (
                  <Button
                    key={topic}
                    variant={selectedTopics.includes(topic) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>

            {selectedTopics.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTopics([])}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredResources.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium text-foreground">No resources found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource, index) => (
            <ResourceCard 
              key={resource.id || resource._id || `resource-${index}`} 
              resource={resource} 
            />
          ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
