const mongoose = require("mongoose")

const openingHoursSchema = new mongoose.Schema({

 day:{
  type:String,
  required:true,
  unique:true,
  enum:[
   "Monday","Tuesday","Wednesday",
   "Thursday","Friday","Saturday","Sunday"
  ]
 },

 open:{
  type:String,
  required:true
 },

 close:{
  type:String,
  required:true
 },

 isOpen:{
  type:Boolean,
  default:true
 }

})

module.exports = mongoose.model("OpeningHours",openingHoursSchema)