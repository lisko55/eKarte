const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  addOrderItems,
  getMyOrders,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.get("/myorders", protect, getMyOrders);
router.post("/create-payment-intent", protect, createPaymentIntent);
router.post("/", protect, addOrderItems);

module.exports = router;
