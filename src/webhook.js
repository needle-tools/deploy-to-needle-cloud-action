import https from 'https';

/**
 * @param {string} url - The webhook URL to send the event to.
 * @param {string} msg - The message to send in the webhook event.
 */
export function sendWebhookEvent(url, msg) {
    if (!url?.startsWith("https://")) {
        console.error("Invalid webhook URL. It must start with 'https://'.");
        return;
    }
    const webhookUrl = new URL(url);
    if (webhookUrl.hostname.endsWith("discord.com")) {
        const data = JSON.stringify({
            content: msg,
        });
        send(webhookUrl, 443, data);
    }
    else if (webhookUrl.hostname.endsWith("slack.com")) {
        const data = JSON.stringify({
            text: msg,
        });
        send(webhookUrl, 443, data);
    }
    else {
        console.warn("Unknown webhook URL format. Only Discord webhooks are supported at the moment.");
    }
}


/**
 * @param {URL} url - The URL to send the request to.
 * @param {string} body - The body of the request.
 * @param {number} port - The port to use for the request, defaults to 443.
 */
function send(url, port, body) {
    const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        protocol: url.protocol,
        port: port || 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    };
    const req = https.request(options, (res) => {
        console.error(`Discord webhook finished with status code: ${res.statusCode}`);
    });
    req.on('error', (error) => {
        console.error(`Error sending Discord webhook: ${error.message}`);
    });
    req.write(body);
    req.end();
}