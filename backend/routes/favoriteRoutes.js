const express = require("express");
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favoriteController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getFavorites);
router
  .route("/:eventId")
  .post(protect, addFavorite)
  .delete(protect, removeFavorite);

module.exports = router;
