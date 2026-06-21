import { Router } from "express";
import {
    createItem,
    getAllItems,
    searchItems,
    getItemById,
    deleteItem
} from "../controllers/item.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/")
    .get(getAllItems)
    .post(verifyJWT, createItem);

//------ /search must be defined BEFORE /:id
// Otherwise Express matches "search" as the :id param and calls getItemById
router.route("/search").get(searchItems);

router.route("/:id")
    .get(getItemById)
    .delete(verifyJWT, deleteItem);

export default router;