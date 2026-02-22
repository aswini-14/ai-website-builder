const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String },
    prompt: { type: String },
    code: { type: Object },
    preview: { type: Object },
    pages: { type: Array }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);