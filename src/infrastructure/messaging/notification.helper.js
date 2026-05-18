
export async function sendRealPushNotification({ title }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl.trim() === '' || webhookUrl === 'skip') {
    console.log('[Notification Service] Discord Webhook URL is not configured. Skipping real push notification.');
    console.log('Tip: Create a free Discord channel -> Integrations -> Webhooks, copy the URL, and paste it as DISCORD_WEBHOOK_URL in your .env to see real push notifications on your screen!');
    return;
  }

  try {
    const payload = {
      username: 'DDD Microservice Agent',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/873/873120.png',
      embeds: [
        {
          title: 'Real-Time Push Notification Alert!',
          description: `A new post has been successfully processed in our event-driven system!`,
          color: 3066993, 
          fields: [
            {
              name: 'Post Title',
              value: `**${title}**`,
              inline: false
            },
            {
              name: 'Kafka Broker Topic',
              value: '`post-created`',
              inline: true
            },
            {
              name: 'Domain Aggregate',
              value: '`Post Entity`',
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Apache Kafka + Node.js DDD Backend',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/919/919825.png' // Node.js icon
          }
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('[Notification Service] Real Discord push notification dispatched successfully!');
    } else {
      console.error(`[Notification Service] Discord Webhook API returned status code: ${response.status}`);
    }
  } catch (error) {
    console.error('[Notification Service] Failed to send real push notification:', error);
  }
}
