import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Users, Briefcase, FileText, MessageSquare, Shield, ArrowRight, Star } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg hero-gradient">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AlumniConnect</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient py-20 text-primary-foreground">
        <div className="container text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl animate-fade-in">
            Connect. Learn. Grow.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg opacity-90 animate-slide-up">
            AlumniConnect bridges the gap between alumni mentors and students. 
            Find mentorship, discover internships, and access valuable resources.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 animate-slide-up">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">
                Join as Student <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/register">Become a Mentor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-center text-3xl font-bold">Why AlumniConnect?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Everything you need to kickstart your career journey
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="card-hover">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Find Mentors</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect with experienced alumni who can guide your career path
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                  <Briefcase className="h-7 w-7 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Internships</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Discover exclusive internship opportunities posted by alumni
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-success/10">
                  <FileText className="h-7 w-7 text-success" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Resources</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Access curated learning materials and career guides
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16">
        <div className="container text-center">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-muted-foreground">Join thousands of students and alumni on AlumniConnect</p>
          <Button size="lg" className="mt-6" asChild>
            <Link to="/register">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© 2024 AlumniConnect Network System</p>
          <p className="text-sm text-muted-foreground">Built for Demo & Evaluation</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
