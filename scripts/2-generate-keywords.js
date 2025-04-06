const fs = require("fs/promises");
const path = require("path");
const { COMMON_WORDS } = require("./constants");

const CHAPTERS_DIR = "./output/chapters";
const OUTPUT_FILE = "./output/keywords.json";

const urlPatterns = [
  /^https?:\/\//i,
  /^www\./i,
  /^[a-zA-Z0-9-]+\.(com|org|net|io|eth|xyz)$/i,
  /^[a-zA-Z0-9-]+\.(js|ts|py|md|json|txt)$/i,
];

const isUrlOrPath = (word) => urlPatterns.some((pattern) => pattern.test(word));

function extractKeywords(content, commonWordsSet) {
  const headers = content.match(/^#+\s+(.+)$/gm) || [];
  const headerWords = new Set(
    headers
      .map((h) =>
        h
          .replace(/^#+\s+/, "")
          .toLowerCase()
          .split(/\s+/)
      )
      .flat()
  );

  const contentWithoutCode = content.replace(/```[\s\S]*?```/g, "");
  const words = contentWithoutCode
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => {
      if (!word) return false;
      if (/^[A-Z]+$/.test(word)) return true;
      if (isUrlOrPath(word)) return false;
      if (commonWordsSet.has(word.toLowerCase())) return false;
      if (/^\d+$/.test(word)) return false;
      return word.length > 2 || headerWords.has(word.toLowerCase());
    });

  const wordFreq = {};
  words.forEach((word) => {
    const key = /^[A-Z]+$/.test(word) ? word : word.toLowerCase();
    wordFreq[key] = (wordFreq[key] || 0) + (headerWords.has(key) ? 2 : 1);
  });

  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

async function generateKeywords() {
  try {
    const commonWordsSet = new Set(COMMON_WORDS.words);
    const files = (await fs.readdir(CHAPTERS_DIR)).filter((file) =>
      file.endsWith(".md")
    );

    const documentKeywords = Object.fromEntries(
      await Promise.all(
        files.map(async (file) => {
          const content = await fs.readFile(
            path.join(CHAPTERS_DIR, file),
            "utf-8"
          );
          return [file, extractKeywords(content, commonWordsSet)];
        })
      )
    );

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(documentKeywords, null, 2));
    console.log(`✅ Generated keywords in ${OUTPUT_FILE}`);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

generateKeywords();
