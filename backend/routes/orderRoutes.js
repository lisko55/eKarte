const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  addOrderItems,
  getMyOrders,
  getAllOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, addOrderItems)
  .get(protect, authorize("superadmin", "admin"), getAllOrders);

router.get("/myorders", protect, getMyOrders);
router.post("/create-payment-intent", protect, createPaymentIntent);
router.route("/:id").get(protect, getOrderById);

module.exports = router;
