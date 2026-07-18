const azCharMap: Record<string, string> = {
  ə: "e",
  ı: "i",
  ö: "o",
  ü: "u",
  ş: "s",
  ç: "c",
  ğ: "g",
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .split("")
    .map((char) => azCharMap[char] ?? char)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
