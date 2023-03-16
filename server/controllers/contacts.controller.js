import { ContactsDatabase } from "../database/models/contacts.model.js";
import Middleware from "../config/Middleware.js";

class ContactsController {
    constructor() {
        this.dbContacts = new ContactsDatabase();
    }

    async index(req, res) {
        const labels = await this.dbContacts.getGroupByLabel();
        return res.render('contacts', {
            page_active: 'contacts',
            layout: 'layouts/app',
            labels: labels,
            user: await Middleware.Auth(req),
        });
    }

    async create(req, res) {
        await this.dbContacts.createContactsDB({
            device_id: 0,
            user_id: req.session.user_id,
            name: req.body.name,
            number: req.body.number,
            type: 'personal',
            label: req.body.label,
        });
        return res.json({
            status: 'success',
        });
    }

    async json(request, res) {
        var draw = request.query.draw;
        var start = request.query.start;
        var length = request.query.length;
        var order_data = request.query.order;
        var search = request.query.search['value'];

        const totalall = await this.dbContacts.findAllContactsDB({ where: { user_id: request.session.user_id } });
        const totalFiltered = await this.dbContacts.findRecordsFiltered(search, request.session.user_id);
        const result = await this.dbContacts.datatables({
            start: start,
            length: length,
            search: search,
            user_id: request.session.user_id,
        });

        return res.json({
            draw: draw,
            recordsTotal: totalall.length,
            recordsFiltered: totalFiltered.length,
            aaData: result.map((item) => {
                return {
                    id: item.id,
                    responsive_id: null,
                    name: item.name,
                    number: item.number,
                    type: item.type,
                    label: item.label,
                    action: ``,
                }
            }),
        });
    }

    async delete_all(req, res) {
        const result = await this.dbContacts.deleteAllContactsDB({ where: { user_id: req.session.user_id } });
        return res.json({
            status: 'success',
        });
    }

    async delete(req, res) {
        let id = req.body.id;
        id = id.map((item) => {
            return parseInt(item);
        });
        await this.dbContacts.delete_wherein(id);
        return res.json({
            status: true,
        });
    }

    async delete_label(req, res) {
        let label = req.body.label;
        await this.dbContacts.delete_by_label(label);
        return res.json({
            status: 'success',
        });
    }
}

export default ContactsController;