const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getUsers,
  updateUser,
  updateUserProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  deleteUser,
} = require("../controllers/userController");
const passport = require("passport");

router.post(
  "/register",
  [
    body("name", "Ime je obavezno").not().isEmpty(),
    body("lastName", "Prezime je obavezno").not().isEmpty(),
    body("email", "Molimo unesite ispravan email").isEmail(),
    body("phone", "Broj telefona je obavezan").not().isEmpty(),
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

router.get("/verify-email", verifyEmail);

router.put("/profile", protect, updateUserProfile);

router.get("/", protect, authorize("admin", "superadmin"), getUsers);

router.put("/:id", protect, authorize("superadmin"), updateUser);

router.post("/forgotpassword", forgotPassword);

router.put("/resetpassword/:resettoken", resetPassword);

router.route("/:id").delete(protect, authorize("superadmin"), deleteUser);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect("http://localhost:3000/login");
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const payload = { user: { id: req.user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    const userForClient = {
      id: req.user.id,
      name: req.user.name,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    };
    res.redirect(
      `http://localhost:3000/login/success?token=${token}&user=${JSON.stringify(
        userForClient
      )}`
    );
  }
);

module.exports = router;
