const OpeningHours = require("../models/OpeningHours")



exports.createOpeningHours = async (req,res)=>{

 const hours = req.body   // array of days

 try{

  const existing = await OpeningHours.find()

  if(existing.length > 0){
   return res.status(400).json("Opening hours already created")
  }

  const data = await OpeningHours.insertMany(hours)

  res.status(201).json(data)

 }catch(err){

  res.status(500).json(err)

 }

}
exports.updateOpeningHours = async (req, res) => {

  const hours = req.body   // array of days

  try {

    const updates = hours.map(day =>
      OpeningHours.findByIdAndUpdate(
        day._id,
        {
          open: day.open,
          close: day.close,
          isOpen: day.isOpen
        },
        { new: true }
      )
    )

    const result = await Promise.all(updates)

    res.status(200).json(result)

  } catch (err) {
    res.status(500).json(err)
  }

}
exports.getOpeningHours = async (req,res)=>{

 try{

  const hours = await OpeningHours.find()

  res.status(200).json(hours)

 }catch(err){

  res.status(500).json(err)

 }

}