import { helpers, modules } from "../../../../lib/index.js";
import ClientHandler from "./ClientHandler.js";
import Serialize from "./Serialize.js";
import SessionDatabase from "../../../database/db/device.db.js";
import { ContactsDatabase } from "../../../database/models/contacts.model.js";
import { ReplyDatabase } from "../../../database/models/autoreply.model.js";
import { ButtonTemplate } from "../../../database/models/buttonTemplate.model.js";
import fs from "fs";
import "dotenv/config";

export default class Message extends Serialize {
	constructor(client, msg, session_name) {
		super();
		this.session = session_name;
		this.client = client;
		this.msg = msg.messages;
		this.type = msg.type;
		this.SessionDatabase = new SessionDatabase();
		this.ContactDatabase = new ContactsDatabase();
		this.AutoReply = new ReplyDatabase();
		this.ButtonTemplate = ButtonTemplate;
	}

	async mainHandler() {
		try {
			if (!this.msg) return;
			const message = this.msg[0];
			if (message.key && message.key.remoteJid === "status@broadcast") return;
			if (!message.message) return;
			const m = await this.serial(this.client, message);
			const bot = new ClientHandler(this.client, m.from);
			const CMD = m.command ? m.command : null;
			if (!CMD) return this.messageHandler(m, bot);
		} catch (error) {
			console.log(error);
		}
	}

	async messageHandler(m, bot) {
		let isGroup = m.isGroupMsg ? true : false;
		let isMe = m.fromMe;
		let device = m.botNumber.split("@")[0];
		// console.log(m);
		try {
			let getreply = await this.AutoReply.getAutoReply({ device, keyword: m.body });
			if (getreply.length > 0) {
				for (let reply of getreply) {
					let tMsg = reply.message_template;
					switch (tMsg.type) {
						case "text":
							return bot.sendText(tMsg.message);
							break;
						case "media":
							let nameRandom = helpers.randomText(10);
							const buffer = await helpers.downloadAxios(tMsg.media);
							let ext = buffer.headers["content-type"].split("/")[1];
							const dest = `./public/temp/${nameRandom}.${ext}`;
							fs.writeFileSync(dest, buffer.data);
							var opts = { file: { name: nameRandom, mimetype: buffer.headers["content-type"] } };
							bot.sendMedia(dest, tMsg.message, opts).then(() => fs.unlinkSync(dest));
							break
						case "contact":
							let contactArray = tMsg.message.split(",");
							let name = [], number = [];
							for (let contact of contactArray) {
								name.push(contact.split("-")[1].replace(/^\s+|\s+$/gm, ""));
								number.push(contact.split("-")[0].replace(/^\s+|\s+$/gm, ""));
							}
							return bot.sendContact(number, name);
							break;
						case "product":
							return bot.sendProduct({
								image_url: tMsg.media,
								title: tMsg.product_title,
								body: tMsg.message,
								footer: tMsg.footer,
								salePrice: tMsg.after_discount,
								price: tMsg.price,
								url: tMsg.url,
								currencyCode: tMsg.currency,
							})
							break
						case "button":
							this.sendButton(tMsg, bot);
							break
						default:
					}
				};
			}
		} catch (error) {
			console.log(error);
		}


		// let isMe
		// const buttonResponse = new ButtonResponse();
		// const listResponse = new ListResponse();
		// const replyResponse = new AutoReply();

		// const keywordReply = await replyResponse.checkMessageUser(m.botNumber, m.body);
		// const keywordButton = await buttonResponse.checkKeyword(m.body, m.from);
		// const keywordList = await listResponse.checkKeyword(m.body, m.from);

		// if (keywordButton) {
		// 	await bot.reply(keywordButton.response, m.msg);
		// 	return await buttonResponse.deleteKeyword(keywordButton.msg_id, keywordButton.keyword);
		// } else if (keywordList) {
		// 	await bot.reply(keywordList.response, m.msg);
		// } else if (keywordReply) {
		// 	await bot.reply(keywordReply.response, m.msg);
		// }
		// if (m.body == "Bot") {
		// 	return bot.reply(`Yes Sir..`, m.msg);
		// } else if (m.body == "Test") {
		// 	await bot.reply("Okee", m.msg);
		// }
		switch (m.body) {
			case ".":
				// return bot.sendContact([
				// 	'6285745876650'
				// ], ['Ilyasa'])
				return bot.sendProduct('https://i0.wp.com/www.gameholic.id/wp-content/uploads/2021/02/game-overview-poster-launch.jpg',
					'test', 'test.footer', '6285174902345');
				break;
			case "!...":
				if (!isMe) return;
				if (!isGroup) return bot.reply("scrape applies to groups only.", m.msg);
				let sessiondb = await this.SessionDatabase.findOneSessionDB(this.session);
				let get_participants = m.group.groupMetadata.participants;
				for (let i = 0; i < get_participants.length; i++) {
					let contact = await this.ContactDatabase.findOneContactDB({ where: { user_id: sessiondb.user_id, number: get_participants[i].id.split("@")[0] } });
					if (!contact) {
						this.ContactDatabase.createContactsDB({
							device_id: sessiondb.id,
							user_id: sessiondb.user_id,
							name: '-',
							number: get_participants[i].id.split("@")[0],
							type: 'personal',
							label: 'Scrape from ' + m.group.groupMetadata.subject,
						});
					} else {
						console.log('contact already exists');
					}
				}
				return bot.reply('_All Done._', m.msg);
				break;
			default:
				return;
		}
	}

	async sendButton(tMsg, bot) {
		try {
			let buttons = await this.ButtonTemplate.findAll({ where: { id_message_template: tMsg.id } });
			let button = [];
			let index = 0;
			for (let btn of buttons) {
				if (btn.type == 'urlButton') {
					if (!/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm.test(btn.action)) {
						return console.log('Make sure response url button is using http or https! Example: https://www.google.com/');
					} else {
						button.push({ index: index + 1, urlButton: { displayText: btn.display_text, url: btn.action } });
					}
				}
				if (btn.type == 'callButton') {
					button.push({ index: index + 1, callButton: { displayText: btn.display_text, phoneNumber: btn.action } });
				}
				if (btn.type == 'quickReplyButton') {
					button.push({ index: index + 1, quickReplyButton: { displayText: btn.display_text, id: btn.action } });
				}
				index++;
			}
			if (tMsg.media) {
				let nameRandom = helpers.randomText(10);
				const buffer = await helpers.downloadAxios(tMsg.media);
				let ext = buffer.headers["content-type"];
				const dest = `./public/temp/${nameRandom}.${ext.split("/")[1]}`;
				fs.writeFileSync(dest, buffer.data);
				return bot.sendButton(tMsg.message, tMsg.footer, button, dest, ext).then(() => fs.unlinkSync(dest));
			} else {
				return bot.sendButton(tMsg.message, tMsg.footer, button);
			}
		} catch (error) {
			console.log(error);

		}
	}

}
