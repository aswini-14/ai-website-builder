function extractLayout(figmaData) {

  const pages = figmaData.document.children;
  const layout = [];

  function traverse(node) {

    const element = {
      name: node.name,
      type: node.type,
      width: node.absoluteBoundingBox?.width || null,
      height: node.absoluteBoundingBox?.height || null
    };

    if (node.characters) {
      element.text = node.characters;
    }

    if (node.style) {
      element.fontSize = node.style.fontSize;
      element.fontFamily = node.style.fontFamily;
    }

    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];

      if (fill.color) {
        element.color = fill.color;
      }
    }

    layout.push(element);

    if (node.children) {
      node.children.forEach(child => traverse(child));
    }
  }

  pages.forEach(page => {
    if (page.children) {
      page.children.forEach(node => traverse(node));
    }
  });

  return layout;
}

module.exports = { extractLayout };