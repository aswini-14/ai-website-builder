const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project");

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Ignore non-objectId requests (like style.css, script.js)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send("Not found");
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).send("Site not found.");
    }

    if (!project.deployed) {
      return res.status(403).send("This site is not deployed yet.");
    }

    res.send(project.preview);

  } catch (err) {
    console.error("SITE LOAD ERROR:", err);
    res.status(500).send("Error loading site.");
  }
});

module.exports = router;