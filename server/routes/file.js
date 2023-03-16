import express from "express";
import FileController from "../controllers/file.controller.js";
import Middleware from "../config/Middleware.js";

const route = express.Router();
const file = new FileController();
route.use([Middleware.isLogin]);

route.get('/', file.index.bind(file));
route.get('/lyn-modal', file.lyn_modal.bind(file));
route.get('/part/show', file.part_show.bind(file));
route.get('/part/detail', file.part_detail.bind(file));
route.get('/part/delete', file.part_delete.bind(file));
route.post('/part/upload', file.part_upload.bind(file));

export default route;
