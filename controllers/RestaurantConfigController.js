const RestaurantConfig=require('../models/RestaurantConfiguration')

// Create config (only once)
exports.createConfig = async (req,res)=>{
 try{

  const existing = await RestaurantConfig.findOne()

  if(existing){
   return res.status(400).json("Config already exists")
  }

  const config = new RestaurantConfig(req.body)

  const saved = await config.save()

  res.status(201).json(saved)

 }catch(err){
  res.status(500).json(err)
 }
}

// Update config
exports.updateConfig = async (req,res)=>{
 try{

  const updated = await RestaurantConfig.findOneAndUpdate(
   {},
   req.body,
   {new:true}
  )

  res.status(200).json(updated)

 }catch(err){
  res.status(500).json(err)
 }
}

// Get config
exports.getConfig = async (req,res)=>{
 try{

  const config = await RestaurantConfig.findOne()

  res.status(200).json(config)

 }catch(err){
  res.status(500).json(err)
 }
}