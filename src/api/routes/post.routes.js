import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';

const router = Router();
const controller = new PostController();

router.post('/', controller.create.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.get('/', controller.getAll.bind(controller));

export const postRouter = router;
