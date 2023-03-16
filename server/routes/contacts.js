import express from "express";
import ContactsController from "../controllers/contacts.controller.js";
import Middleware from "../config/Middleware.js";

const route = express.Router();
const contactsController = new ContactsController();
route.use([Middleware.isLogin]);

route.get('/', contactsController.index.bind(contactsController));
route.post('/create', contactsController.create.bind(contactsController));
route.get('/json', contactsController.json.bind(contactsController));
route.post('/delete-all', contactsController.delete_all.bind(contactsController));
route.post('/delete', contactsController.delete.bind(contactsController));
route.post('/delete-label', contactsController.delete_label.bind(contactsController));

export default route;
