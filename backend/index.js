require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Multer and path imports for file upload
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads (FIXED)
const uploadDir = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files to uploads/ directory (absolute path)
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// File upload endpoint for resources
app.post('/api/resources/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Return the file URL (served from /uploads)
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    // Accept either `username` or `name` from client
    let { username, name, email, password, company, designation, industry, expertise, availability, role } = req.body;
    username = username || name || (email ? email.split('@')[0] : undefined);

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (store username field)
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      company,
      designation,
      industry,
      expertise,
      availability,
      role,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/mentors', async (req, res) => {
  try {
    const filters = req.query;
    const query = { role: 'alumni' };

    // Apply filters if any
    if (filters.industry) {
      query.industry = filters.industry;
    }
    if (filters.available) {
      query.availability = { $gt: 0 };
    }

    const mentors = await User.find(query).select('-password');
    // Map to a consistent shape the frontend expects (id + name)
    const formatted = mentors.map(u => ({
      id: u._id,
      name: u.username || u.name || (u.email ? u.email.split('@')[0] : ''),
      email: u.email,
      company: u.company,
      designation: u.designation,
      industry: u.industry,
      expertise: u.expertise,
      availability: u.availability,
      role: u.role,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: 'Server error fetching mentors' });
  }
});

// ============================================
// CONVERSATIONS ROUTES
// ============================================

// Create Conversation model
const ConversationSchema = new mongoose.Schema({
  participants: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true }
  }],
  mentorshipRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MentorshipRequest' },
  title: { type: String, default: '' },
  lastMessage: { type: String, default: '' },
  unreadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

