const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Username must be at least 2 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      index: true
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters']
    },
    avatarColor: {
      type: String,
      default: '#128C7E'
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', function (next) {
  if (!this.displayName) {
    this.displayName = this.username;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
