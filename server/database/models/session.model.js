import { sequelize } from "../../config/Database.js";
import blueprint from "../blueprint.js";

const Session = sequelize.define(...blueprint.Session());

export default Session;
