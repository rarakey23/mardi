import "dotenv/config";
import { Sequelize } from "sequelize";
import { modules } from "../../lib/index.js";
import moment from "moment-timezone";
import bcrypt from "bcrypt";
import blueprint from "../database/blueprint.js";

moment.tz.setDefault("Asia/Jakarta").locale("id");

const { DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_CONNECTION } = process.env;
let sequelize = null;
if (DB_CONNECTION == "mysql") {
    sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: DB_CONNECTION,
        logging: false,
    });
} else {
    sequelize = new Sequelize(
        "db.ilsya",
        DB_USERNAME,
        DB_PASSWORD,
        {
            host: "0.0.0.0",
            dialect: "sqlite",
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },
            storage: "./server/database/sqlite/db.ilsya.sqlite"
        }
    );
}

sequelize.define(...blueprint.Users());
sequelize.define(...blueprint.Session());
sequelize.define(...blueprint.Contacts());
sequelize.define(...blueprint.ButtonTemplate());
sequelize.define(...blueprint.MessageTemplate());
sequelize.define(...blueprint.Blast());
sequelize.define(...blueprint.AutoReply());

sequelize.sync({ force: false, alter: false }).then(() => {
    console.log(modules.color("[MIGRATE]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`Re-Sync Database...`, "#82E0AA"));
    // create record users
    sequelize.models.users.findOrCreate({
        where: { username: "admin" },
        defaults: {
            name: "Administrator",
            username: "admin",
            password: bcrypt.hashSync("admin", 10),
            role: "admin",
        },
    }).then(([user, created]) => {
        if (created) {
            console.log(modules.color("[CREATE ADMIN]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`username: admin , password: admin`, "#82E0AA"));
        }
    });
}).catch((error) => {
    console.error('Unable to Re-Sync table : ', error);
})
