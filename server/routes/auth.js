import express from "express";
import AuthController from "../controllers/auth.controller.js";
import Middleware from "../config/Middleware.js";

const route = express.Router();
const authController = new AuthController();
route.get('/login', Middleware.isLogout, authController.index.bind(authController));
route.post('/login', Middleware.isLogout, authController.store.bind(authController));
route.get('/logout', Middleware.isLogin, authController.logout.bind(authController));

export default route;
