import { sendRealEmail } from './email.helper.js';
import { sendRealPushNotification } from './notification.helper.js';

export class EmailEventConsumer {
  constructor(kafkaConsumer) {
    this.consumer = kafkaConsumer;
  }

  async start() {
    const topic = 'post-created';
    
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      console.log(`[Email Service Consumer] Subscribed and listening on topic "${topic}"`);

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const rawValue = message.value.toString();
          
          try {
            const parsedEvent = JSON.parse(rawValue);
            
            console.log('\n======================================================');
            console.log(`[Email Service] Kafka event picked up! Initiating email dispatch...`);
            console.log(`Topic: "${topic}" | Partition: ${partition} | Offset: ${message.offset}`);
            console.log('------------------------------------------------------');
            
            await sendRealEmail({
              title: parsedEvent.data.title,
              body: parsedEvent.data.body
            });
            
            console.log('======================================================\n');
          } catch (err) {
            console.error(' [Email Service] Failed to process parsed message:', err);
          }
        }
      });
    } catch (error) {
      console.error('[Email Service Consumer] Error running consumer:', error);
      throw error;
    }
  }
}

export class NotificationEventConsumer {
  constructor(kafkaConsumer) {
    this.consumer = kafkaConsumer;
  }

  async start() {
    const topic = 'post-created';
    
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      console.log(`[Notification Service Consumer] Subscribed and listening on topic "${topic}"`);

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const rawValue = message.value.toString();
          
          try {
            const parsedEvent = JSON.parse(rawValue);
            
            console.log('\n======================================================');
            console.log(`[Notification Service] Kafka event picked up! Initiating push notification...`);
            console.log(`Topic: "${topic}" | Partition: ${partition} | Offset: ${message.offset}`);
            console.log('------------------------------------------------------');
            
            await sendRealPushNotification({
              title: parsedEvent.data.title
            });
            
            console.log('======================================================\n');
          } catch (err) {
            console.error('[Notification Service] Failed to process parsed message:', err);
          }
        }
      });
    } catch (error) {
      console.error('[Notification Service Consumer] Error running consumer:', error);
      throw error;
    }
  }
}