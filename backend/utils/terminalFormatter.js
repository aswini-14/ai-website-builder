function formatAsTerminal(text) {
  if (!text) return "";

  const cleaned = text
    .replace(/```bash/g, "")
    .replace(/```/g, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();

  const lines = cleaned.split("\n");

  return lines
    .map(line => {
      const trimmed = line.trim();

      if (!trimmed) return "<div style='height:6px'></div>";

      if (trimmed.startsWith("#")) {
        return `<div style="color:#9ca3af;">${trimmed}</div>`;
      }

      if (trimmed.startsWith("cd ")) {
        return `<div><span style="color:#60a5fa;">$ ${trimmed}</span></div>`;
      }

      if (trimmed.includes("docker")) {
        return `<div><span style="color:#a78bfa;">$ ${trimmed}</span></div>`;
      }

      if (
        trimmed.startsWith("npm") ||
        trimmed.startsWith("yarn") ||
        trimmed.startsWith("pip") ||
        trimmed.startsWith("python")
      ) {
        return `<div><span style="color:#22c55e;"> ${trimmed}</span></div>`;
      }

      return `<div><span style="color:#22c55e;">${trimmed}</span></div>`;
    })
    .join("");
}

module.exports = formatAsTerminal;