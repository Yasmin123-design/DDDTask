import express from 'express';
import cors from 'cors';
import { postRouter } from './routes/post.routes.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';

const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/posts', postRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the DDD Node.js + Express REST API (Posts Microservice)',
    version: '1.0.0',
    details: 'MongoDB and Apache Kafka Event Driven Architecture',
    endpoints: {
      createPost: 'POST /api/posts { title, body }',
      getPost: 'GET /api/posts/:id',
      listPosts: 'GET /api/posts'
    }
  });
});

app.use((req, res, next) => {
  const err = new Error(`Cannot find endpoint "${req.originalUrl}" on this server`);
  err.status = 404;
  next(err);
});

app.use(globalErrorHandler);

export default app;
