import express from "express";
import Middleware from "../config/Middleware.js";
import AdminController from "../controllers/admin.controller.js";

const adminController = new AdminController();

const route = express.Router();
route.use([Middleware.isLogin, Middleware.isAdmin]);

route.get("/users", adminController.users.bind(adminController));
route.get("/users/json", adminController.users_json.bind(adminController));
route.post("/users/store", adminController.users_store.bind(adminController));
route.get("/users/edit/:id", adminController.users_edit.bind(adminController));
route.post('/users/update', adminController.users_update.bind(adminController));
route.post("/users/delete", adminController.users_delete.bind(adminController));

export default route;
