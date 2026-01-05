const express = require("express");
const router = express.Router();
const controller = require("../controllers/recordController");

// CREATE
router.post("/", controller.createRecord);

// READ
router.get("/", controller.getAllRecords);
router.get("/:id", controller.getRecordById);

// DELETE
router.delete("/:id", controller.deleteRecord);

router.get("/:id/download", controller.downloadRecordPDF);

module.exports = router;
