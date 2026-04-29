export const parseSmartInput = (text) => {
  // Basic patterns: starts with amount, e.g., "200 pizza" or "200"
  if (!text) return {};
  const trimmed = text.trim();
  const match = trimmed.match(/^\s*(\d+(?:\.\d{1,2})?)\s*(.*)$/);
  if (match) {
    const amount = parseFloat(match[1]);
    const remainder = match[2] ? match[2].trim() : '';
    return {amount, remainder};
  }
  return {remainder: trimmed};
};
