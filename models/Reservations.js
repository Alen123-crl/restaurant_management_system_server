const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: { type: String, required: true }, // added email field
  date: { type: Date, required: true },
  slot: String,
  guests: Number
});

module.exports = mongoose.model("Reservation", reservationSchema);