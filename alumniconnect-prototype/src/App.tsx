import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

// Student Pages
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { MentorSearchPage } from "./pages/student/MentorSearchPage";
import { InternshipHubPage } from "./pages/student/InternshipHubPage";
import { ResourceHubPage } from "./pages/student/ResourceHubPage";
import { StudentMeetingsPage } from "./pages/student/StudentMeetingsPage";

// Alumni Pages
import { AlumniDashboard } from "./pages/alumni/AlumniDashboard";
import { MentorshipRequestsPage } from "./pages/alumni/MentorshipRequestsPage";
import { AlumniInternshipsPage } from "./pages/alumni/AlumniInternshipsPage";
import { AlumniResourcesPage } from "./pages/alumni/AlumniResourcesPage";
import { AlumniMeetingsPage } from "./pages/alumni/AlumniMeetingsPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { VerificationQueuePage } from "./pages/admin/VerificationQueuePage";
import { ManageUsersPage } from "./pages/admin/ManageUsersPage";
import { ContentModerationPage } from "./pages/admin/ContentModerationPage";
import { AnalyticsPage } from "./pages/admin/AnalyticsPage";

// Shared Pages
import { MessagingPage } from "./pages/MessagingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Student Routes */}
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/mentors" element={<MentorSearchPage />} />
              <Route path="/student/meetings" element={<StudentMeetingsPage />} />
              <Route path="/student/internships" element={<InternshipHubPage />} />
              <Route path="/student/resources" element={<ResourceHubPage />} />
              <Route path="/student/messages" element={<MessagingPage userRole="student" />} />

              {/* Alumni Routes */}
              <Route path="/alumni" element={<AlumniDashboard />} />
              <Route path="/alumni/requests" element={<MentorshipRequestsPage />} />
              <Route path="/alumni/meetings" element={<AlumniMeetingsPage />} />
              <Route path="/alumni/internships" element={<AlumniInternshipsPage />} />
              <Route path="/alumni/resources" element={<AlumniResourcesPage />} />
              <Route path="/alumni/messages" element={<MessagingPage userRole="alumni" />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/verification" element={<VerificationQueuePage />} />
              <Route path="/admin/users" element={<ManageUsersPage />} />
              <Route path="/admin/moderation" element={<ContentModerationPage />} />
              <Route path="/admin/analytics" element={<AnalyticsPage />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
