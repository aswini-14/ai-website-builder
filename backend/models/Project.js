const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String },
    prompt: { type: String },
    code: { type: Object },
    preview: { type: Object },
    pages: { type: Array },
    thumbnail: { type: String },

    // ✅ NEW FIELDS FOR DEPLOYMENT
    deployed: {
      type: Boolean,
      default: false
    },
    deployedAt: {
      type: Date
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);