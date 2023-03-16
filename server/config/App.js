import express from "express";
import bodyParser from "body-parser";
import expressLayout from "express-ejs-layouts";
import flash from "connect-flash";
import session from "express-session";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./Database.js";
import fileUpload from "express-fileupload";

import routerHome from "../routes/home.js";
import routerContacts from "../routes/contacts.js";
import routerAuth from "../routes/auth.js";
import routerAdmin from "../routes/admin.js";
import routerTemplateMessage from "../routes/templateMessage.js";
import routerHistory from "../routes/history.js";
import routerAutoreply from "../routes/autoreply.js";
import routerFile from "../routes/file.js"; ''
import routerBlast from "../routes/blast.js";

class App {
    constructor() {
        this.app = express();
        this.plugins();
        this.route();
        this.PORT = process.env.PORT || 3000;
    }

    plugins() {
        this.app.set("trust proxy", 1);
        this.app.set("view engine", "ejs");
        this.app.set("views", "public/views");
        this.app.use(expressLayout);
        this.app.use(express.static("public/assets"));
        this.app.use(express.static("public/"));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(session({ secret: "@ilsya@screet", name: 'secret_wablast_ilsyaa', resave: false, saveUninitialized: true, cookie: { signed: true, sameSite: true, maxAge: 1000 * 60 * 60 * 24 } }));
        this.app.use(cookieParser("@ilsya@screet"));
        this.app.use(function (req, res, next) {
            res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.setHeader('Pragma', 'no-cache');
            next();
        });
        this.app.use(flash());
        this.app.use(function (req, res, next) {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.side = req.flash("side");
            res.locals.url = req.originalUrl;
            next();
        });
        this.app.use(
            fileUpload({
                fileSize: 10 * 1024 * 1024,
            })
        );
        connectDatabase();
    }

    route() {
        this.app.use(routerHome);
        this.app.use('/admin', routerAdmin);
        this.app.use('/file', routerFile);
        this.app.use('/autoreply', routerAutoreply)
        this.app.use('/contacts', routerContacts);
        this.app.use('/template-message', routerTemplateMessage)
        this.app.use('/blast', routerBlast)
        this.app.use('/history', routerHistory)
        this.app.use(routerAuth);
    }
}

export default App;