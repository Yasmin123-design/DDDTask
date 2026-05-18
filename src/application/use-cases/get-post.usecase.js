import { PostDTO } from '../dtos/post.dto.js';

export class GetPostUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(id) {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new Error(`Post with ID ${id} not found`);
    }
    return PostDTO.fromEntity(post);
  }
}
