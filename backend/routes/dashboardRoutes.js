const express = require("express");
const router = express.Router();
const { getStats } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/stats", protect, authorize("superadmin", "admin"), getStats);

module.exports = router;
