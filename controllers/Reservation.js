const OpeningHours=require('../models/OpeningHours')
const Reservation=require('../models/Reservations')
const RestaurantConfig=require('../models/RestaurantConfiguration')
const SpecialHours=require('../models/SpecialHours')
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, guests } = req.query;
    if (!date || !guests) return res.status(400).json({ message: "Date and guests required" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) return res.status(400).json({ message: "Cannot book past dates" });

    // 1️⃣ Check for special day
    const special = await SpecialHours.findOne({
      date: {
        $gte: selectedDate,
        $lt: new Date(selectedDate.getTime() + 24*60*60*1000),
      },
    });

    let slotsToUse = [];

    if (special) {
      if (special.isClosed) return res.status(200).json({ message: "No slots available" });
      slotsToUse = special.slots; // array of {open, close}
    } else {
      const day = selectedDate.toLocaleString("en-US", { weekday: "long" });
      const hours = await OpeningHours.findOne({ day });
      if (!hours || !hours.isOpen) return res.status(200).json({ message: "No slots available" });
      slotsToUse = [{ open: hours.open, close: hours.close }];
    }

    // 2️⃣ Generate hourly slots for all time ranges
    const config = await RestaurantConfig.findOne();
    let allSlots = [];

    slotsToUse.forEach(({ open, close }) => {
      const startHour = parseInt(open.split(":")[0]);
      const endHour = parseInt(close.split(":")[0]);
      for (let i = startHour; i < endHour; i++) {
        if (selectedDate.getTime() === today.getTime() && i <= new Date().getHours()) continue; // skip past
        allSlots.push(`${i}:00`);
      }
    });

    // 3️⃣ Filter by available seats
    const selectedDateObj = new Date(date);
    selectedDateObj.setHours(0, 0, 0, 0);

    const reservations = await Reservation.find({
      date: {
        $gte: selectedDateObj,
        $lt: new Date(selectedDateObj.getTime() + 24*60*60*1000),
      },
    });

    const availableSlots = allSlots.filter(slot => {
      const bookedSeats = reservations
        .filter(r => r.slot === slot)
        .reduce((sum, r) => sum + r.guests, 0);
      return bookedSeats + Number(guests) <= config.totalSeats;
    });

    if (availableSlots.length === 0) return res.status(200).json({ message: "No slots available" });

    res.status(200).json({ slots: availableSlots });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

//create reservation 

exports.createReservation = async (req, res) => {
  try {
  const { date, slot, guests, name, phone, email } = req.body;
if (!date || !slot || !guests || !name || !phone || !email) {
  return res.status(400).json({ message: "All fields are required" });
}

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) return res.status(400).json({ message: "Cannot book past dates" });

    const now = new Date();
    if (selectedDate.getTime() === today.getTime() && parseInt(slot.split(":")[0]) <= now.getHours()) {
      return res.status(400).json({ message: "Cannot book past time slots" });
    }

    // Check special day
    const special = await SpecialHours.findOne({ date: selectedDate });
    let slotsToUse = [];

    if (special) {
      if (special.isClosed) return res.status(400).json({ message: "Restaurant is closed on this special day" });
      slotsToUse = special.slots;
    } else {
      const day = selectedDate.toLocaleString("en-US", { weekday: "long" });
      const hours = await OpeningHours.findOne({ day });
      if (!hours || !hours.isOpen) return res.status(400).json({ message: "Restaurant is closed on this day" });
      slotsToUse = [{ open: hours.open, close: hours.close }];
    }

    // Check if slot falls in any allowed slot range
    const slotHour = parseInt(slot.split(":")[0]);
    const isValidSlot = slotsToUse.some(({ open, close }) => {
      const openHour = parseInt(open.split(":")[0]);
      const closeHour = parseInt(close.split(":")[0]);
      return slotHour >= openHour && slotHour < closeHour;
    });

    if (!isValidSlot) return res.status(400).json({ message: "Selected slot is outside working hours" });

    // Seat availability
    const config = await RestaurantConfig.findOne();
    const reservations = await Reservation.find({ date, slot });
    const bookedSeats = reservations.reduce((sum, r) => sum + r.guests, 0);

    if (bookedSeats + guests > config.totalSeats) return res.status(400).json({ message: "Not enough seats available" });

    // Create reservation
    const reservation = new Reservation({ ...req.body, date: new Date(date) });
    const saved = await reservation.save();
    res.status(201).json(saved);

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.getReservations = async (req, res) => {
  try {
    const { date, slot } = req.query; // optional filters
    let filter = {};

    // 1️⃣ Filter by date if provided
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      filter.date = {
        $gte: selectedDate,
        $lt: new Date(selectedDate.getTime() + 24*60*60*1000),
      };
    }

    // 2️⃣ Filter by slot if provided
    if (slot) {
      filter.slot = slot;
    }

    // 3️⃣ Fetch reservations
    const reservations = await Reservation.find(filter).sort({ date: 1, slot: 1 });

    // 4️⃣ Fetch total seats from config
    const config = await RestaurantConfig.findOne();

    // 5️⃣ Group reservations by date + slot
    const grouped = {};
    reservations.forEach(r => {
      const key = `${r.date.toISOString().split("T")[0]}-${r.slot}`;
      if (!grouped[key]) grouped[key] = { slot: r.slot, date: r.date, booked: 0, reservations: [] };
      grouped[key].booked += r.guests;
      grouped[key].reservations.push(r);
    });

    // 6️⃣ Calculate remaining seats
    const result = Object.values(grouped).map(g => ({
      ...g,
      remainingSeats: config.totalSeats - g.booked,
    }));

    // 7️⃣ Send response
    res.status(200).json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err });
  }
};