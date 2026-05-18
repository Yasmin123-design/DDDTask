import { createPostUseCase, getPostUseCase, listPostsUseCase } from '../../infrastructure/di/container.js';
import { ApiResponse } from '../utils/api-response.js';

export class PostController {

  async create(req, res, next) {
    try {
      const { title, body } = req.body;
      const postDto = await createPostUseCase.execute({ title, body });
      
      return ApiResponse.success(res, postDto, 201);
    } catch (error) {
      next(error);
    }
  }


  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const postDto = await getPostUseCase.execute(id);
      
      return ApiResponse.success(res, postDto, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const posts = await listPostsUseCase.execute();
      
      return ApiResponse.success(res, posts, 200);
    } catch (error) {
      next(error);
    }
  }
}
