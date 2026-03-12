const Admin = require("../models/Admin")
const jwt = require("jsonwebtoken")

exports.loginAdmin = async (req, res) => {
  try {

    const { email, password } = req.body

    // check admin exists
    const admin = await Admin.findOne({ email })

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    // compare password directly
    if (admin.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // generate token
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
    )

    res.status(200).json({
      message: "Login successful",
      token
    })

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}
