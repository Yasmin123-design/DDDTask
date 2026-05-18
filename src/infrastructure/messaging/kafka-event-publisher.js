import { IEventPublisher } from '../../application/interfaces/event-publisher.interface.js';
import { getKafkaProducer } from './kafka.client.js';

export class KafkaEventPublisher extends IEventPublisher {

  async publish(event) {
    try {
      const producer = getKafkaProducer();
      
      if (!producer) {
        throw new Error('[Kafka Publisher] Kafka producer is not connected or initialized yet!');
      }

      const topic = 'post-created';
      
      const payload = {
        eventName: event.eventName,
        occurredOn: event.occurredOn,
        data: event.data
      };

      await producer.send({
        topic,
        messages: [
          {
            key: event.data.id,
            value: JSON.stringify(payload)
          }
        ]
      });

      console.log(`[Kafka Publisher] Event "${event.eventName}" successfully published to topic "${topic}"`);
    } catch (error) {
      console.error(`[Kafka Publisher] Failed to publish event:`, error);
      throw error;
    }
  }
}
