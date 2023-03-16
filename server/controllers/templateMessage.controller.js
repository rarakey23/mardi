import { MessageTemplate, MessageDB } from "../database/models/messageTemplate.model.js";
import { ButtonTemplate, ButtonTemplateModel } from "../database/models/buttonTemplate.model.js";
import { ReplyDatabase } from "../database/models/autoreply.model.js";
import { BlastDatabase } from "../database/models/blast.model.js";
import Middleware from "../config/Middleware.js";

class templateMessageController {
    constructor() {
        this.tMessage = new MessageDB();
        this.Fmessage = new ReplyDatabase();
        this.FBlast = new BlastDatabase();
        this.templateMessage = MessageTemplate;
        this.templateButton = ButtonTemplate;
        this.MtemplateButton = new ButtonTemplateModel();
    }

    async index(req, res) {
        return res.render("templateMessage/index", {
            page_active: "template_message",
            layout: "layouts/app",
            user: await Middleware.Auth(req),
        });
    }

    async json(req, res) {
        let result = await this.templateMessage.findAll({ where: { user_id: req.session.user_id } });
        return res.json({
            draw: 0,
            recordsTotal: result.length,
            data: result.map((item) => {
                return {
                    id: item.id,
                    responsive_id: null,
                    title: item.title,
                    type: item.type,
                    action: `<a href="/template-message/${item.id}" class="btn btn-sm btn-primary"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></a>`,
                }
            }),
        });
    }

    async delete(req, res) {
        try {
            let id = req.body.id;
            id = id.map((item) => {
                return parseInt(item);
            });
            await this.tMessage.deleteWhereIn(id);
            await this.Fmessage.delMessageTemplateIn(id);
            await this.FBlast.delMessageTemplateIn(id);
            await this.MtemplateButton.deleteIn(id);
            return res.json({ status: true, message: "Delete Success" });
        } catch (err) {
            return res.json({ status: false, message: err.message });
        }
    }

    async detail(req, res) {
        let id = req.params.id;
        let result = await this.templateMessage.findOne({ where: { id: id } });
        if (!result) {
            req.flash("error_msg", "Template message not found");
            return res.redirect("/template-message");
        }
        let button = await this.templateButton.findAll({ where: { id_message_template: id } });
        return res.render("templateMessage/detail", {
            page_active: "template_message",
            layout: "layouts/app",
            user: await Middleware.Auth(req),
            result: result,
            button: button,
        });
    }

    async store(req, res) {
        let { title, type, message, media, product_title, currency, price, sale_price, url, footer } = req.body;
        let result;
        switch (type) {
            case "text":
                result = await this.tMessage.store({
                    title: title,
                    type: type,
                    message: message,
                    user_id: req.session.user_id
                });
                if (result) {
                    req.flash("success_msg", "Success add text message");
                    return res.redirect("/template-message");
                } else {
                    req.flash("error_msg", "Failed add text message");
                    return res.redirect("/template-message");
                }
                break;
            case 'media':
                result = await this.tMessage.store({
                    title: title,
                    type: type,
                    message: message,
                    media: media,
                    user_id: req.session.user_id
                })
                if (result) {
                    req.flash("success_msg", "Success add media message");
                    return res.redirect("/template-message");
                } else {
                    req.flash("error_msg", "Failed add media message");
                    return res.redirect("/template-message");
                }
                break;
            case "contact":
                result = await this.tMessage.store({
                    title: title,
                    type: type,
                    message: message,
                    user_id: req.session.user_id
                });
                if (result) {
                    req.flash("success_msg", "Success add contact message");
                    return res.redirect("/template-message");
                } else {
                    req.flash("error_msg", "Failed add contact message");
                    return res.redirect("/template-message");
                }
                break;
            case 'product':
                result = await this.tMessage.store({
                    title: title,
                    type: type,
                    message: message,
                    product_title: product_title,
                    currency: currency,
                    price: price.replace(/\,/g, ""),
                    after_discount: sale_price.replace(/\,/g, ""),
                    url: url,
                    footer: footer,
                    user_id: req.session.user_id,
                    media: media
                });
                if (result) {
                    req.flash("success_msg", "Success add product message");
                    return res.redirect("/template-message");
                } else {
                    req.flash("error_msg", "Failed add product message");
                    return res.redirect("/template-message");
                }
                break
            case 'button':
                let { btntype, btndisplay, btnaction } = req.body;
                result = await this.tMessage.store({
                    title: title,
                    type: type,
                    message: message,
                    media: media,
                    user_id: req.session.user_id,
                    footer: footer,
                });
                btntype.forEach((item, index) => {
                    this.templateButton.create({
                        id_message_template: result.id,
                        index_id: index + 1,
                        display_text: btndisplay[index],
                        action: btnaction[index],
                        type: item,
                    });
                });
                if (result) {
                    req.flash("success_msg", "Success add button message");
                    return res.redirect("/template-message");
                } else {
                    req.flash("error_msg", "Failed add button message");
                    return res.redirect("/template-message");
                }
                break
            default:
                req.flash("error_msg", "Type not found");
                return res.redirect("/template-message");
                break;
        }
    }

