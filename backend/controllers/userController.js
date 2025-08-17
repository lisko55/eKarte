const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, lastName, email, password, phone } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Korisnik s ovim emailom već postoji" }] });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user = new User({
      name,
      lastName,
      email,
      password: hashedPassword,
      phone,
      verificationToken,
    });
    await user.save();

    const verificationUrl = `${process.env.BACKEND_URL}/api/users/verify-email?token=${verificationToken}`;
    const message = `<h1>Potvrda Email Adrese</h1><p>Molimo kliknite na sljedeći link da biste aktivirali svoj račun:</p><a href="${verificationUrl}">${verificationUrl}</a>`;
    await sendEmail({
      email: user.email,
      subject: "Aktivacija računa - eKarte",
      message,
    });

    res.status(201).json({
      message:
        "Registracija uspješna! Molimo provjerite vaš email za aktivacijski link.",
    });
  } catch (error) {
    console.error("GREŠKA U registerUser:", error);
    res.status(500).send("Greška na serveru");
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send(`... Greška ...`);
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h1>Link je neispravan</h1>
          <p>Verifikacijski link je neispravan ili je već iskorišten. Molimo pokušajte se prijaviti.</p>
          <a href="${process.env.FRONTEND_URL}/login">Idi na Prijavu</a>
        </div>
      `);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (error) {
    res.status(500).send("<h1>Greška na serveru</h1>");
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Neispravni podaci za prijavu" }] });
    }
    if (!user.isVerified) {
      return res.status(401).json({
        errors: [{ msg: "Vaš račun nije aktiviran. Molimo provjerite email." }],
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Neispravni podaci za prijavu" }] });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        });
      }
    );
  } catch (error) {
    console.error("GREŠKA U loginUser:", error);
    res.status(500).send("Greška na serveru");
  }
};
const getUsers = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const count = await User.countDocuments({});
    const users = await User.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .select("-password");

    res.json({
      users,
      page,
      pages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru" });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (req.params.id === req.user.id) {
        return res
          .status(400)
          .json({ message: "Ne možete mijenjati vlastitu ulogu." });
      }
      if (user.role === "superadmin") {
        return res
          .status(403)
          .json({ message: "Ne možete mijenjati ulogu drugog Super Admina." });
      }
      user.name = req.body.name || user.name;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: "Korisnik nije pronađen" });
    }
  } catch (error) {
    res.status(400).json({
      message: "Greška pri ažuriranju korisnika",
      error: error.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      const payload = { user: { id: updatedUser.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "5h",
      });

      res.json({
        token,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
        },
      });
    } else {
      res.status(404).json({ message: "Korisnik nije pronađen" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Greška pri ažuriranju profila", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  let user;
  try {
    user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res
        .status(200)
        .json({ message: "Link za resetiranje je poslan." });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;

    const message = `
      <h1>Zahtjev za Resetiranje Lozinke</h1>
      <p>Molimo kliknite na link ispod da postavite novu lozinku.</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>Ovaj link ističe za 10 minuta.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: "Resetiranje Lozinke - eKarte",
      message,
    });

    res
      .status(200)
      .json({ message: "Email za resetiranje lozinke je poslan." });
  } catch (error) {
    console.error("GREŠKA U forgotPassword:", error);

    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(500).json({ message: "Došlo je do greške pri slanju emaila." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const resetToken = req.params.resettoken;

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Nevažeći ili istekao token za resetiranje." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Lozinka uspješno promijenjena." });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Nevažeći ili istekao token za resetiranje." });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen" });
    }

    if (
      req.user.role !== "admin" &&
      req.user.role !== "superadmin" &&
      req.user._id.toString() !== user._id.toString()
    ) {
      return res
        .status(401)
        .json({ message: "Niste autorizirani za ovu akciju" });
    }

    if (user.role === "superadmin") {
      return res
        .status(400)
        .json({ message: "Nije moguće obrisati Super Admina." });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: "Korisnik uspješno obrisan" });
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  updateUser,
  updateUserProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  deleteUser,
};
