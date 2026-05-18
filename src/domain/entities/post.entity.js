import { v4 as uuidv4 } from 'uuid';
import { PostCreatedEvent } from '../events/post-created.event.js';

export class Post {
  #id;
  #title;
  #body;
  #createdAt;
  #domainEvents = [];

  constructor({ id, title, body, createdAt = new Date() }) {
    this.validate(title, body);

    this.#id = id || uuidv4();
    this.#title = title;
    this.#body = body;
    this.#createdAt = createdAt;
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get body() {
    return this.#body;
  }

  get createdAt() {
    return this.#createdAt;
  }

  validate(title, body) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new Error('Post title is required and must be a non-empty string');
    }
    if (!body || typeof body !== 'string' || body.trim() === '') {
      throw new Error('Post body is required and must be a non-empty string');
    }
  }

  addDomainEvent(event) {
    this.#domainEvents.push(event);
  }

  pullDomainEvents() {
    const events = [...this.#domainEvents];
    this.#domainEvents = [];
    return events;
  }

  static create({ title, body }) {
    const post = new Post({
      id: uuidv4(),
      title,
      body,
      createdAt: new Date()
    });

    post.addDomainEvent(new PostCreatedEvent(post));

    return post;
  }
}
