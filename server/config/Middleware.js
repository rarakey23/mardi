import UsersDatabase from "../database/db/users.db.js";

export default {
    async isLogin(req, res, next) {
        if (req.session.login === true) {
            next();
            return;
        } else {
            if (req.signedCookies.remember) {
                let dbuser = new UsersDatabase();
                let user = await dbuser.remember(req.signedCookies.remember);
                if (user) {
                    req.session.login = true;
                    req.session.user_id = user.id;
                    next();
                    return;
                } else {
                    res.clearCookie('remember');
                }
            }
            req.session.destroy(function (err) {
                res.redirect('/login');
            })
        }
    },
    isLogout(req, res, next) {
        if (req.session.login !== true) {
            next();
            return;
        }
        res.redirect('/');
    },
    async isAdmin(req, res, next) {
        let dbuser = new UsersDatabase();
        let user = await dbuser.getLoginUser(req);
        if (req.session.login === true && user.role == 'admin') {
            next();
            return;
        }
        req.flash('error_msg', 'You are not authorized to access this page.');
        res.redirect('/');
    },
    async Auth(req) {
        if (req.session.login === true) {
            let dbuser = new UsersDatabase();
            return await dbuser.getLoginUser(req);
        } else {
            return false;
        }
    }
}