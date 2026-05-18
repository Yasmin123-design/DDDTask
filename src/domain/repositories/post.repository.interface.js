
export class IPostRepository {
  async save(post) {
    throw new Error('IPostRepository.save method not implemented');
  }

  async findById(id) {
    throw new Error('IPostRepository.findById method not implemented');
  }

  async findAll() {
    throw new Error('IPostRepository.findAll method not implemented');
  }
}
