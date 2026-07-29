export const truncateText = (text: string | null | undefined, maxLength: number = 20) => {
  if (!text) return "—";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};