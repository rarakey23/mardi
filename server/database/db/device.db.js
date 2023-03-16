import Session from "../models/session.model.js";
import { Op } from "sequelize";

class SessionDatabase {
	constructor() {
		this.session = Session;
	}

	async createSessionDB(user_id, session_name, session_number) {
		await this.session.create({ user_id, session_name, session_number, status: "CONNECTED" });
	}

	async updateSessionNumberDB(session_name, session_number) {
		const sesi = await this.session.findOne({ where: { session_name } });
		if (sesi) {
			await sesi.update({ session_number, status: "CONNECTED" });
		}
	}

	async deleteSessionDB(session_name) {
		const sesi = await this.session.findOne({ where: { session_name } });
		if (sesi) {
			sesi.destroy();
		}
	}

	async findOneSessionDB(session_name) {
		let pars = { where: { session_name } };
		return await this.session.findOne(pars);
	}

	async findAllSessionDB(data = {}) {
		return await this.session.findAll(data);
	}

	async updateStatusSessionDB(session_name, status) {
		const sesi = await this.session.findOne({ where: { session_name } });
		if (sesi) {
			await sesi.update({ status });
		}
	}

	async startProgram() {
		const array = await this.session.findAll();
		if (Array.isArray(array) && array.length !== 0) {
			array.map(async (value) => {
				value.status = "STOPPED";
				await this.session.update(
					{ status: "STOPPED" },
					{
						where: {
							session_name: value.session_name,
						},
					}
				);
			});
		}
	}
}

export default SessionDatabase;
