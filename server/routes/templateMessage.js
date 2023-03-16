import express from "express";
import templateMessageController from "../controllers/templatemessage.controller.js";
import Middleware from "../config/Middleware.js";

const route = express.Router();
const templateMessage = new templateMessageController();
route.use([Middleware.isLogin]);

route.get('/', templateMessage.index.bind(templateMessage));
route.get('/json', templateMessage.json.bind(templateMessage));
route.post('/store', templateMessage.store.bind(templateMessage));
route.post('/update', templateMessage.update.bind(templateMessage));
route.post('/delete', templateMessage.delete.bind(templateMessage));
route.get('/:id', templateMessage.detail.bind(templateMessage));

export default route;
