import { sequelize } from "../../config/Database.js";
import blueprint from "../blueprint.js";
import { Op } from "sequelize";
import { MessageTemplate } from "./messageTemplate.model.js";

const Blast = sequelize.define(...blueprint.Blast());

Blast.belongsTo(MessageTemplate, { foreignKey: "id_message_template" });

class BlastDatabase {
    constructor() {
        this.table = Blast;
        this.messageTemplate = MessageTemplate;
    }

    async getBlast(data) {
        let pars = data;
        pars.include = [
            { model: this.messageTemplate },
        ]
        return await this.table.findAll(data);
    }

    async delMessageTemplateIn(id) {
        return await this.table.destroy({
            where: {
                id_message_template: {
                    [Op.in]: id
                }
            }
        });
    }
}

export { Blast, BlastDatabase };
