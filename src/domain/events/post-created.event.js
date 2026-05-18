export class PostCreatedEvent {
  constructor(post) {
    this.eventName = 'PostCreated';
    this.occurredOn = new Date();
    this.data = {
      id: post.id,
      title: post.title,
      body: post.body,
      createdAt: post.createdAt
    };
  }
}
