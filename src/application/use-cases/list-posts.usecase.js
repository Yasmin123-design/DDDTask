import { PostDTO } from '../dtos/post.dto.js';

export class ListPostsUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute() {
    const posts = await this.postRepository.findAll();
    return posts.map(post => PostDTO.fromEntity(post));
  }
}
