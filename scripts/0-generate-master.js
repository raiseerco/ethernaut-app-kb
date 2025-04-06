const { glob } = require("glob");
const fs = require("fs/promises");
const path = require("path");
const matter = require("gray-matter");
const OUTPUT_FILENAME = "./output/master.md";
const MDX_PATH = "repos/optimism/community-hub/pages/**/*.{md,mdx}";

// Pages to exclude from the index
const excludedPages = [
  "400.mdx",
  "500.mdx",
  "index.mdx",
  "404.mdx",
  "_app.tsx",
  "_document.tsx",
  "_meta.json",
];

function toTitleCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const { data: frontMatter, content: markdownContent } = matter(content);
    const relativePath = path.relative(process.cwd(), filePath);
    const depth = relativePath.split(path.sep).length - 1;
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileTitle = frontMatter.title || toTitleCase(fileName);

    // Create heading based on depth
    const heading = "#".repeat(Math.min(depth + 1, 6));

    return {
      title: fileTitle,
      content: markdownContent.trim(),
      heading: `${heading} ${fileTitle}`,
      path: relativePath,
      frontMatter,
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return null;
  }
}

async function generateIndex() {
  try {
    // Locate all MDX/MD files
    const files = await glob(MDX_PATH);

    // Filter out excluded files
    const validFiles = files.filter(
      (file) =>
        !excludedPages.includes(path.basename(file)) &&
        !path.basename(file).startsWith("_")
    );

    // Sort files by path to maintain hierarchy
    validFiles.sort();

    let output = "# Master index\n\n";
    output += "> This is the master index of the Optimism Docs\n\n";
    output += "## Table of contents\n\n";

    const processedFiles = await Promise.all(
      validFiles.map((file) => processFile(file))
    );

    // Generate TOC with proper formatting
    processedFiles.forEach((file) => {
      if (file) {
        const pathParts = file.path.split("/");
        // Ajustamos el calculo de profundidad para que empiece desde 0
        const depth = Math.max(0, pathParts.length - 4); // Restamos 4 para que el primer nivel no tenga indentacionnn
        const indent = depth > 0 ? "  ".repeat(depth) : "";
        const slug = file.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "") // Remove special characters
          .replace(/\s+/g, "-"); // Replace spaces with hyphens
        output += `${indent}- [${file.title}](#${slug})\n`;
      }
    });

    output += "\n---\n\n";
    processedFiles.forEach((file) => {
      if (file) {
        const slug = file.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

        output += `\n<a id="${slug}"></a>\n\n`;
        output += `${file.heading}\n\n`;

        // Add file path
        output += `*source: \`${file.path}\`*\n\n`;
        output += `${file.content}\n\n`;
        output += "---\n\n";
      }
    });

    // Write master file
    const outputPath = path.join(process.cwd(), OUTPUT_FILENAME);
    await fs.writeFile(outputPath, output);
    console.log(`✅ generated index: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error :", error);
    process.exit(1);
  }
}

generateIndex();
