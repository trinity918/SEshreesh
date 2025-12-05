import { mockMentors } from '@/mock/mockMentors';
import { mockInternships } from '@/mock/mockInternships';
import { mockMentorships } from '@/mock/mockMentorships';
import { mockResources } from '@/mock/mockResources';
import { mockConversations } from '@/mock/mockConversations';
import { mockMessages } from '@/mock/mockMessages';
import { Mentor } from '@/mock/mockMentors';
import { Internship } from '@/mock/mockInternships';
import { MentorshipRequest } from '@/mock/mockMentorships';
import { Resource } from '@/mock/mockResources';
import { Conversation } from '@/mock/mockConversations';
import { Message } from '@/mock/mockMessages';

// Simulate network latency (100-300ms)
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));

export const fetchMentors = async (filters?: { skills?: string[]; industry?: string; available?: boolean }): Promise<Mentor[]> => {
  await simulateDelay();
  let data = mockMentors;
  if (filters) {
    if (filters.industry) {
      data = data.filter(m => m.industry === filters.industry);
    }
    if (filters.available !== undefined) {
      data = data.filter(m => m.isAvailable === filters.available);
    }
    if (filters.skills && filters.skills.length > 0) {
      data = data.filter(m => filters.skills!.every(skill => m.skills.includes(skill)));
    }
  }
  return data;
};

export const fetchMentorshipRequests = async (userId: string, role: 'student' | 'alumni'): Promise<MentorshipRequest[]> => {
  await simulateDelay();
  // Filter mentorships by userId and role
  if (role === 'student') {
    return mockMentorships.filter(m => m.studentId === userId);
  } else {
    return mockMentorships.filter(m => m.mentorId === userId);
  }
};

export const createMentorshipRequest = async (payload: Omit<MentorshipRequest, 'id' | 'createdAt'>): Promise<MentorshipRequest> => {
  await simulateDelay();
  const newRequest: MentorshipRequest = {
    id: `MR${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    ...payload,
  };
  mockMentorships.push(newRequest);
  return newRequest;
};

export const fetchInternships = async (): Promise<Internship[]> => {
  await simulateDelay();
  return mockInternships;
};

export const fetchAlumniInternships = async (alumniId: string): Promise<Internship[]> => {
  await simulateDelay();
  return mockInternships.filter(i => i.postedBy === alumniId);
};

export const createInternship = async (payload: Omit<Internship, 'id' | 'applicants' | 'status' | 'createdAt'>): Promise<Internship> => {
  await simulateDelay();
  const newInternship: Internship = {
    id: `INT${Math.floor(Math.random() * 10000)}`,
    applicants: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    ...payload,
  };
  mockInternships.push(newInternship);
  return newInternship;
};

export const applyToInternship = async (internshipId: string, application: any): Promise<any> => {
  await simulateDelay();
  const internship = mockInternships.find(i => i.id === internshipId);
  if (internship) {
    const newApplication = {
      id: `APP${Math.floor(Math.random() * 10000)}`,
      appliedAt: new Date().toISOString(),
      status: 'pending',
      ...application,
    };
    internship.applicants.push(newApplication);
    return newApplication;
  }
  return null;
};

export const fetchResources = async (): Promise<Resource[]> => {
  await simulateDelay();
  return mockResources;
};

export const fetchAlumniResources = async (alumniId: string): Promise<Resource[]> => {
  await simulateDelay();
  return mockResources.filter(r => r.uploadedBy === alumniId);
};

export const createResource = async (payload: Omit<Resource, 'id' | 'downloads' | 'status' | 'createdAt'>): Promise<Resource> => {
  await simulateDelay();
  const newResource: Resource = {
    id: `RES${Math.floor(Math.random() * 10000)}`,
    downloads: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    ...payload,
  };
  mockResources.push(newResource);
  return newResource;
};

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  await simulateDelay();
  return mockConversations.filter(c => c.participants.includes(userId));
};

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  await simulateDelay();
  return mockMessages.filter(m => m.conversationId === conversationId);
};

export const sendMessage = async (payload: any): Promise<Message> => {
  await simulateDelay();
  const newMessage: Message = {
    id: `MSG${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    ...payload,
  };
  mockMessages.push(newMessage);
  return newMessage;
};

export const updateMentorProfile = async (userId: string, data: Partial<any>): Promise<boolean> => {
  await simulateDelay();
  // Find mentor and update
  const mentor = mockMentors.find(m => m.userId === userId);
  if (mentor) {
    Object.assign(mentor, data);
    return true;
  }
  return false;
};

export const updateMentorshipRequestStatus = async (id: string, status: 'accepted' | 'declined'): Promise<boolean> => {
  await simulateDelay();
  const mentorship = mockMentorships.find(m => m.id === id);
  if (mentorship) {
    mentorship.status = status;
    return true;
  }
  return false;
};

// Dummy implementations for admin APIs
export const fetchAllUsers = async (): Promise<any[]> => {
  await simulateDelay();
  return [];
};

export const fetchPendingUsers = async (): Promise<any[]> => {
  await simulateDelay();
  return [];
};

export const fetchAllInternships = async (): Promise<any[]> => {
  await simulateDelay();
  return [];
};

export const fetchAllResources = async (): Promise<any[]> => {
  await simulateDelay();
  return [];
};

export const fetchAnalytics = async (): Promise<null> => {
  await simulateDelay();
  return null;
};

// Dummy createConversation
export const createConversation = async (payload: any): Promise<any | null> => {
  await simulateDelay();
  return null;
};

// Dummy axios patch for updateMentorshipRequestStatus (not used here, handled in DataContext)
export const axios = {
  patch: async (url: string, data: any) => {
    await simulateDelay();
    return { status: 200 };
  },
};