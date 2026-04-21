const fs = require("fs");
const path = require("path");

const mediaDir = path.join(__dirname, "../../media");
const publicDir = path.join(__dirname, "../public");
const publicMediaDir = path.join(publicDir, "media");
const outputFile = path.join(publicDir, "images.json");

const categoryMap = {
  "ringen 1": "ringen-1",
  "ringen 2": "ringen-2",
  armbanden: "armbanden",
  halssieraden: "halssieraden",
  oorbellen: "oorbellen",
  "in opdracht": "in-opdracht",
  schilderwerk: "schilderwerk",
};

function scanMediaFolder() {
  const items = [];
  let globalOrder = 0;

  try {
    const categories = fs.readdirSync(mediaDir);

    for (const categoryFolder of categories) {
      const categoryPath = path.join(mediaDir, categoryFolder);
      const stat = fs.statSync(categoryPath);

      if (!stat.isDirectory()) continue;

      const categoryId = categoryMap[categoryFolder] || categoryFolder.toLowerCase().replace(/\s+/g, "-");

      try {
        const files = fs.readdirSync(categoryPath);
        const imageFiles = files.filter((f) =>
          /\.(jpg|jpeg|png|gif|jfif|webp)$/i.test(f)
        );

        for (const file of imageFiles) {
          items.push({
            id: `${categoryId}-${file.replace(/\.[^/.]+$/, "")}`,
            src: `/media/${encodeURIComponent(categoryFolder)}/${encodeURIComponent(file)}`,
            title: "",
            description: "",
            category: categoryId,
            folder: categoryFolder,
            filename: file,
            order: globalOrder++,
          });
        }
      } catch (err) {
        console.error(`Error reading category ${categoryFolder}:`, err);
      }
    }
  } catch (err) {
    console.error("Error scanning media folder:", err);
  }

  return items;
}

const items = scanMediaFolder();

// Copy media folder to public directory
function copyFolderSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy media files
if (fs.existsSync(mediaDir)) {
  copyFolderSync(mediaDir, publicMediaDir);
  console.log(`Copied media folder to public/media`);
}

fs.writeFileSync(outputFile, JSON.stringify(items, null, 2));
console.log(`Generated ${items.length} image entries in images.json`);
