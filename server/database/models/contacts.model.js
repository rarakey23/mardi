import { sequelize } from "../../config/Database.js";
import { col, Op } from "sequelize";
import blueprint from "../blueprint.js";

const Contacts = sequelize.define(...blueprint.Contacts());

class ContactsDatabase {
    constructor() {
        this.contacts = Contacts;
    }

    async createContactsDB(data = {}) {
        await this.contacts.create(data);
    }

    async findOneContactDB(data = {}) {
        let status = await this.contacts.findOne(data);
        if (status) {
            return status;
        } else {
            return false;
        }

    }

    async findAllContactsDB(data = {}) {
        let result = await this.contacts.findAll(data);
        return result;
    }

    async datatables({ start, length, search, user_id }) {
        let pars = {
            offset: parseInt(start),
            limit: parseInt(length),
            where: {
                user_id: user_id,
            },
        };
        if (search) {
            pars.where = {
                number: {
                    [Op.like]: `%${search}%`,
                },
            };
        }
        let result = await this.contacts.findAll(pars);
        return result;
    }

    async findRecordsFiltered(search, user_id) {
        let pars = {
            where: {
                user_id: user_id,
            },
        }
        if (search) {
            pars.where = {
                number: {
                    [Op.like]: `%${search}%`,
                }
            };
        }
        let result = await this.contacts.findAll(pars);
        return result;
    }

    async deleteAllContactsDB(data = {}) {
        await this.contacts.destroy(data);
    }

    async delete_wherein(data = []) {
        await this.contacts.destroy({
            where: {
                id: {
                    [Op.in]: data,
                }
            }
        });
    }

    async delete_by_label(label) {
        await this.contacts.destroy({
            where: {
                label: label,
            }
        });
    }

    async getGroupByLabel(data = {}) {
        let pars = data;
        pars.raw = true;
        pars.attributes = [
            'label', [col('label'), 'label'],
            [sequelize.fn('COUNT', sequelize.col('label')), 'total']
        ];
        pars.group = ['label'];
        let result = await this.contacts.findAll(pars);
        return result;
    }
}

export { Contacts, ContactsDatabase };
