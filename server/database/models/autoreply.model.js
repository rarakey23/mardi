import { sequelize } from "../../config/Database.js";
import blueprint from "../blueprint.js";
import { MessageTemplate } from "./messageTemplate.model.js";
import Session from "./session.model.js";
import { Op } from "sequelize";

const AutoReply = sequelize.define(...blueprint.AutoReply());

AutoReply.belongsTo(MessageTemplate, { foreignKey: "id_message_template" });
AutoReply.belongsTo(Session, { foreignKey: "id_device" });

class ReplyDatabase {
    constructor() {
        this.table = AutoReply;
        this.messageTemplate = MessageTemplate;
        this.Device = Session;
    }

    async findAll(data = {}) {
        let pars = data;
        pars.include = [
            { model: this.messageTemplate, attributes: ["id", "title"] },
            { model: this.Device, attributes: ["id", "session_name"] },
        ];
        return await this.table.findAll(pars);
    }

    async getAutoReply({ device, keyword }) {
        // from where device.session_number
        // keyword where keyword
        return await this.table.findAll({
            where: { keyword },
            include: [
                { model: this.messageTemplate },
                { model: this.Device, attributes: ["id", "session_name", "session_number"], where: { session_number: device } },
            ],
        });
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

export { AutoReply, ReplyDatabase };
