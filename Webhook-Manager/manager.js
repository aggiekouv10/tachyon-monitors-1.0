
const webhook = require("webhook-discord");

class DistributeManager {

    SITENAME

    constructor(SITENAME, CATEGORY) {
        this.SITENAME = SITENAME
    }

    async connect() {

    }

    distributeWebhook(webhookMessage, url, category, sitename = this.SITENAME) {
        const discordWebhook = new webhook.Webhook(url);
        discordWebhook.send(webhookMessage)
    }

    distributeEmbeds() {

    }
}

module.exports = DistributeManager;