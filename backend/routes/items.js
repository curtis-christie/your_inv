import express from "express";
// import item route controllers - getAll, getOne, update, delete

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
