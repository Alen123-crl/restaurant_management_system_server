const Category = require("../models/Category")

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body

    // ❌ Duplicate check
    const existing = await Category.findOne({ name })
    if (existing) return res.status(400).json("Category already exists")

    const category = new Category({ name })
    const saved = await category.save()

    res.status(201).json(saved)
  } catch (err) {
    res.status(500).json(err)
  }
}

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.status(200).json(categories)
  } catch (err) {
    res.status(500).json(err)
  }
}

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body

    const updated = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    )

    res.status(200).json(updated)
  } catch (err) {
    res.status(500).json(err)
  }
}

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    await Category.findByIdAndDelete(id)
    res.status(200).json({ message: "Category deleted successfully" })
  } catch (err) {
    res.status(500).json(err)
  }
}