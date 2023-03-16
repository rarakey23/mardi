import express from "express";
import AutoreplyController from "../controllers/autoreply.controller.js";
import Middleware from "../config/Middleware.js";

const route = express.Router();
const autoreply = new AutoreplyController();
route.use([Middleware.isLogin]);

route.get('/', autoreply.index.bind(autoreply));
route.get('/json', autoreply.json.bind(autoreply));
route.post('/store', autoreply.store.bind(autoreply));
route.post('/delete', autoreply.delete.bind(autoreply));

export default route;
