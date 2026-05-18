import { Post } from '../../domain/entities/post.entity.js';

export class PostMapper {

  static toDomain(mongooseDoc) {
    if (!mongooseDoc) return null;
    
    return new Post({
      id: mongooseDoc._id,
      title: mongooseDoc.title,
      body: mongooseDoc.body,
      createdAt: mongooseDoc.createdAt
    });
  }

  static toPersistence(postEntity) {
    if (!postEntity) return null;
    
    return {
      _id: postEntity.id,
      title: postEntity.title,
      body: postEntity.body,
      createdAt: postEntity.createdAt
    };
  }
}
