const SpecialHours = require("../models/SpecialHours")

exports.createSpecialHours = async (req, res) => {
  const { date, slots, isClosed, note } = req.body

  try {
    const today = new Date()
    const selectedDate = new Date(date)
    selectedDate.setHours(0,0,0,0)
    today.setHours(0,0,0,0)

    // ❌ Past date check
    if (selectedDate < today) {
      return res.status(400).json("Cannot add past dates")
    }

    // ❌ Duplicate date check
    const existing = await SpecialHours.findOne({ date })
    if (existing) {
      return res.status(400).json("Special hours already added for this date")
    }

    const newSpecial = new SpecialHours({
      date,
      slots: slots || [],
      isClosed: isClosed || false,
      note
    })

    await newSpecial.save()
    res.status(201).json(newSpecial)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.getSpecialHours = async (req,res) => {
  try {
    const now = new Date(); // full current datetime

    const allSpecial = await SpecialHours.find();

    const upcoming = [];
    const toDeleteIds = [];

    allSpecial.forEach(item => {
      let keep = false;

      // If closed full day, check date only
      if(item.isClosed){
        const itemDate = new Date(item.date);
        itemDate.setHours(23,59,59,999); // end of day
        if(itemDate >= now) keep = true;
      } else {
        // Check if any slot is still upcoming
        for(const sl of item.slots){
          const slotDate = new Date(item.date);
          const [openH, openM] = sl.open.split(":").map(Number);
          const [closeH, closeM] = sl.close.split(":").map(Number);

          const slotClose = new Date(slotDate);
          slotClose.setHours(closeH, closeM, 0, 0);

          if(slotClose >= now){
            keep = true; // at least one slot is in future
            break;
          }
        }
      }

      if(keep){
        upcoming.push(item);
      } else {
        toDeleteIds.push(item._id);
      }
    });

    if(toDeleteIds.length > 0){
      await SpecialHours.deleteMany({ _id: { $in: toDeleteIds } });
    }

    res.status(200).json(upcoming);

  } catch(err){
    res.status(500).json(err);
  }
}


exports.updateSpecialHours = async (req,res)=>{

 const {id} = req.params
 const {open,close,isClosed,note} = req.body

 try{

  const updated = await SpecialHours.findByIdAndUpdate(
   id,
   {open,close,isClosed,note},
   {new:true}
  )

  res.status(200).json(updated)

 }catch(err){

  res.status(500).json(err)

 }

}