    async update(req, res) {
        let { id, title, type_message, message, media, product_title, currency, price, sale_price, url, footer } = req.body;
        let result;
        switch (type_message) {
            case "text":
                result = await this.templateMessage.update({
                    title: title,
                    message: message,
                }, { where: { id: id } });
                if (result) {
                    req.flash("success_msg", "Success update text message");
                    return res.redirect("/template-message/" + id);
                } else {
                    req.flash("error_msg", "Failed update text message");
                    return res.redirect("/template-message/" + id);
                }
                break;
            case 'media':
                result = await this.templateMessage.update({
                    title: title,
                    message: message,
                    media: media,
                }, { where: { id: id } })
                if (result) {
                    req.flash("success_msg", "Success update media message");
                    return res.redirect("/template-message/" + id);
                } else {
                    req.flash("error_msg", "Failed update media message");
                    return res.redirect("/template-message/" + id);
                }
                break;
            case "contact":
                result = await this.templateMessage.update({
                    title: title,
                    message: message,
                }, { where: { id: id } });
                if (result) {
                    req.flash("success_msg", "Success update contact message");
                    return res.redirect("/template-message/" + id);
                } else {
                    req.flash("error_msg", "Failed update contact message");
                    return res.redirect("/template-message/" + id);
                }
                break;
            case 'product':
                result = await this.templateMessage.update(
                    {
                        title: title,
                        message: message,
                        product_title: product_title,
                        currency: currency,
                        price: price.replace(/\,/g, ""),
                        after_discount: sale_price.replace(/\,/g, ""),
                        url: url,
                        footer: footer,
                        media: media
                    }
                    , { where: { id: id } }
                );
                if (result) {
                    req.flash("success_msg", "Success update product message");
                    return res.redirect("/template-message/" + id);
                } else {
                    req.flash("error_msg", "Failed update product message");
                    return res.redirect("/template-message/" + id);
                }
                break
            case 'button':
                let { btntype, btndisplay, btnaction } = req.body;
                result = await this.templateMessage.update({
                    title: title,
                    message: message,
                    media: media,
                    footer: footer,
                }, { where: { id: id } });
                await this.templateButton.destroy({ where: { id_message_template: id } });
                btntype.forEach((item, index) => {
                    this.templateButton.create({
                        id_message_template: id,
                        index_id: index + 1,
                        display_text: btndisplay[index],
                        action: btnaction[index],
                        type: item,
                    });
                });
                if (result) {
                    req.flash("success_msg", "Success update button message");
                    return res.redirect("/template-message/" + id);
                } else {
                    req.flash("error_msg", "Failed update button message");
                    return res.redirect("/template-message/" + id);
                }
                break
            default:
                req.flash("error_msg", "Type not found");
                return res.redirect("/template-message");
                break;
        }
    }


}

export default templateMessageController;