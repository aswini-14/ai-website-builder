const express = require("express");
const router = express.Router();
const axios = require("axios");
const { extractLayout } = require("../utils/figmaParser");

router.post("/", async (req, res) => {

  const { figmaUrl } = req.body;

  try {

    let fileKey;

    if (figmaUrl.includes("/file/")) {
      fileKey = figmaUrl.split("/file/")[1].split("/")[0];
    } else if (figmaUrl.includes("/design/")) {
      fileKey = figmaUrl.split("/design/")[1].split("/")[0];
    } else {
      throw new Error("Invalid Figma URL");
    }

    const response = await axios.get(
      `https://api.figma.com/v1/files/${fileKey}`,
      {
        headers: {
          "X-Figma-Token": process.env.FIGMA_API_KEY
        }
      }
    );

    const figmaData = response.data;

    const layout = extractLayout(figmaData);

    res.json({
      layout
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Failed to fetch Figma design" });

  }

});

module.exports = router;