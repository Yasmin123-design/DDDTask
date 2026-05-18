import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, required: true }
}, {
  _id: false,
  versionKey: false,
  timestamps: false
});

export const MongoosePostModel = mongoose.model('Post', postSchema);
