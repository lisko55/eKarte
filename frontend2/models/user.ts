import mongoose, { Schema, model, models } from "mongoose";

// 1. Definiramo pod-shemu za stavke košarice u bazi
const CartItemSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    ticketType: {
      type: Schema.Types.ObjectId, // ID vrste ulaznice
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: true },
);

// 2. Glavna User shema
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    organizationName: { type: String },
    email: { type: String, required: true, unique: true },

    googleId: { type: String }, // Za Google Login (kasnije)

    password: {
      type: String,
      // Password je obavezan samo ako nema googleId
      required: function (this: any) {
        return !this.googleId;
      },
    },

    phone: {
      type: String,
      required: function (this: any) {
        return !this.googleId;
      },
    },

    role: {
      type: String,
      enum: ["user", "admin", "superadmin", "scanner", "organizer"],
      default: "user",
    },

    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    balance: { type: Number, default: 0 },
    employer: { type: Schema.Types.ObjectId, ref: "User" }, // Referenca na poslodavca (ako je partner)

    // Košarica u bazi (korisno za sinkronizaciju ako se user logira na drugom uređaju)
    cart: [CartItemSchema],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  },
);

export default models.User || model("User", UserSchema);
