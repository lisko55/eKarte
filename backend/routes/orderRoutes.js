const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  addOrderItems,
  getMyOrders,
  getAllOrders,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, addOrderItems)
  .get(protect, authorize("superadmin", "admin"), getAllOrders);

router.get("/myorders", protect, getMyOrders);
router.post("/create-payment-intent", protect, createPaymentIntent);

module.exports = router;
