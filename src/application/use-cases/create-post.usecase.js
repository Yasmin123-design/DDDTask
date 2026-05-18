import { Post } from '../../domain/entities/post.entity.js';
import { PostDTO } from '../dtos/post.dto.js';

export class CreatePostUseCase {
  constructor(postRepository, eventPublisher) {
    this.postRepository = postRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute({ title, body }) {
    const post = Post.create({ title, body });

    await this.postRepository.save(post);

    const events = post.pullDomainEvents();
    for (const event of events) {
      await this.eventPublisher.publish(event);
    }

    return PostDTO.fromEntity(post);
  }
}
