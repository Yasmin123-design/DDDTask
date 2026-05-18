import { IPostRepository } from '../../domain/repositories/post.repository.interface.js';
import { MongoosePostModel } from './mongoose-post.schema.js';
import { PostMapper } from './post.mapper.js';

export class MongoPostRepository extends IPostRepository {

  async save(post) {
    const persistenceData = PostMapper.toPersistence(post);
    
    await MongoosePostModel.findByIdAndUpdate(
      persistenceData._id,
      persistenceData,
      { upsert: true, new: true }
    );
  }

  async findById(id) {
    const doc = await MongoosePostModel.findById(id);
    return PostMapper.toDomain(doc);
  }

  async findAll() {
    const docs = await MongoosePostModel.find().sort({ createdAt: -1 });
    return docs.map(doc => PostMapper.toDomain(doc));
  }
}
