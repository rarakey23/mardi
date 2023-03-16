import SessionDatabase from "../database/db/device.db.js";
import Middleware from "../config/Middleware.js";

class HomeController {
    constructor() {
        this.db_device = new SessionDatabase();
    }

    async index(req, res) {
        if (req.method === "POST") {
            const { session_name } = req.body;
            return res.redirect(`/device/${session_name}`);
        } else {
            return res.render("index", {
                page_active: "home",
                layout: "layouts/app",
                user: await Middleware.Auth(req),
            });
        }
    }

    async device(req, res) {
        const { session_name } = req.params;
        const device = await this.db_device.findOneSessionDB(session_name);
        if (device) {
            if (device.user_id != req.session.user_id) {
                req.flash('error_msg', 'This device is already available in another user.');
                return res.redirect('/');
            }
        }
        return res.render("device", {
            port: process.env.PORT,
            host: process.env.HOST,
            local: process.env.LOCALHOST,
            page_active: "home",
            layout: "layouts/app",
            session_name: session_name,
            user_id: req.session.user_id,
            device: device,
            user: await Middleware.Auth(req),
        });
    }

    async json(req, res) {
        const total_all = await this.db_device.findAllSessionDB({ where: { user_id: req.session.user_id } });
        return res.json({
            draw: 0,
            recordsTotal: total_all.length,
            data: total_all.map((item) => {
                return {
                    id: item.id,
                    responsive_id: null,
                    session_name: item.session_name,
                    session_number: item.session_number,
                    action: `<a href="/device/${item.session_name}" class="btn btn-sm btn-primary"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></a>`,
                }
            }),
        });
    }

}

export default HomeController;