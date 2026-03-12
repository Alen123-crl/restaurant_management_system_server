const mongoose = require("mongoose")

const specialHoursSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  slots: [
    {
      open: { type: String },    // "13:00"
      close: { type: String }    // "17:00"
    }
  ],
  isClosed: {
    type: Boolean,
    default: false
  },
  note: { type: String }
}, { timestamps: true })

module.exports = mongoose.model("SpecialHours", specialHoursSchema)