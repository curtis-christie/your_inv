// src/controllers/vanController.js
import { Van } from "../models/van.model.js";

export async function getVans(req, res, next) {
  try {
    const vans = await Van.find().sort({ createdAt: 1 }).lean();
    res.json(vans);
  } catch (err) {
    next(err);
  }
}
