const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  image: { type: String }, // store image filename or URL
}, { timestamps: true }); // optional: createdAt, updatedAt

module.exports = mongoose.model("Blog", blogSchema);