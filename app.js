"use strict";

const Transport = require("winston-transport");
const IncomingWebhook = require("@slack/client").IncomingWebhook;
const capitalize = require("capitalize");

module.exports = class SlackHook extends Transport {
	constructor(opts) {
		super(opts);

		opts = opts || {};
		this.name = opts.name || "slackWebhook";
		this.level = opts.level || "info";
		this.formatter = opts.formatter || undefined;
		
		this.webhook = new IncomingWebhook(opts.webhookUrl);
		this.channel = opts.channel || "";
		this.username = opts.username || "";
		this.iconEmoji = opts.iconEmoji || "";
		this.iconUrl = opts.iconUrl || "";
		this.unfurlLinks = opts.unfurlLinks || "";
		this.markdown = opts.markdown || true;
	}
	
	log(info, callback) {
		// Figure out which keys in info are attachments
		let attachments = [];
		let attachmentKeys = Object.keys(info).filter(key => !isNaN(parseInt(key)));

		attachmentKeys.forEach(key => attachments.push(info[key]));

		let payload = {
			channel: this.channel,
			username: this.username,
			icon_emoji: this.iconEmoji,
			icon_url: this.iconUrl,
			unfurl_links: this.unfurlLinks,
			mrkdwn: this.markdown
		};

		if (this.formatter && typeof this.formatter === "function") {
			payload.text = this.formatter(info);
		} else {
			payload.text = `${capitalize(info.level)}: ${info.message}`;
		}

		payload.attachments = attachments;

		this.webhook.send(payload, (err, header, statusCode, body) => {
			if (err) {
				this.emit("error", err);
			} else {
				this.emit("logged", info);
			}
		});

		if (callback && typeof callback === "function") callback(null, true);
	}
}