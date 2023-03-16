import { sequelize } from "../../config/Database.js";
import blueprint from "../blueprint.js";
import { Op } from "sequelize";

const MessageTemplate = sequelize.define(...blueprint.MessageTemplate());

class MessageDB {
    constructor() {
        this.message = MessageTemplate;
    }


    async findAllSessionDB(data) {
        return await this.message.findAll(data);
    }

    async deleteWhereIn(id) {
        return await this.message.destroy({
            where: {
                id: {
                    [Op.in]: id
                }
            }
        });
    }

    async store(data) {
        return await this.message.create(data);
    }

}

export { MessageTemplate, MessageDB };
