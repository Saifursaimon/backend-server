const express = require("express");
const router = express.Router();
const controller = require("../controllers/recordController");

// CREATE
router.post("/", controller.createRecord);

// READ
router.get("/", controller.getAllRecords);
router.get("/:id", controller.getRecordById);
router.put("/:id", controller.updateRecord);
router.delete("/:id", controller.deleteRecord);


module.exports = router;
