import { Kafka } from 'kafkajs';
import { EmailEventConsumer, NotificationEventConsumer } from './kafka-event-consumer.js';

let kafkaProducer = null;
let emailConsumerInstance = null;
let notificationConsumerInstance = null;

export function getKafkaProducer() {
  return kafkaProducer;
}


export async function connectKafka() {
  const brokers = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
  const clientId = process.env.KAFKA_CLIENT_ID || 'post-service';

  console.log(`⚡ [Kafka Client] Connecting to brokers: ${brokers.join(', ')}...`);

  const kafka = new Kafka({
    clientId,
    brokers,
    retry: {
      initialRetryTime: 500,
      retries: 15
    }
  });

  try {
    kafkaProducer = kafka.producer();
    await kafkaProducer.connect();
    console.log('[Kafka Producer] Successfully connected to broker cluster');

    emailConsumerInstance = kafka.consumer({ groupId: 'email-service-group' });
    await emailConsumerInstance.connect();
    console.log('[Email Service Consumer] Successfully connected to broker cluster');
    const emailConsumer = new EmailEventConsumer(emailConsumerInstance);
    await emailConsumer.start();

    notificationConsumerInstance = kafka.consumer({ groupId: 'notification-service-group' });
    await notificationConsumerInstance.connect();
    console.log('[Notification Service Consumer] Successfully connected to broker cluster');
    const notificationConsumer = new NotificationEventConsumer(notificationConsumerInstance);
    await notificationConsumer.start();

  } catch (error) {
    console.error('[Kafka Client] Initialization failed:', error);
    throw error;
  }
}

/**
 * Gracefully shuts down all active Kafka connections
 */
export async function disconnectKafka() {
  try {
    if (kafkaProducer) {
      await kafkaProducer.disconnect();
      console.log('🔌 [Kafka Producer] Disconnected successfully');
    }
    if (emailConsumerInstance) {
      await emailConsumerInstance.disconnect();
      console.log('🔌 [Email Service Consumer] Disconnected successfully');
    }
    if (notificationConsumerInstance) {
      await notificationConsumerInstance.disconnect();
      console.log('🔌 [Notification Service Consumer] Disconnected successfully');
    }
  } catch (error) {
    console.error('❌ [Kafka Client] Error during disconnection:', error);
  }
}
