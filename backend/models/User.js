const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const CartItemSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    ticketType: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    googleId: { type: String },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    phone: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    cart: [CartItemSchema],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },

  {
    timestamps: true,
  }
);
UserSchema.methods.getResetPasswordToken = function () {
  const payload = {
    id: this._id,
    random: Math.random(),
  };

  const resetToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  this.resetPasswordToken = resetToken;
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minuta

  return resetToken;
};
module.exports = mongoose.model("User", UserSchema);
