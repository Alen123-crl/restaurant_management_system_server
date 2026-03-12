// models/Menu.js
const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // foreign key
  image: String,
}, { timestamps: true });

module.exports = mongoose.model("Menu", menuSchema);