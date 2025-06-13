import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'emoji'],
    default: 'text'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Mark message as read by user
messageSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(
    read => read.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    this.readBy.push({ user: userId });
  }
  
  return this.save();
};

// Mark message as delivered to user
messageSchema.methods.markAsDelivered = function(userId) {
  const alreadyDelivered = this.deliveredTo.some(
    delivery => delivery.user.toString() === userId.toString()
  );
  
  if (!alreadyDelivered) {
    this.deliveredTo.push({ user: userId });
  }
  
  return this.save();
};

// Get message status for a specific user
messageSchema.methods.getStatusForUser = function(userId) {
  const isRead = this.readBy.some(
    read => read.user.toString() === userId.toString()
  );
  
  if (isRead) return 'read';
  
  const isDelivered = this.deliveredTo.some(
    delivery => delivery.user.toString() === userId.toString()
  );
  
  if (isDelivered) return 'delivered';
  
  return 'sent';
};

export default mongoose.model('Message', messageSchema);