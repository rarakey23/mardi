import { sequelize } from "../../config/Database.js";
import blueprint from "../blueprint.js";

const Users = sequelize.define(...blueprint.Users());

export default Users;
