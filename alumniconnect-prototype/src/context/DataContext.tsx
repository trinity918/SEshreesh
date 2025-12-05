import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type Mentor = any;
type Internship = any;
type InternshipApplication = any;
type Resource = any;
type Message = any;
type Conversation = any;
type MentorshipRequest = any;
type User = any;

interface AnalyticsData {
  totalUsers: number;
  totalInternships: number;
  totalResources: number;
  totalMentorships: number;
  totalMessages: number;
}
import * as apiMock from '@/services/apiMock';

const api = apiMock;
// TODO: This context manages local state for the prototype
// In production, most of this state will come directly from MongoDB via API calls

interface DataContextType {
  // Mentors
  mentors: Mentor[];
  loadMentors: (filters?: { skills?: string[]; industry?: string; available?: boolean }) => Promise<void>;
  updateMentorProfileAction: (userId: string, data: Partial<any>) => Promise<boolean>;
  
  // Mentorships
  mentorshipRequests: MentorshipRequest[];
  loadMentorshipRequests: () => Promise<void>;
  createMentorship: (data: Omit<MentorshipRequest, 'id' | 'createdAt'>) => Promise<void>;
  updateMentorshipRequestStatus: (id: string, status: 'accepted' | 'declined') => Promise<void>;
  
  // Internships
  internships: Internship[];
  myInternships: Internship[];
  loadInternships: (filters?: { skills?: string[]; company?: string }) => Promise<void>;
  loadMyInternships: () => Promise<void>;
  addInternship: (data: Omit<Internship, 'id' | 'applicants' | 'status' | 'createdAt'>) => Promise<void>;
  applyToInternship: (internshipId: string, application: Omit<InternshipApplication, 'id' | 'appliedAt' | 'status'>) => Promise<void>;
  
  // Resources
  resources: Resource[];
  myResources: Resource[];
  loadResources: (filters?: { topics?: string[] }) => Promise<void>;
  loadMyResources: () => Promise<void>;
  addResource: (data: Omit<Resource, 'id' | 'downloads' | 'status' | 'createdAt'>) => Promise<void>;
  
  // Messages
  conversations: Conversation[];
  messages: Message[];
  activeConversation: Conversation | null;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendNewMessage: (content: string) => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  
  // Admin
  allUsers: User[];
  pendingUsers: User[];
  allInternships: Internship[];
  allResources: Resource[];
  analytics: AnalyticsData | null;
  loadAdminData: () => Promise<void>;
  approveUserAction: (userId: string) => void;
  rejectUserAction: (userId: string) => void;
  toggleFreezeUser: (userId: string) => void;
  toggleContentFlagAction: (type: 'internship' | 'resource', id: string) => void;
  
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // State
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [myInternships, setMyInternships] = useState<Internship[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  
  // Admin state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  // Helper function to get user ID consistently
  const getUserId = (): string | null => {
    if (!user) return null;
    
    // Check if user object has id or _id
    const userId = (user as any).id || (user as any)._id;
    
    // Validate the user ID
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('Invalid user ID:', userId);
      return null;
    }
    
    return userId;
  };
  
  // Load mentors
  const loadMentors = async (filters?: { skills?: string[]; industry?: string; available?: boolean }) => {
    setIsLoading(true);
    // TODO: Replace with GET /api/mentors from MongoDB
    const data = await api.fetchMentors(filters);
    setMentors(data);
    setIsLoading(false);
  };
  
  // Update mentor profile
  const updateMentorProfileAction = async (userId: string, data: Partial<any>) => {
    const success = await api.updateMentorProfile(userId, data);
    if (success) {
      await loadMentors();
    }
    return success;
  };
  
