import express from "express";
import BlastController from "../controllers/blast.controller.js";
import Middleware from "../config/Middleware.js";

const route = express.Router();
const blast = new BlastController();
route.use([Middleware.isLogin]);

route.get('/', blast.index.bind(blast));
route.post('/store', blast.store.bind(blast));
route.get('/json', blast.json.bind(blast));

export default route;
