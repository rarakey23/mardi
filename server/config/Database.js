import { Sequelize } from "sequelize";
import { modules } from "../../lib/index.js";
import { moment } from "./index.js";

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
			storage: "./server/database/sqlite/db.ilsya.sqlite",
			logging: false
		}
	);
}

function connectDatabase() {
	sequelize
		.authenticate()
		.then(() => {
			console.log(modules.color("[APP]", "#EB6112"), modules.color(moment().format("DD/MM/YY HH:mm:ss"), "#F8C471"), modules.color(`Connection Database has been established Successfully`, "#82E0AA"));
		})
		.catch((error) => {
			console.error(error);
		});
}

export { connectDatabase, sequelize };
