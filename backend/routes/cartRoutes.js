const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, addToCart)
  .get(protect, getCart)
  .delete(protect, clearCart);

router.route("/:ticketTypeId").delete(protect, removeFromCart);

module.exports = router;
