import https from 'https';

/**
 * @param {string} url - The webhook URL to send the event to.
 * @param {Object} msg - The message to send in the webhook event.
 */
export function sendWebhookEvent(url, msg) {

    if (url.includes("discord.com")) {
        // Discord webhook
        const data = JSON.stringify({
            content: msg.content,
            embeds: msg.embeds || []
        });

        const options = {
            hostname: 'discord.com',
            port: 443,
            pathname: new URL(url).pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode !== 204) {
                console.error(`Discord webhook failed with status code: ${res.statusCode}`);
            }
        });
        req.on('error', (error) => {
            console.error(`Error sending Discord webhook: ${error.message}`);
        });
        req.write(data);
        req.end();
    }
    else {
        console.warn("Unknown webhook URL format. Only Discord webhooks are supported at the moment.");
    }

}