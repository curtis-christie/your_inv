import express from "express";
import {
  getAllItems,
  getOneItem,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

const router = express.Router();

// get all items
router.get("/", getAllItems);

// get one item
router.get("/:id", getOneItem);

// create item
router.post("/", createItem);

// update item
router.get("/:id", updateItem);

// delete item
router.get("/:id", deleteItem);

export default router;
