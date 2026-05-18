import { MongoPostRepository } from '../database/mongodb-post.repository.js';
import { KafkaEventPublisher } from '../messaging/kafka-event-publisher.js';
import { CreatePostUseCase } from '../../application/use-cases/create-post.usecase.js';
import { GetPostUseCase } from '../../application/use-cases/get-post.usecase.js';
import { ListPostsUseCase } from '../../application/use-cases/list-posts.usecase.js';

const postRepository = new MongoPostRepository();
const eventPublisher = new KafkaEventPublisher();

export const createPostUseCase = new CreatePostUseCase(postRepository, eventPublisher);
export const getPostUseCase = new GetPostUseCase(postRepository);
export const listPostsUseCase = new ListPostsUseCase(postRepository);
