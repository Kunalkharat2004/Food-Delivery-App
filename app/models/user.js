const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "customer" },
    phone: { type: String },
    address: { type: String },
    profileImage: {
      type: String,
      default:
        "https://res.cloudinary.com/diuihziup/image/upload/v1746362589/medicare/uwzckri5qzfmkduzg98m.png",
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
