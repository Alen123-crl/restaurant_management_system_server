const Blog = require("../models/Blog");
const path = require("path");
const fs = require("fs");

// ----------------- CREATE BLOG -----------------


exports.createBlog = async (req, res) => {
  try {
    const { title, content, date } = req.body;
    const image = req.file ? req.file.filename : null;

    // 1. Validation: Required fields
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!content || content.trim().length < 20) {
      return res.status(400).json({ error: "Content must be at least 50 characters" });
    }

    // 2. Validation: Date
    let blogDate = new Date();
    if (date) {
      blogDate = new Date(date);
      if (isNaN(blogDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      if (blogDate > new Date()) {
        return res.status(400).json({ error: "Date cannot be in the future" });
      }
    }

    // 3. Create blog
    const blog = new Blog({
      title: title.trim(),
      content: content.trim(),
      date: blogDate,
      image
    });

    const savedBlog = await blog.save();
    res.status(201).json({ message: "Blog created successfully", savedBlog });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ----------------- EDIT BLOG -----------------
exports.editBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, date } = req.body;
    const image = req.file ? req.file.filename : null;

    // 1. Find existing blog
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // 2. Validate updated data
    if (title !== undefined && title.trim() === "") {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    if (content !== undefined && content.trim().length < 50) {
      return res.status(400).json({ error: "Content must be at least 50 characters" });
    }
    let updatedDate = blog.date;
    if (date) {
      updatedDate = new Date(date);
      if (isNaN(updatedDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      if (updatedDate > new Date()) {
        return res.status(400).json({ error: "Date cannot be in the future" });
      }
    }

    // 3. Delete old image if new image uploaded
    if (image && blog.image) {
      const oldImagePath = path.join(__dirname, "../uploads/", blog.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    // 4. Prepare update data
    const updateData = {
      title: title !== undefined ? title.trim() : blog.title,
      content: content !== undefined ? content.trim() : blog.content,
      date: updatedDate,
      image: image || blog.image
    };

    // 5. Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: "Blog updated successfully", updatedBlog });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ----------------- DELETE BLOG -----------------
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // delete image if exists
    if (blog.image) {
      const imagePath = path.join(__dirname, "../uploads/", blog.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

// ----------------- VIEW SINGLE BLOG -----------------
exports.viewBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find blog by ID
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Return blog data
    res.status(200).json({ message: "Blog fetched successfully", blog });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ----------------- LIST ALL BLOGS -----------------
exports.listBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 }); // latest first
    res.status(200).json(blogs);

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};