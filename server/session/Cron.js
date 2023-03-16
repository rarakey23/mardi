import Client from "./Client/handler/ClientHandler.js";
import cron from "node-cron";
import SessionDatabase from "../database/db/device.db.js";
import { BlastDatabase } from "../database/models/blast.model.js";
import { Op, col } from "sequelize";
import { helpers } from "../../lib/index.js";
import { ButtonTemplate } from "../database/models/buttonTemplate.model.js";

export default class Cron {
    constructor(client, { session_name }) {
        this.client = client;
        this.device = new SessionDatabase();
        this.session_name = session_name;
        this.blast = new BlastDatabase();
        this.ButtonTemplate = ButtonTemplate;
    }

    async main() {

        const device = await this.device.findOneSessionDB(this.session_name);
        return this.__blast(device);
    }


    async __blast(device) {
        // cron job in seconds
        cron.schedule(`*/${parseInt(process.env.CRON)} * * * * *`, async () => {
            try {
                const blast = await this.blast.getBlast({
                    where: {
                        id_device: device.id,
                        status: {
                            [Op.not]: "sent",
                        },
                    },
                    order: [
                        // [col("blast.id"), "ASC"],
                        [col("status"), "DESC"],
                    ],
                    limit: parseInt(process.env.LIMIT_SEND),
                });
                if (blast.length > 0) {
                    this.sendMessage(blast);
                }
            } catch (err) {
                console.log(err);
            }
        });
    }


    async sendMessage(data) {
        for (let lyn of data) {
            const tMsg = lyn.message_template;
            const bot = new Client(this.client, helpers.phoneNumber(lyn.receiver));
            try {
                switch (tMsg.type) {
                    case "text":
                        bot.sendText(tMsg.message).then(async () => {
                            await this.updateBlast({
                                id: lyn.id,
                                is_save: lyn.is_save,
                                status: "sent",
                            });
                        }).catch(async (err) => {
                            await this.updateBlast({
                                id: lyn.id,
                                is_save: lyn.is_save,
                                status: "failed",
                            });
                        });
                        break;
                    case "media":
                        let nameRandom = helpers.randomText(10);
                        const buffer = await helpers.downloadAxios(tMsg.media);
                        var opts = { file: { name: nameRandom, mimetype: buffer.headers["content-type"] } };
                        bot.sendMedia(tMsg.media, tMsg.message, opts).then(async () => {
                            await this.updateBlast({
                                id: lyn.id,
                                is_save: lyn.is_save,
                                status: "sent",
                            });
                        }).catch(async (err) => {
                            await this.updateBlast({
                                id: lyn.id,
                                is_save: lyn.is_save,
                                status: "failed",
                            });
                        });
                        break
                    case "contact":
                        let contactArray = tMsg.message.split(",");
                        let name = [], number = [];
                        for (let contact of contactArray) {
                            name.push(contact.split("-")[1].replace(/^\s+|\s+$/gm, ""));
                            number.push(contact.split("-")[0].replace(/^\s+|\s+$/gm, ""));
                        }
                        bot.sendContact(number, name).then(async () => {
                            await this.updateBlast({
                                id: lyn.id,
                                is_save: lyn.is_save,
                                status: "sent",
                            });
                        }).catch(async (err) => {
                            await this.updateBlast({
                                id: lyn.id,
                                is_save: lyn.is_save,
                                status: "failed",
                            });
                        });
                        break;
                    case "product":
                        bot.sendProduct({
                            image_url: tMsg.media,
                            title: tMsg.product_title,
                            body: tMsg.message,
                            footer: tMsg.footer,
                            salePrice: tMsg.after_discount,
                            price: tMsg.price,
                            url: tMsg.url,
                            currencyCode: tMsg.currency,
                        }).then(async () => {
                            await this.updateBlast({
                                id: lyn.id,
                                is_save: lyn.is_save,
                                status: "sent",
                            });
                        }).catch(async (err) => {
                            await this.updateBlast({
                                id: lyn.id,
                                is_save: lyn.is_save,
                                status: "failed",
                            });
                        });
                        break
                    case "button":
                        this.sendButton(tMsg, bot, lyn);
                        break
                    default:
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (err) {
                console.log(err);
            }
        }
    }

    async updateBlast({ id, is_save, status }) {
        if (is_save == 1) {
            return this.blast.table.update({ status }, { where: { id } })
        } else {
            return this.blast.table.destroy({ where: { id } })
        }
    }

    async sendButton(tMsg, bot, lyn) {
        try {
            let buttons = await this.ButtonTemplate.findAll({ where: { id_message_template: tMsg.id } });
            let button = [];
            let index = 0;
            for (let btn of buttons) {
                if (btn.type == 'urlButton') {
                    if (!/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm.test(btn.action)) {
                        console.log('Make sure response url button is using http or https! Example: https://www.google.com/');
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
                const buffer = await helpers.downloadAxios(tMsg.media);
                bot.sendButton(tMsg.message, tMsg.footer, button, tMsg.media, buffer.headers["content-type"]).then(async () => {
                    await this.updateBlast({
                        id: lyn.id,
                        is_save: lyn.is_save,
                        status: "sent",
                    });
                }).catch(async (err) => {
                    await this.updateBlast({
                        id: lyn.id,
                        is_save: lyn.is_save,
                        status: "failed",
                    });
                });
            } else {
                bot.sendButton(tMsg.message, tMsg.footer, button).then(async () => {
                    await this.updateBlast({
                        id: lyn.id,
                        is_save: lyn.is_save,
                        status: "sent",
                    });
                }).catch(async (err) => {
                    await this.updateBlast({
                        id: lyn.id,
                        is_save: lyn.is_save,
                        status: "failed",
                    });
                });
            }
        } catch (error) {
            console.log(error);

        }
    }

}