// Create a new conversation
app.post('/api/conversations', async (req, res) => {
  try {
    const { participants, mentorshipRequestId, title } = req.body;
    
    if (!participants || participants.length < 2) {
      return res.status(400).json({ message: 'At least 2 participants are required' });
    }

    // Check if conversation already exists between these participants
    const existingConversation = await Conversation.findOne({
      'participants.id': { $all: participants.map(p => p.id) }
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    const newConversation = new Conversation({
      participants,
      mentorshipRequestId: mentorshipRequestId || null,
      title: title || `Conversation`,
      lastMessage: '',
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newConversation.save();
    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Server error creating conversation' });
  }
});

// Get conversations for a user - FIXED VERSION
app.get('/api/conversations', async (req, res) => {
  try {
    const { userId } = req.query;
    
    console.log('📞 GET /api/conversations called');
    console.log('📞 Query parameters:', req.query);
    console.log('📞 userId from query:', userId);
    console.log('📞 Type of userId:', typeof userId);
    
    if (!userId) {
      console.log('❌ No userId provided in query');
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Trim and validate userId
    const trimmedUserId = userId.trim();
    console.log('📞 Trimmed userId:', trimmedUserId);
    
    if (!trimmedUserId || trimmedUserId === 'undefined' || trimmedUserId === 'null') {
      console.log('❌ Invalid userId after trimming:', trimmedUserId);
      return res.status(400).json({ message: 'Valid User ID is required' });
    }

    console.log('📞 Searching conversations for participant id:', trimmedUserId);
    
    // Find conversations where the user is a participant
    const conversations = await Conversation.find({
      'participants.id': trimmedUserId
    }).sort({ updatedAt: -1 });

    console.log(`📞 Found ${conversations.length} conversations`);
    
    // Log the first conversation's participants for debugging
    if (conversations.length > 0) {
      console.log('📞 First conversation participants:', conversations[0].participants);
      console.log('📞 First conversation participant ids:', conversations[0].participants.map(p => p.id));
    }

    res.json(conversations);
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
});

// Internships routes
const Internship = require('./models/Internship');
const MentorshipRequest = require('./models/MentorshipRequest');

app.get('/api/internships', async (req, res) => {
  try {
    const filters = req.query;
    const query = { status: 'active' };

    if (filters.skills) {
      const skillsArray = Array.isArray(filters.skills) ? filters.skills : [filters.skills];
      query.skillsRequired = { $in: skillsArray };
    }
    if (filters.company) {
      query.company = filters.company;
    }

    const internships = await Internship.find(query).populate('postedBy', '-password');
    res.json(internships);
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ message: 'Server error fetching internships' });
  }
});

// New route for mentorship requests by userId and role
app.get('/api/mentorships', async (req, res) => {
  try {
    const { userId, role } = req.query;
    if (!userId || !role) {
      return res.status(400).json({ message: 'Missing userId or role query parameter' });
    }
    let mentorships;
    if (role === 'student') {
      mentorships = await MentorshipRequest.find({ student: userId })
        .populate('mentor', 'username email company designation')
        .populate('student', 'username email');
    } else if (role === 'alumni') {
      mentorships = await MentorshipRequest.find({ mentor: userId })
        .populate('student', 'username email')
        .populate('mentor', 'username email company designation');
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
    res.json(mentorships);
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    res.status(500).json({ message: 'Server error fetching mentorship requests' });
  }
});

app.get('/api/internships/posted-by/:alumniId', async (req, res) => {
  try {
    const { alumniId } = req.params;
    const internships = await Internship.find({ postedBy: alumniId });
    res.json(internships);
  } catch (error) {
    console.error('Error fetching alumni internships:', error);
    res.status(500).json({ message: 'Server error fetching alumni internships' });
  }
});

app.post('/api/internships', async (req, res) => {
  try {
    const { title, description, company, location, duration, skillsRequired, postedBy } = req.body;
    if (!title || !description || !company || !postedBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const newInternship = new Internship({
      title,
      description,
      company,
      location,
      duration,
      skillsRequired,
      postedBy,
      applicants: [],
      status: 'active',
    });
    await newInternship.save();
    res.status(201).json(newInternship);
  } catch (error) {
    console.error('Error creating internship:', error);
    res.status(500).json({ message: 'Server error creating internship' });
  }
});

app.post('/api/internships/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, resumeFileName } = req.body;
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    const internship = await Internship.findById(id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    const alreadyApplied = internship.applicants.some(app => app.student.toString() === studentId);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied to this internship' });
    }
    internship.applicants.push({
      student: studentId,
      resumeFileName,
      appliedAt: new Date(),
      status: 'pending',
    });
    await internship.save();
    res.status(201).json(internship);
  } catch (error) {
    console.error('Error applying to internship:', error);
    res.status(500).json({ message: 'Server error applying to internship' });
  }
});

// Resources routes
const Resource = require('./models/Resource');

app.get('/api/resources', async (req, res) => {
  try {
    const filters = req.query;
    const query = { status: 'active' };

    if (filters.topics) {
      const topicsArray = Array.isArray(filters.topics) ? filters.topics : [filters.topics];
      query.topics = { $in: topicsArray };
    }

    const resources = await Resource.find(query).populate('uploadedBy', '-password');
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Server error fetching resources' });
  }
});

app.get('/api/resources/uploaded-by/:alumniId', async (req, res) => {
  try {
    const { alumniId } = req.params;
    const resources = await Resource.find({ uploadedBy: alumniId });
    res.json(resources);
  } catch (error) {
    console.error('Error fetching alumni resources:', error);
    res.status(500).json({ message: 'Server error fetching alumni resources' });
  }
});

app.post('/api/resources', async (req, res) => {
  try {
    const { title, description, url, topics, uploadedBy } = req.body;
    if (!title || !url || !uploadedBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const newResource = new Resource({
      title,
      description,
      url,
      topics,
      uploadedBy,
      downloads: 0,
      status: 'active',
    });
    await newResource.save();
    res.status(201).json(newResource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Server error creating resource' });
  }
});

app.post('/api/mentorships', async (req, res) => {
  try {
    const { studentId, mentorId, message } = req.body;
    if (!studentId || !mentorId) {
      return res.status(400).json({ message: 'Student and Mentor IDs are required' });
    }
    const MentorshipRequest = require('./models/MentorshipRequest');
    const User = require('./models/User');

    // Validate users exist
    const student = await User.findById(studentId);
    const mentor = await User.findById(mentorId);
    if (!student || !mentor) {
      return res.status(404).json({ message: 'Student or Mentor not found' });
    }

    const existingRequest = await MentorshipRequest.findOne({ student: studentId, mentor: mentorId, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'Mentorship request already pending' });
    }

    const newRequest = new MentorshipRequest({
      student: studentId,
      mentor: mentorId,
      message,
      status: 'pending',
    });

    await newRequest.save();

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    res.status(500).json({ message: 'Server error creating mentorship request' });
  }
});

// Endpoint to update mentorship request status and create conversation on acceptance
app.patch('/api/mentorships/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const MentorshipRequest = require('./models/MentorshipRequest');
    const User = require('./models/User');
    
    const mentorshipRequest = await MentorshipRequest.findById(id)
      .populate('student', 'username email')
      .populate('mentor', 'username email');
      
    if (!mentorshipRequest) {
      return res.status(404).json({ message: 'Mentorship request not found' });
    }
    
    mentorshipRequest.status = status;
    await mentorshipRequest.save();

    if (status === 'accepted') {
      // Create conversation
      const Conversation = require('./models/Conversation');
      
      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        'participants.id': { $all: [mentorshipRequest.student._id.toString(), mentorshipRequest.mentor._id.toString()] }
      });

      if (!existingConversation) {
        const newConversation = new Conversation({
          participants: [
            {
              id: mentorshipRequest.student._id.toString(),
              name: mentorshipRequest.student.username || mentorshipRequest.student.email.split('@')[0],
              role: 'student'
            },
            {
              id: mentorshipRequest.mentor._id.toString(),
              name: mentorshipRequest.mentor.username || mentorshipRequest.mentor.email.split('@')[0],
              role: 'alumni'
            }
          ],
          mentorshipRequestId: id,
          title: `Mentorship: ${mentorshipRequest.student.username} & ${mentorshipRequest.mentor.username}`,
          lastMessage: '',
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await newConversation.save();
        console.log('✅ Created new conversation for accepted mentorship');
      } else {
        console.log('✅ Conversation already exists for these participants');
      }
    }

    res.json(mentorshipRequest);
  } catch (error) {
    console.error('Error updating mentorship request status:', error);
    res.status(500).json({ message: 'Server error updating mentorship request status' });
  }
});

// Message model
const MessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

app.post('/api/messages', async (req, res) => {
  try {
    const { conversationId, senderId, senderName, content } = req.body;
    if (!conversationId || !senderId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const message = new Message({
      conversationId,
      senderId,
      senderName: senderName || 'User',
      content,
      timestamp: new Date(),
    });

    await message.save();

    // Update conversation lastMessage and updatedAt
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      updatedAt: new Date(),
      $inc: { unreadCount: 1 },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// ============================================
// ADDITIONAL CONVERSATION ROUTES
// ============================================

// Mark conversation as read
app.patch('/api/conversations/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedConversation = await Conversation.findByIdAndUpdate(
      id,
      { unreadCount: 0 },
      { new: true }
    );

    if (!updatedConversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(updatedConversation);
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ message: 'Server error marking conversation as read' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`AlumniConnect backend server running on port ${port}`);
});