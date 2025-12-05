import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Analytics data type
export interface AnalyticsData {
  totalUsers: number;
  totalInternships: number;
  totalResources: number;
  totalMentorships: number;
  totalMessages: number;
}

// ============================================
// AUTH ENDPOINTS
// ============================================

interface LoginCredentials {
  email: string;
  password: string;
  role: 'student' | 'alumni' | 'admin';
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'alumni';
  // Student fields
  year?: string;
  branch?: string;
  skills?: string[];
  interests?: string[];
  cvFileName?: string;
  // Alumni fields
  company?: string;
  designation?: string;
  industry?: string;
  expertise?: string[];
  availability?: number;
}

export const loginUser = async (credentials: LoginCredentials): Promise<any> => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
    return response.data; // Expecting { token: string }
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const registerUser = async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', data);
    if (response.status === 201) {
      return { success: true, message: 'Registration successful!' };
    }
    return { success: false, message: 'Registration failed' };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
};

export const updateMentorProfile = async (userId: string, data: Partial<any>): Promise<boolean> => {
  try {
    const response = await axios.patch(`http://localhost:5000/api/users/${userId}`, data);
    return response.status === 200;
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    return false;
  }
};

export const fetchMentors = async (filters?: { skills?: string[]; industry?: string; available?: boolean }): Promise<any[]> => {
  try {
    const params: any = {};
    if (filters?.industry) params.industry = filters.industry;
    if (filters?.available) params.available = filters.available;
    const response = await axios.get('http://localhost:5000/api/mentors', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return [];
  }
};

export const fetchMentorshipRequests = async (userId: string, role: 'student' | 'alumni'): Promise<any[]> => {
  try {
    console.log('🔍 Fetching mentorship requests for:', { 
      userId, 
      role,
      token: localStorage.getItem('alumniconnect_token') ? 'Exists' : 'Missing'
    });
    
    // Decode token to see user info
    const token = localStorage.getItem('alumniconnect_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log('🔍 Decoded token:', {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        });
      } catch (decodeError) {
        console.error('❌ Error decoding token:', decodeError);
      }
    }
    
    const response = await axios.get('http://localhost:5000/api/mentorships', { 
      params: { userId, role } 
    });
    
    console.log('✅ Mentorship requests response:', response.data);
    console.log('✅ Number of requests:', response.data.length);
    
    // Log each request for debugging
    response.data.forEach((req: any, index: number) => {
      console.log(`Request ${index}:`, {
        id: req.id || req._id,
        student: req.student,
        mentor: req.mentor,
        mentorId: req.mentorId,
        status: req.status,
        message: req.message
      });
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching mentorship requests:', error);
    
    if (error.response) {
      console.error('❌ Error status:', error.response.status);
      console.error('❌ Error data:', error.response.data);
      console.error('❌ Error config:', {
        url: error.config?.url,
        params: error.config?.params
      });
    }
    
    return [];
  }
};

export const createMentorshipRequest = async (payload: any) => {
  try {
    console.log('Frontend payload:', payload);
    console.log('Mentor ID from payload:', payload.mentorId);
    console.log('Student ID from payload:', payload.studentId);
    
    const backendPayload = {
      studentId: payload.studentId,
      mentorId: payload.mentorId,
      message: payload.purpose || payload.message || '',
    };
    
    console.log('Backend payload:', backendPayload);
    
    const response = await axios.post('http://localhost:5000/api/mentorships', backendPayload);
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    return null;
  }
};

// ============================================
// INTERNSHIPS ENDPOINTS
// ============================================

export const fetchInternships = async (): Promise<any[]> => {
  try {
    const response = await axios.get('http://localhost:5000/api/internships');
    return response.data;
  } catch (error) {
    console.error('Error fetching internships:', error);
    return [];
  }
};

export const fetchAlumniInternships = async (alumniId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`http://localhost:5000/api/internships/posted-by/${alumniId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alumni internships:', error);
    return [];
  }
};

export const createInternship = async (payload: any): Promise<any | null> => {
  try {
    const response = await axios.post('http://localhost:5000/api/internships', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating internship:', error);
    return null;
  }
};

export const applyToInternship = async (internshipId: string, application: any): Promise<any | null> => {
  try {
    console.log('Applying to internship:', internshipId, application);
    const response = await axios.post(`http://localhost:5000/api/internships/${internshipId}/apply`, application);
    return response.data;
  } catch (error) {
    console.error('Error applying to internship:', error);
    throw error;
  }
};

export const updateInternship = async (id: string, data: Partial<any>): Promise<boolean> => {
  try {
    const response = await axios.patch(`http://localhost:5000/api/internships/${id}`, data);
    return response.status === 200;
  } catch (error) {
    console.error('Error updating internship:', error);
    return false;
  }
};

// ============================================
// RESOURCES ENDPOINTS
// ============================================

export const fetchResources = async (): Promise<any[]> => {
  try {
    const response = await axios.get('http://localhost:5000/api/resources');
    return response.data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
};

export const fetchAlumniResources = async (alumniId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`http://localhost:5000/api/resources/uploaded-by/${alumniId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alumni resources:', error);
    return [];
  }
};

export const createResource = async (resource: any): Promise<any | null> => {
  try {
    const payload = {
      title: resource.title,
      description: resource.description ?? '',
      url: resource.fileUrl ?? resource.url,
      topics: resource.topics ?? [],
      uploadedBy: resource.uploadedBy,
    };

    const response = await axios.post('http://localhost:5000/api/resources', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating resource:', error);
    return null;
  }
};

export const updateResource = async (id: string, data: Partial<any>): Promise<boolean> => {
  try {
    const response = await axios.patch(`http://localhost:5000/api/resources/${id}`, data);
    return response.status === 200;
  } catch (error) {
    console.error('Error updating resource:', error);
    return false;
  }
};

// ============================================
// MESSAGING ENDPOINTS
// ============================================

export const fetchConversations = async (userId: string): Promise<any[]> => {
  try {
    console.log('🔍 fetchConversations called with userId:', userId);
    console.log('🔍 Type of userId:', typeof userId);
    
    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('❌ Invalid userId:', userId);
      return [];
    }
    
    // Trim the userId
    const trimmedUserId = userId.trim();
    console.log('🔍 Trimmed userId:', trimmedUserId);
    
    // Get token for Authorization header
    const token = localStorage.getItem('alumniconnect_token');
    const headers: any = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      // Decode token to see what's in it
      try {
        const decoded: any = jwtDecode(token);
        console.log('🔍 Decoded token userId:', decoded.userId);
        console.log('🔍 Decoded token email:', decoded.email);
        console.log('🔍 Decoded token role:', decoded.role);
      } catch (decodeError) {
        console.error('❌ Error decoding token:', decodeError);
      }
    }
    
    console.log('🔍 Making GET request to: http://localhost:5000/api/conversations');
    console.log('🔍 With query params: userId =', trimmedUserId);
    
    const response = await axios.get('http://localhost:5000/api/conversations', {
      params: { userId: trimmedUserId },
      headers
    });
    
    console.log('✅ Conversations response:', response.data);
    console.log('✅ Number of conversations:', response.data.length);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    
    if (error.response) {
      console.error('❌ Error status:', error.response.status);
      console.error('❌ Error data:', error.response.data);
      console.error('❌ Error config URL:', error.config.url);
      console.error('❌ Error config params:', error.config.params);
    }
    
    return [];
  }
};
export const fetchMessages = async (conversationId: string): Promise<any[]> => {
  try {
    const response = await axios.get(`http://localhost:5000/api/conversations/${conversationId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const sendMessage = async (payload: any): Promise<any | null> => {
  try {
    const response = await axios.post('http://localhost:5000/api/messages', payload);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

export const updateMessage = async (id: string, data: Partial<any>): Promise<boolean> => {
  try {
    const response = await axios.patch(`http://localhost:5000/api/messages/${id}`, data);
    return response.status === 200;
  } catch (error) {
    console.error('Error updating message:', error);
    return false;
  }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

export const fetchAllUsers = async (): Promise<any[]> => {
  try {
    const response = await axios.get('http://localhost:5000/api/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

export const fetchPendingUsers = async (): Promise<any[]> => {
  try {
    const response = await axios.get('http://localhost:5000/api/admin/users/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return [];
  }
};

export const fetchAllInternships = async (): Promise<any[]> => {
  try {
    const response = await axios.get('http://localhost:5000/api/admin/internships');
    return response.data;
  } catch (error) {
    console.error('Error fetching all internships:', error);
    return [];
  }
};

export const fetchAllResources = async (): Promise<any[]> => {
  try {
    const response = await axios.get('http://localhost:5000/api/admin/resources');
    return response.data;
  } catch (error) {
    console.error('Error fetching all resources:', error);
    return [];
  }
};

export const fetchAnalytics = async (): Promise<AnalyticsData | null> => {
  try {
    const response = await axios.get('http://localhost:5000/api/admin/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};

// ============================================
// CONVERSATIONS ENDPOINTS
// ============================================

export const createConversation = async (payload: any): Promise<any | null> => {
  try {
    const response = await axios.post('http://localhost:5000/api/conversations', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

export const updateMentorshipRequestStatus = async (id: string, status: 'accepted' | 'declined'): Promise<boolean> => {
  try {
    const response = await axios.patch(`http://localhost:5000/api/mentorships/${id}`, { status });
    return response.status === 200;
  } catch (error) {
    console.error('Error updating mentorship request status:', error);
    return false;
  }
};

// Additional conversation utility functions
export const markConversationAsRead = async (conversationId: string): Promise<boolean> => {
  try {
    const response = await axios.patch(`http://localhost:5000/api/conversations/${conversationId}/read`);
    return response.status === 200;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return false;
  }
};