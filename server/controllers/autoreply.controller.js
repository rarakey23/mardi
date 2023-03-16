import { AutoReply, ReplyDatabase } from "../database/models/autoreply.model.js";
import { MessageTemplate } from "../database/models/messageTemplate.model.js";
import Session from "../database/models/session.model.js";
import Middleware from "../config/Middleware.js";
import { Op } from "sequelize";

class AutoreplyController {
    constructor() {
        this.Mreply = AutoReply;
        this.Freply = new ReplyDatabase();
        this.messageTemplate = MessageTemplate;
        this.device = Session;
    }

    async index(req, res) {
        return res.render("autoreply", {
            page_active: "autoreply",
            layout: "layouts/app",
            user: await Middleware.Auth(req),
            template_message: await this.messageTemplate.findAll({ where: { user_id: req.session.user_id } }),
            device: await this.device.findAll({ where: { user_id: req.session.user_id } }),
        });
    }

    async json(req, res) {
        let result = await this.Freply.findAll({ where: { user_id: req.session.user_id } });
        // return res.json(result);
        return res.json({
            draw: 0,
            recordsTotal: result.length,
            data: result.map((item) => {
                return {
                    id: item.id,
                    responsive_id: null,
                    keyword: item.keyword,
                    template_message: `<a href="/template-message/${item.message_template.id}">${item.message_template.title}</a>`,
                    device: item.device.session_name,
                }
            }),
        });
    }

    async store(req, res) {
        try {
            let { keyword, template_message, device } = req.body;
            let result = await this.Mreply.create({
                keyword: keyword,
                id_message_template: template_message,
                id_device: device,
                user_id: req.session.user_id
            });
            if (result) {
                return res.json({ status: true, message: "Success" });
            } else {
                return res.json({ status: false, message: "Failed" });
            }
        } catch (err) {
            return res.json({ status: false, message: err.message });
        }

    }

    async delete(req, res) {
        try {
            let { id } = req.body;
            id = id.map((item) => {
                return parseInt(item);
            });
            let result = await this.Mreply.destroy({
                where: {
                    id: {
                        [Op.in]: id,
                    }
                }
            });
            if (result) {
                return res.json({ status: true, message: "Success" });
            } else {
                return res.json({ status: false, message: "Failed" });
            }
        } catch (err) {
            return res.json({ status: false, message: err.message });
        }
    }
}

export default AutoreplyController; 