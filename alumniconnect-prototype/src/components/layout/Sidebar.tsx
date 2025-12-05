import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  Briefcase,
  FileText,
  MessageSquare,
  Users,
  Shield,
  BarChart3,
  Calendar,
  Upload,
  UserCheck,
} from 'lucide-react';

interface SidebarLink {
  to: string;
  icon: React.ReactNode;
  label: string;
}

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getLinks = (): SidebarLink[] => {
    if (!user) return [];

    const basePrefix = `/${user.role}`;

    switch (user.role) {
      case 'student':
        return [
          { to: basePrefix, icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
          { to: `${basePrefix}/mentors`, icon: <Search className="h-5 w-5" />, label: 'Find Mentors' },
          { to: `${basePrefix}/meetings`, icon: <Calendar className="h-5 w-5" />, label: 'My Meetings' },
          { to: `${basePrefix}/internships`, icon: <Briefcase className="h-5 w-5" />, label: 'Internships' },
          { to: `${basePrefix}/resources`, icon: <FileText className="h-5 w-5" />, label: 'Resources' },
          { to: `${basePrefix}/messages`, icon: <MessageSquare className="h-5 w-5" />, label: 'Messages' },
        ];
      case 'alumni':
        return [
          { to: basePrefix, icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
          { to: `${basePrefix}/requests`, icon: <UserCheck className="h-5 w-5" />, label: 'Mentorship Requests' },
          { to: `${basePrefix}/meetings`, icon: <Calendar className="h-5 w-5" />, label: 'My Meetings' },
          { to: `${basePrefix}/internships`, icon: <Briefcase className="h-5 w-5" />, label: 'Internships' },
          { to: `${basePrefix}/resources`, icon: <Upload className="h-5 w-5" />, label: 'Resources' },
          { to: `${basePrefix}/messages`, icon: <MessageSquare className="h-5 w-5" />, label: 'Messages' },
        ];
      case 'admin':
        return [
          { to: basePrefix, icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
          { to: `${basePrefix}/verification`, icon: <UserCheck className="h-5 w-5" />, label: 'Verification Queue' },
          { to: `${basePrefix}/users`, icon: <Users className="h-5 w-5" />, label: 'Manage Users' },
          { to: `${basePrefix}/moderation`, icon: <Shield className="h-5 w-5" />, label: 'Content Moderation' },
          { to: `${basePrefix}/analytics`, icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics' },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border/40 bg-card">
      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => {
          const isActive = location.pathname === link.to || 
            (link.to !== `/${user?.role}` && location.pathname.startsWith(link.to));
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {link.icon}
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
