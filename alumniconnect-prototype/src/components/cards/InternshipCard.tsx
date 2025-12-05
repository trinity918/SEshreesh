import { Internship } from '@/mock/mockInternships';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Clock, Calendar, IndianRupee, Users } from 'lucide-react';

interface InternshipCardProps {
  internship: Internship;
  onApply?: (internship: Internship) => void;
  onView?: (internship: Internship) => void;
  showApplicants?: boolean;
  hasApplied?: boolean;
}

export const InternshipCard = ({ 
  internship, 
  onApply, 
  onView,
  showApplicants = false,
  hasApplied = false,
}: InternshipCardProps) => {
  // ✅ Safely handle deadline from mock or backend
  const deadline =
    (internship as any).deadline ||
    (internship as any).lastDateToApply ||
    null;

  const isDeadlinePassed = deadline ? new Date(deadline) < new Date() : false;

  // ✅ Safely handle skills from mock (`requiredSkills`) or backend (`skillsRequired`)
  const skills =
    (internship as any).requiredSkills ||
    (internship as any).skillsRequired ||
    [];

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{internship.title}</h3>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>{internship.company}</span>
            </div>
          </div>
          {internship.status === 'flagged' ? (
            <Badge variant="destructive">Flagged</Badge>
          ) : isDeadlinePassed ? (
            <Badge variant="secondary">Closed</Badge>
          ) : (
            <Badge className="bg-success text-success-foreground">Open</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {internship.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill: string, index) => (
            <Badge key={`${skill}-${index}`} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{skills.length - 4}
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{internship.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{internship.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>
              Due:{' '}
              {deadline
                ? new Date(deadline).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          {internship.stipend && (
            <div className="flex items-center gap-1.5">
              <IndianRupee className="h-4 w-4" />
              <span>{internship.stipend}</span>
            </div>
          )}
        </div>

        {showApplicants && (
          <div className="flex items-center gap-1.5 text-sm text-accent">
            <Users className="h-4 w-4" />
            <span>{internship.applicants.length} applicants</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="gap-2">
        {onView && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView(internship)}
          >
            View Details
          </Button>
        )}
        {onApply && (
          <Button 
            className="flex-1" 
            onClick={() => onApply(internship)}
            disabled={isDeadlinePassed || hasApplied}
          >
            {hasApplied
              ? 'Applied'
              : isDeadlinePassed
              ? 'Deadline Passed'
              : 'Apply Now'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
