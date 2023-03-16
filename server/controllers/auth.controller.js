import UsersDatabase from "../database/db/users.db.js";

class AuthController {
    constructor() {
        this.userdb = new UsersDatabase();
    }

    async index(req, res) {
        return res.render('login', {
            layout: false,
        });
    }

    async store(req, res) {
        let { username, password, remember } = req.body;
        let user = await this.userdb.attempt(req, res, { username, password, remember });
        if (user.status) {
            req.session.login = true;
            req.session.user_id = user.user.id;
            return res.json({ status: true, message: "Login success." });
        } else {
            return res.json({ status: false, message: user.message });
        }
    }

    async logout(req, res) {
        res.clearCookie('remember');
        req.session.destroy();
        return res.redirect('/login');
    }
}

export default AuthController;