export class PostDTO {
  constructor({ id, title, body, createdAt }) {
    this.id = id;
    this.title = title;
    this.body = body;
    this.createdAt = createdAt;
  }

  static fromEntity(postEntity) {
    return new PostDTO({
      id: postEntity.id,
      title: postEntity.title,
      body: postEntity.body,
      createdAt: postEntity.createdAt
    });
  }
}
