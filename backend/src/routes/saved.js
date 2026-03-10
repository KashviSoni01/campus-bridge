import express from "express";
import { saved } from "../data/store.js";

const router = express.Router();


/* Save opportunity */

router.post("/", (req, res) => {

  const newSave = {
    id: Date.now().toString(),
    ...req.body
  };

  saved.push(newSave);

  res.status(201).json(newSave);
});


/* Get saved opportunities */

router.get("/", (req, res) => {
  res.json(saved);
});


/* Remove saved */

router.delete("/:id", (req, res) => {

  const index = saved.findIndex(
    (s) => s.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({ message: "Saved item not found" });
  }

  saved.splice(index, 1);

  res.json({ message: "Removed from saved" });
});

export default router;