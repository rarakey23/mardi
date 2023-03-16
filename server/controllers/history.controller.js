import { Blast, BlastDatabase } from "../database/models/blast.model.js";
import Middleware from "../config/Middleware.js";
import { col, Op } from "sequelize";
import { sequelize } from "../config/database.js";

class HistoryController {
    constructor() {
        this.Mblast = Blast;
        this.FBlast = new BlastDatabase();
    }

    async blast(req, res) {
        return res.render("history/blast", {
            page_active: "history/blast",
            layout: "layouts/app",
            user: await Middleware.Auth(req),
            in_page_label: req.query.label ? req.query.label : null,
        });
    }

    async blast_del(req, res) {
        try {
            let by = req.query.by;
            let id = req.body.id;
            switch (by) {
                case "label":
                    await this.Mblast.destroy({
                        where: {
                            title: {
                                [Op.in]: id
                            }
                        }
                    });
                    return res.json({ status: true });
                    break
                case "numbers":
                    await this.Mblast.destroy({
                        where: {
                            id: {
                                [Op.in]: id
                            }
                        }
                    });
                    return res.json({ status: true });
                    break
                default:
                    break
            }
        } catch (e) {
            return res.json({ status: false, message: e.message });
        }
    }

    async blast_json(request, res) {
        var draw = request.query.draw;
        var start = request.query.start;
        var length = request.query.length;
        var order_data = request.query.order;
        var search = request.query.search['value'];

        if (request.query.by == 'label') {
            const totalall = await this.Mblast.findAll({
                raw: true,
                attributes: [
                    'title', [col('title'), 'title'],
                    [sequelize.fn('COUNT', sequelize.col('title')), 'total']
                ],
                group: ['title'],
                where: { user_id: request.session.user_id, },
            });

            const totalFiltered = await this.Mblast.findAll({
                raw: true,
                attributes: [
                    'title', [col('title'), 'title'],
                    [sequelize.fn('COUNT', sequelize.col('title')), 'total']
                ],
                where: { title: { [Op.like]: `%${search}%` }, user_id: request.session.user_id, }, group: ['title'],
            });

            let result = await this.Mblast.findAll({
                raw: true,
                attributes: [
                    'title', [col('title'), 'title'],
                    [sequelize.fn('COUNT', sequelize.col('title')), 'total']
                ],
                where: {
                    user_id: request.session.user_id,
                    title: {
                        [Op.like]: `%${search}%`,
                    }
                },
                offset: parseInt(start),
                limit: parseInt(length),
                group: ['title'],
            });
            return res.json({
                draw: draw,
                recordsTotal: totalall.length,
                recordsFiltered: totalFiltered.length,
                data: result.map((item) => {
                    return {
                        id: item.title,
                        responsive_id: null,
                        title: item.title,
                        total: item.total,
                        action: `<a href="/history/blast?label=${item.title}" class="btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-list"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></a>`,
                    }
                }),
            });
        } else if (request.query.by == 'numbers') {
            const totalall = await this.FBlast.getBlast({
                where: { user_id: request.session.user_id, },
            });

            const totalFiltered = await this.FBlast.getBlast({
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } },
                    ],
                    user_id: request.session.user_id,
                }
            });

            let result = await this.FBlast.getBlast({
                where: {
                    user_id: request.session.user_id,
                    [Op.or]: [
                        { title: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } },
                    ]
                },
                offset: parseInt(start),
                limit: parseInt(length),
            });
            return res.json({
                draw: draw,
                recordsTotal: totalall.length,
                recordsFiltered: totalFiltered.length,
                data: result.map((item) => {
                    return {
                        id: item.id,
                        responsive_id: null,
                        template: `<a href="/template-message/${item.message_template.id}">${item.message_template.title}</a>`,
                        receiver: item.receiver,
                        status: item.status,
                        is_save: item.is_save,
                    }
                }),
            });
        }
    }


}

export default HistoryController; 