  // Load mentorship requests
  const loadMentorshipRequests = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    setIsLoading(true);
    // TODO: Replace with GET /api/mentorships from MongoDB
    const data = await api.fetchMentorshipRequests(userId, user?.role as 'student' | 'alumni');
    setMentorshipRequests(data);
    setIsLoading(false);
  };
  
  // Create mentorship request
  const createMentorship = async (data: Omit<MentorshipRequest, 'id' | 'createdAt'>) => {
    // TODO: Replace with POST /api/mentorships to MongoDB
    const newRequest = await api.createMentorshipRequest(data);
    setMentorshipRequests(prev => [...prev, newRequest]);
  };
  
  // Update mentorship status
  const updateMentorshipRequestStatus = async (id: string, status: 'accepted' | 'declined') => {
    const userId = getUserId();
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Call backend API to update mentorship request status
      const success = await api.updateMentorshipRequestStatus(id, status);
      if (success) {
        // Update local state
        setMentorshipRequests(prev =>
          prev.map(req => (req.id === id || req._id === id ? { ...req, status } : req))
        );
        
        // Load conversations if accepted (backend now creates conversation automatically)
        if (status === 'accepted') {
          await loadConversations();
        }
      }
    } catch (error) {
      console.error('Error updating mentorship request status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load internships
  const loadInternships = async (filters?: { skills?: string[]; company?: string }) => {
    setIsLoading(true);
    // Replace with GET /api/internships from MongoDB
    const data = await api.fetchInternships();
    setInternships(data);
    setIsLoading(false);
  };
  
  // Load my internships (for alumni)
  const loadMyInternships = async () => {
    const userId = getUserId();
    if (!userId || user?.role !== 'alumni') return;
    
    setIsLoading(true);
    // Replace with GET /api/internships/posted-by/:alumniId from MongoDB
    const data = await api.fetchAlumniInternships(userId);
    setMyInternships(data);
    setIsLoading(false);
  };
  
  // Add internship
  const addInternship = async (data: Omit<Internship, 'id' | 'applicants' | 'status' | 'createdAt'>) => {
    // Replace with POST /api/internships to MongoDB
    const newInternship = await api.createInternship(data);
    await loadMyInternships();
    setMyInternships(prev => [...prev, newInternship]);
    setInternships(prev => [...prev, newInternship]);
  };
  
  // Apply to internship
  const applyToInternshipAction = async (internshipId: string, application: Omit<InternshipApplication, 'id' | 'appliedAt' | 'status'>) => {
    // Replace with POST /api/internships/:id/apply to MongoDB
    const newApplication = await api.applyToInternship(internshipId, application);
    setInternships(prev =>
      prev.map(int =>
        int.id === internshipId || int._id === internshipId
          ? { ...int, applicants: [...(int.applicants || []), newApplication] }
          : int
      )
    );
  };
  
  // Load resources
  const loadResources = async (filters?: { topics?: string[] }) => {
    setIsLoading(true);
    // Replace with GET /api/resources from MongoDB
    const data = await api.fetchResources();
    setResources(data);
    setIsLoading(false);
  };
  
  // Load my resources (for alumni)
  const loadMyResources = async () => {
    const userId = getUserId();
    if (!userId || user?.role !== 'alumni') return;
    
    setIsLoading(true);
    // Replace with GET /api/resources/uploaded-by/:alumniId from MongoDB
    const data = await api.fetchAlumniResources(userId);
    setMyResources(data);
    setIsLoading(false);
  };
  
  // Add resource
  const addResource = async (data: Omit<Resource, 'id' | 'downloads' | 'status' | 'createdAt'>) => {
    // Replace with POST /api/resources to MongoDB
    const newResource = await api.createResource(data);
    setMyResources(prev => [...prev, newResource]);
    setResources(prev => [...prev, newResource]);
  };
  
  // Load conversations
  const loadConversations = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      console.log('Loading conversations for user ID:', userId);
      console.log('Full user object:', user);
      
      const data = await api.fetchConversations(userId);
      console.log('Fetched conversations:', data);
      
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load messages
  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    // TODO: Replace with GET /api/messages/:conversationId from MongoDB
    const data = await api.fetchMessages(conversationId);
    setMessages(data);
    setIsLoading(false);
  };
  
  // Send message
  const sendNewMessage = async (content: string) => {
    const userId = getUserId();
    if (!userId || !activeConversation) return;
    
    // TODO: Replace with POST /api/messages to MongoDB
    const newMessage = await api.sendMessage({
      conversationId: activeConversation.id || activeConversation._id,
      senderId: userId,
      senderName: user?.name || 'User',
      content,
    });
    setMessages(prev => [...prev, newMessage]);
  };
  
  // Admin functions
  const loadAdminData = async () => {
    if (!user || user.role !== 'admin') return;
    setIsLoading(true);
    // Replace with admin API calls to MongoDB
    const [users, pending, ints, res, stats] = await Promise.all([
      api.fetchAllUsers(),
      api.fetchPendingUsers(),
      api.fetchAllInternships(),
      api.fetchAllResources(),
      api.fetchAnalytics(),
    ]);
    setAllUsers(users);
    setPendingUsers(pending);
    setAllInternships(ints);
    setAllResources(res);
    setAnalytics(stats);
    setIsLoading(false);
  };
  
  const approveUserAction = (userId: string) => {
    // TODO: Replace with PATCH /api/admin/users/:id/approve in MongoDB
    setPendingUsers(prev => prev.filter(u => u.id !== userId));
    setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: 'approved' as const, verified: true } : u)));
  };
  
  const rejectUserAction = (userId: string) => {
    // TODO: Replace with PATCH /api/admin/users/:id/reject in MongoDB
    setPendingUsers(prev => prev.filter(u => u.id !== userId));
    setAllUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: 'rejected' as const } : u)));
  };
  
  const toggleFreezeUser = (userId: string) => {
    // TODO: Replace with PATCH /api/admin/users/:id/freeze in MongoDB
    setAllUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? { ...u, status: u.status === 'frozen' ? 'approved' as const : 'frozen' as const }
          : u
      )
    );
  };
  
  const toggleContentFlagAction = (type: 'internship' | 'resource', id: string) => {
    // TODO: Replace with PATCH /api/admin/:type/:id/flag in MongoDB
    if (type === 'internship') {
      setAllInternships(prev =>
        prev.map(i =>
          i.id === id ? { ...i, status: i.status === 'flagged' ? 'active' as const : 'flagged' as const } : i
        )
      );
    } else {
      setAllResources(prev =>
        prev.map(r =>
          r.id === id ? { ...r, status: r.status === 'flagged' ? 'active' as const : 'flagged' as const } : r
        )
      );
    }
  };
  
  return (
    <DataContext.Provider
      value={{
        mentors,
        loadMentors,
        mentorshipRequests,
        loadMentorshipRequests,
        createMentorship,
        updateMentorshipRequestStatus,
        internships,
        myInternships,
        loadInternships,
        loadMyInternships,
        addInternship,
        applyToInternship: applyToInternshipAction,
        resources,
        myResources,
        loadResources,
        loadMyResources,
        addResource,
        conversations,
        messages,
        activeConversation,
        loadConversations,
        loadMessages,
        sendNewMessage,
        setActiveConversation,
        allUsers,
        pendingUsers,
        allInternships,
        allResources,
        analytics,
        loadAdminData,
        approveUserAction,
        rejectUserAction,
        toggleFreezeUser,
        toggleContentFlagAction,
        updateMentorProfileAction,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};