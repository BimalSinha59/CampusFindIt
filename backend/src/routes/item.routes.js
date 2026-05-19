import { Router } from "express";
import { 
    createItem, 
    getAllItems, 
    getItemById, 
    deleteItem 
} from "../controllers/item.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/")
    .get(getAllItems)
    .post(verifyJWT, createItem);

router.route("/:id")
    .get(getItemById)
    .delete(verifyJWT, deleteItem);

export default router;