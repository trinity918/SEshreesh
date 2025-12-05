import { Mentor } from '@/context/DataContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Star, Users, Calendar } from 'lucide-react';

interface MentorCardProps {
  mentor: Mentor;
  onRequestMentorship: (mentor: Mentor) => void;
}

export const MentorCard = ({ mentor, onRequestMentorship }: MentorCardProps) => {
  // ✅ Use 'availability' field from backend (not 'availableSlots')
  const availableSlots = mentor.availability ?? 0;
  const isAvailable = availableSlots > 0;

  // ✅ Use 'expertise' field from backend (not 'skills')
  const skills = Array.isArray(mentor.expertise) ? mentor.expertise : [];

  return (
    <Card className="card-hover overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src={mentor.avatar} alt={mentor.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {mentor.name?.split(' ').map(n => n[0]).join('') || 'M'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{mentor.name}</h3>
            <p className="text-sm text-muted-foreground">{mentor.designation || 'Mentor'}</p>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>{mentor.company || 'Not specified'}</span>
            </div>
          </div>

          {isAvailable ? (
            <Badge variant="outline" className="border-success text-success">
              Available
            </Badge>
          ) : (
            <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
              Unavailable
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">{mentor.bio || 'No bio available'}</p>

        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill, index) => (
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

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-warning">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-medium">{mentor.rating || '4.5'}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{mentor.totalMentees || 0} mentees</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{availableSlots} slots left</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onRequestMentorship(mentor)}
          disabled={!isAvailable}
        >
          {isAvailable ? 'Request Mentorship' : 'Currently Unavailable'}
        </Button>
      </CardFooter>
    </Card>
  );
};