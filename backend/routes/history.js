const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

/* =========================================
   GET ALL PROJECTS (User Specific History)
========================================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .select("_id title prompt createdAt updatedAt");

    res.json(projects);
  } catch (err) {
    console.error("HISTORY FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================================
   GET SINGLE PROJECT
========================================= */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error("PROJECT FETCH ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================================
   UPDATE PROJECT (For Refinement Auto Save)
========================================= */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { code, preview } = req.body;

    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      {
        code,
        preview,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updatedProject);
  } catch (err) {
    console.error("PROJECT UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================================
   DELETE PROJECT
========================================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedProject = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("PROJECT DELETE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;