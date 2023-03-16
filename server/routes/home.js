import express from "express";
import HomeController from "../controllers/home.controller.js";
import Middleware from "../config/Middleware.js";

const route = express.Router();
const homeController = new HomeController();

route.get('/', Middleware.isLogin, homeController.index.bind(homeController));
route.post('/', Middleware.isLogin, homeController.index.bind(homeController));
route.get('/device/:session_name', Middleware.isLogin, homeController.device.bind(homeController));

route.get('/json/device', Middleware.isLogin, homeController.json.bind(homeController));

export default route;
