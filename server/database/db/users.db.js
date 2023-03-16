import Users from "../models/users.model.js";
import bcrypt from "bcrypt";
import { col, Op } from "sequelize";

class UsersDatabase {
    constructor() {
        this.table = Users;
    }

    async findAllSessionDB(data = {}) {
        return await this.table.findAll(data);
    }

    async findRecordsFiltered(search) {
        let pars = {}
        if (search) {
            pars.where = {
                name: { [Op.like]: `%${search}%` },
            }
        }
        return await this.table.findAll(pars);
    }

    async datatables({ start, length, search }) {
        let pars = {
            offset: parseInt(start),
            limit: parseInt(length),
        };
        if (search) {
            pars.where = {
                name: {
                    [Op.like]: `%${search}%`,
                }
            };
        }
        return await this.table.findAll(pars);
    }

    async delete_wherein(data = []) {
        await this.table.destroy({
            where: {
                id: {
                    [Op.in]: data,
                }
            }
        });
    }

    async store(data) {
        let user = await this.table.findOne({
            where: {
                username: data.username,
            }
        });
        if (user) {
            return { status: false, message: "Username already exists." };
        }
        let result = await this.table.create({
            name: data.name,
            username: data.username,
            password: bcrypt.hashSync(data.password, 10),
            role: data.role,
        });
        return { status: true, message: "User created successfully.", data: result };
    }

    async findOne(data = {}) {
        return await this.table.findOne(data);
    }

    async update(data = {}, where = {}) {
        return await this.table.update(data, where);
    }

    // auth
    async attempt(req, res, { username, password, remember }) {
        let user = await this.table.findOne({
            where: {
                username: username
            },
        });
        if (user) {
            if (bcrypt.compareSync(password, user.password)) {
                if (remember) {
                    let token = bcrypt.hashSync(user.username, 10);
                    res.cookie('remember', token, {
                        maxAge: 1000 * 60 * 60 * 24 * 7,
                        httpOnly: true,
                        signed: true
                    });
                    user.remember_token = token;
                    user.save();
                }
                return { status: true, user: user };
            } else {
                return { status: false, message: "Password is incorrect." };
            }
        } else {
            return { status: false, message: "User not found." };
        }
    }

    async remember(token) {
        let user = await this.table.findOne({
            where: {
                remember_token: token
            },
        });
        if (user) {
            return user;
        } else {
            return false;
        }
    }

    async getLoginUser(req) {
        return await this.table.findOne({
            where: {
                id: req.session.user_id
            },
        });
    }
}

export default UsersDatabase;