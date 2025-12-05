import { Resource } from '@/mock/mockResources';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, FileImage, Download, User, Flag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ResourceCardProps {
  resource: Resource;
  onFlag?: (resource: Resource) => void;
  showModeration?: boolean;
}

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'PDF':
      return <FileText className="h-8 w-8 text-destructive" />;
    case 'PPT':
      return <FileImage className="h-8 w-8 text-warning" />;
    case 'DOCX':
      return <FileText className="h-8 w-8 text-info" />;
    default:
      return <FileText className="h-8 w-8 text-muted-foreground" />;
  }
};

export const ResourceCard = ({ resource, onFlag, showModeration = false }: ResourceCardProps) => {
  const handleDownload = () => {
    // TODO: Connect to MongoDB GridFS for actual file download
    toast({
      title: 'Download Started',
      description: `Downloaded ${resource.fileName} (simulated)`,
    });
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary">
            {getFileIcon(resource.fileType)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{resource.title}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{resource.uploadedByName}</span>
            </div>
          </div>
          {resource.status === 'flagged' && (
            <Badge variant="destructive">Flagged</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
        
        <div className="flex flex-wrap gap-1.5">
          {resource.topics.map((topic) => (
            <Badge key={topic} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{resource.fileType} • {resource.fileSize}</span>
          <span>{resource.downloads} downloads</span>
        </div>
      </CardContent>
      
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        {showModeration && onFlag && (
          <Button 
            variant={resource.status === 'flagged' ? 'default' : 'destructive'}
            size="icon"
            onClick={() => onFlag(resource)}
          >
            <Flag className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
