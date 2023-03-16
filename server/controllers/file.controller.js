import Middleware from "../config/Middleware.js";
import fs from "fs";

class FileController {
    constructor() {
        this.storage = "./public/storage/";
        this.host = process.env.HOST;
        this.port = process.env.PORT;
        this.local = process.env.LOCALHOST == "true" ? true : false;
    }

    async index(req, res) {
        return res.render("file/index", {
            page_active: "file",
            layout: "layouts/app",
            user: await Middleware.Auth(req),
        });
    }

    async lyn_modal(req, res) {
        try {
            return res.render("file/modal-lyn", {
                layout: false,
            });
        } catch (e) {
            return res.json({ status: false, message: e.message });
        }
    }

    async part_show(req, res) {
        let files = [];
        let getFile = fs.readdirSync(this.storage);
        getFile.forEach((file) => {
            files.push({
                name: file,
                size: this.size(fs.statSync(this.storage + file).size),
                date: this.diffForHumans(fs.statSync(this.storage + file).mtime),
                ext: file.split(".").pop(),
                type: this.setType(file.split(".").pop())
            });
        });
        if (req.query.type == "modal") {
            return res.render("file/part/show-modal", {
                layout: false,
                url: this.local ? this.host + ":" + this.port : this.host,
                user: await Middleware.Auth(req),
                files: files
            });
        }
        return res.render("file/part/show", {
            layout: false,
            user: await Middleware.Auth(req),
            files: files
        });
    }

    async part_detail(req, res) {
        try {
            let name = req.query.name;
            if (!fs.existsSync(this.storage + name)) return res.json({ status: false, message: "File not found" });
            let getFile = fs.readFileSync(this.storage + name);
            let file = {
                name: name,
                size: this.size(fs.statSync(this.storage + name).size),
                date: this.diffForHumans(fs.statSync(this.storage + name).mtime),
                ext: name.split(".").pop(),
                type: this.setType(name.split(".").pop()),
                url: "/storage/" + name,
            }
            return res.render("file/part/detail", {
                layout: false,
                file: file
            });
        } catch (e) {
            return res.json({ status: false, message: e.message });
        }
    }

    async part_delete(req, res) {
        try {
            let name = req.query.name;
            if (!fs.existsSync(this.storage + name)) return res.json({ status: false, message: "File not found" });
            fs.unlinkSync(this.storage + name);
            return res.json({ status: true, message: "Your file has been deleted." });
        } catch (e) {
            return res.json({ status: false, message: e.message });
        }
    }

    async part_upload(req, res) {
        try {
            let file = req.files.file;
            let name = file.name;
            name = name.replace(/ /g, "_");
            name = name.replace(/[^a-zA-Z0-9_.]/g, "");
            name = name.toLowerCase();
            // add random string to file name
            name = name.split(".");
            name = name[0] + "_" + Math.random().toString(36).substring(7) + "." + name[1];
            file.mv(this.storage + name);
            return res.json({ status: true, message: "Your file has been uploaded." });
        } catch (e) {
            return res.json({ status: false, message: e.message });
        }
    }

    setType(ext) {
        switch (ext) {
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
            case "svg":
                return "image";
            case "mp4":
            case "mkv":
            case "avi":
            case "flv":
            case "wmv":
                return "video";
            case "mp3":
            case "wav":
            case "ogg":
                return "audio";
            default:
                return "document";

        }
    }

    size(size) {
        let i = Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }

    diffForHumans(date) {
        let diff = Math.floor((new Date() - date) / 1000);
        if (diff < 60) {
            return diff + " seconds ago";
        }
        diff = Math.floor(diff / 60);
        if (diff < 60) {
            return diff + " minutes ago";
        }
        diff = Math.floor(diff / 60);
        if (diff < 24) {
            return diff + " hours ago";
        }
        diff = Math.floor(diff / 24);
        if (diff < 7) {
            return diff + " days ago";
        }
        diff = Math.floor(diff / 7);
        if (diff < 4) {
            return diff + " weeks ago";
        }
        diff = Math.floor(diff / 4);
        if (diff < 12) {
            return diff + " months ago";
        }
        diff = Math.floor(diff / 12);
        return diff + " years ago";
    }

}

export default FileController;