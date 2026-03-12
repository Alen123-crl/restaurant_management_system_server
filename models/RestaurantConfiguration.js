const mongoose = require("mongoose")

const restaurantConfigSchema = new mongoose.Schema({
  totalSeats:{
    type:Number,
    required:true
  },
  slotDuration:{
    type:Number,
    default:60
  }
})

module.exports = mongoose.model("RestaurantConfig",restaurantConfigSchema)