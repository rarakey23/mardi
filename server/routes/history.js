import express from "express";
import HistoryController from "../controllers/history.controller.js";
import Middleware from "../config/Middleware.js";

const route = express.Router();
const history = new HistoryController();
route.use([Middleware.isLogin]);

route.get('/blast', history.blast.bind(history));
route.get('/blast/json', history.blast_json.bind(history));
route.post('/blast/delete', history.blast_del.bind(history));
// route.get('/json', history.json.bind(history));
// route.post('/store', history.store.bind(history));
// route.post('/delete', history.delete.bind(history));

export default route;
