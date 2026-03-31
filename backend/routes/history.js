const express = require("express");
const archiver = require("archiver");
const router = express.Router();
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

/* =========================================
   GET ALL PROJECTS (User Specific History)
========================================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };

    if (search) {
      query.prompt = { $regex: search, $options: "i" };
    }

    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      // 🔥 ADD preview HERE
      .select("_id title prompt preview code createdAt updatedAt");

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });

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

router.get("/:id/download", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const archive = archiver("zip", {
      zlib: { level: 9 }
    });

    res.attachment(`${project.title || "project"}.zip`);
    archive.pipe(res);

    const files = project.code.files;

    for (const filename in files) {
      archive.append(files[filename], { name: filename });
    }

    await archive.finalize();

  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================================
   UPDATE PROJECT (For Refinement Auto Save)
========================================= */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { code, preview, thumbnail } = req.body;

    const updatedProject = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      {
        code,
        preview,
        thumbnail,
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

//Undo Project
router.post("/:id/undo", authMiddleware, async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!project || project.currentIndex <= 0) {
    return res.status(400).json({ error: "Cannot undo" });
  }

  project.currentIndex -= 1;

  const state = project.history[project.currentIndex];

  project.code = state.code;
  project.preview = state.preview;

  await project.save();

  res.json(project);
});

// Redo Project
router.post("/:id/redo", authMiddleware, async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (
    !project ||
    project.currentIndex >= project.history.length - 1
  ) {
    return res.status(400).json({ error: "Cannot redo" });
  }

  project.currentIndex += 1;

  const state = project.history[project.currentIndex];

  project.code = state.code;
  project.preview = state.preview;

  await project.save();

  res.json(project);
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