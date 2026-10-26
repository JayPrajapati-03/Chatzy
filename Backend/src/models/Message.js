const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required']
    },
    senderUsername: {
      type: String,
      required: [true, 'Sender username is required'],
      trim: true
    },
    senderDisplayName: {
      type: String,
      trim: true
    },
    senderAvatarColor: {
      type: String,
      default: '#128C7E'
    },
    text: {
      type: String,
      required: [true, 'Message text cannot be empty'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    room: {
      type: String,
      default: 'global',
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['text', 'poll'],
      default: 'text'
    },
    replyTo: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      },
      senderUsername: String,
      text: String
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        count: { type: Number, default: 1 },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        usernames: [String]
      }
    ],
    poll: {
      question: String,
      options: [
        {
          id: String,
          text: String,
          votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
          voteUsernames: [String]
        }
      ],
      totalVotes: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        username: String,
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Index for high-performance pagination by room and createdAt
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
