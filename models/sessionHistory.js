import mongoose from 'mongoose';

const SessionHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  segments: {
    type: [String],
    default: [],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.SessionHistory || mongoose.model('SessionHistory', SessionHistorySchema);
