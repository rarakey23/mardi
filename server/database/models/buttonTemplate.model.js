import { sequelize } from "../../config/Database.js";
import { col, Op } from "sequelize";
import blueprint from "../blueprint.js";

const ButtonTemplate = sequelize.define(...blueprint.ButtonTemplate());

class ButtonTemplateModel {
    constructor() {
        this.table = ButtonTemplate;
    }

    async deleteIn(id) {
        return await this.table.destroy({
            where: {
                id_message_template: {
                    [Op.in]: id
                }
            }
        });
    }
}

export { ButtonTemplate, ButtonTemplateModel };
