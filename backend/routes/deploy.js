const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

// Deploy a project
router.post("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    project.deployed = true;
    project.deployedAt = new Date();

    await project.save();

    res.json({
      message: "Project deployed successfully",
      url: `http://localhost:5000/site/${project._id}`
    });

  } catch (err) {
    console.error("DEPLOY ERROR:", err);
    res.status(500).json({ error: "Deployment failed" });
  }
});

module.exports = router;