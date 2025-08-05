const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getUsers,
  updateUser,
  updateUserProfile,
} = require("../controllers/userController");

const phoneRegex = /^(\+)?([0-9\s\-\(\)]{9,15})$/;

router.post(
  "/register",
  [
    body("name", "Ime je obavezno").not().isEmpty(),
    body("lastName", "Prezime je obavezno").not().isEmpty(),
    body("email", "Molimo unesite ispravan email").isEmail(),

    body("phone")
      .matches(phoneRegex)
      .withMessage("Broj telefona nije u ispravnom formatu"),

    body("password", "Lozinka mora imati najmanje 6 znakova").isLength({
      min: 6,
    }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Lozinke se ne podudaraju");
      }
      return true;
    }),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email", "Molimo unesite ispravan email").isEmail(),
    body("password", "Lozinka je obavezna").exists(),
  ],
  loginUser
);
router.route("/profile").put(protect, updateUserProfile);
router
  .route("/")
  .post(registerUser)
  .get(protect, authorize("superadmin", "admin"), getUsers);

router.route("/:id").put(protect, authorize("superadmin"), updateUser);

module.exports = router;
