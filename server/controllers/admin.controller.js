import UsersDatabase from "../database/db/users.db.js";
import Middleware from "../config/Middleware.js";
import bcrypt from "bcrypt";

class HomeController {
    constructor() {
        this.db_users = new UsersDatabase();
    }

    async users(req, res) {
        return res.render("admin/manage_users", {
            page_active: "admin/manage_users",
            layout: "layouts/app",
            user: await Middleware.Auth(req),
        });
    }

    async users_json(req, res) {
        var draw = req.query.draw;
        var start = req.query.start;
        var length = req.query.length;
        var order_data = req.query.order;
        var search_value = req.query.search['value'];

        const total_all = await this.db_users.findAllSessionDB();
        const total_filtered = await this.db_users.findRecordsFiltered(search_value);
        const device = await this.db_users.datatables({
            start: start,
            length: length,
            search: search_value,
        });

        return res.json({
            draw: draw,
            recordsTotal: total_all.length,
            recordsFiltered: total_filtered.length,
            data: device.map((item) => {
                return {
                    id: item.id,
                    responsive_id: null,
                    name: item.name,
                    role: item.role,
                    action: `<a href="javascript:void(0)" onclick='modaledit("${item.id}")' class="btn btn-sm btn-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></a>`,
                }
            }),
        });
    }

    async users_store(req, res) {
        let data = req.body;
        let result = await this.db_users.store(data);
        res.json({ status: result.status, message: result.message });
    }

    async users_edit(req, res) {
        let id = req.params.id;
        console.log(id);
        let user = await this.db_users.findOne({ where: { id: id } });
        if (user) {
            res.json({ status: true, data: user });
        } else {
            res.json({ status: false, message: "Data not found." });
        }
    }

    async users_update(req, res) {
        let { edit_id, edit_name, edit_username, edit_password, edit_role } = req.body;
        let insert = {};
        if (edit_password) {
            insert = {
                name: edit_name,
                username: edit_username,
                password: bcrypt.hashSync(edit_password, 10),
                role: edit_role,
            }
        } else {
            insert = {
                name: edit_name,
                username: edit_username,
                role: edit_role,
            }
        }
        let result = await this.db_users.update(insert, { where: { id: edit_id } });
        if (result) {
            res.json({ status: true, message: "Data has been updated." });
        } else {
            res.json({ status: false, message: "Data failed to update." });
        }
    }

    async users_delete(req, res) {
        let ids = req.body.id;
        ids = ids.map((item) => {
            return parseInt(item);
        });
        await this.db_users.delete_wherein(ids);
        res.json({ status: true, message: "Data has been deleted." });
    }

}

export default HomeController;