import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroupChat: {
    type: Boolean,
    default: false
  },
  chatName: {
    type: String,
    trim: true
  },
  chatDescription: {
    type: String,
    trim: true
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure participants array has at least 2 users for regular chats
chatSchema.pre('save', function(next) {
  if (!this.isGroupChat && this.participants.length !== 2) {
    const error = new Error('A regular chat must have exactly 2 participants');
    return next(error);
  }
  next();
});

// Update last activity
chatSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Get chat name for display
chatSchema.methods.getChatName = function(currentUserId) {
  if (this.isGroupChat) {
    return this.chatName || 'Group Chat';
  }
  
  // For one-on-one chats, return the other participant's name
  const otherParticipant = this.participants.find(
    participant => participant._id.toString() !== currentUserId.toString()
  );
  
  return otherParticipant?.username || 'Unknown User';
};

export default mongoose.model('Chat', chatSchema);