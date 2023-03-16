import { Blast } from "../database/models/blast.model.js";
import Session from "../database/models/session.model.js";
import { MessageTemplate } from "../database/models/messageTemplate.model.js";
import { ContactsDatabase } from "../database/models/contacts.model.js";
import Middleware from "../config/Middleware.js";
import { col, Op } from "sequelize";

class BlastController {
    constructor() {
        this.Blast = Blast;
        this.Session = Session;
        this.MessageTemplate = MessageTemplate;
        this.contactsdb = new ContactsDatabase();
    }

    async index(req, res) {
        const par = req.query.by;

        return res.render("blast/index", {
            layout: "layouts/main",
            page_active: "blast/" + par,
            layout: "layouts/app",
            user: await Middleware.Auth(req),
            devices: await this.Session.findAll(),
            templateMessages: await this.MessageTemplate.findAll(),
            by: par,
        });
    }

    async store(req, res) {
        try {
            const { by, title, id_device, id_message_template, is_save } = req.body;
            const user = await Middleware.Auth(req);
            switch (by) {
                case "all":
                    var contacts = await this.contactsdb.findAllContactsDB({
                        where: {
                            user_id: user.id,
                        }
                    });
                    contacts.forEach(async (item) => {
                        await this.Blast.create({
                            title: title,
                            id_message_template: id_message_template,
                            id_device: id_device,
                            receiver: item.number,
                            is_save: (is_save == "yes") ? 1 : 0,
                            status: "pending",
                            user_id: user.id,
                        });
                    });
                    return res.json({ status: "success", message: "Blast has been sent" });
                    break;
                case "label":
                    var { label } = req.body;
                    var contacts = await this.contactsdb.findAllContactsDB({
                        where: {
                            user_id: user.id,
                            label: {
                                [Op.in]: label,
                            }
                        }
                    });
                    contacts.forEach(async (item) => {
                        await this.Blast.create({
                            title: title,
                            id_message_template: id_message_template,
                            id_device: id_device,
                            receiver: item.number,
                            is_save: (is_save == "yes") ? 1 : 0,
                            status: "pending",
                            user_id: user.id,
                        });
                    });
                    return res.json({ status: "success", message: "Blast has been sent" });
                    break
                case "numbers":
                    var { mn_numbers } = req.body;
                    // if mn_numbers is not array
                    if (!Array.isArray(mn_numbers)) {
                        mn_numbers = [mn_numbers];
                    }
                    mn_numbers.forEach(async (item) => {
                        await this.Blast.create({
                            title: title,
                            id_message_template: id_message_template,
                            id_device: id_device,
                            receiver: item,
                            is_save: (is_save == "yes") ? 1 : 0,
                            status: "pending",
                            user_id: user.id,
                        });
                    });
                    return res.json({ status: "success", message: "Blast has been sent" });
                    break
                default:
                    req.flash("error_msg", "Invalid request");
                    return res.redirect("/blast?by=" + by);
                    break;
            }
        } catch (err) {
            return res.json({ status: "error", message: err.message });
        }
    }

    async json(req, res) {
        let by = req.body.by;
        let total_all = await this.contactsdb.getGroupByLabel({ where: { user_id: req.session.user_id } });
        return res.json({
            draw: 0,
            recordsTotal: total_all.length,
            data: total_all.map((item) => {
                return {
                    id: item.id,
                    responsive_id: null,
                    label: item.label,
                    total: item.total,
                }
            }),
        });
    }
}

export default BlastController;