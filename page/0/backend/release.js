const params = new URLSearchParams(window.location.search);
const tag = params.get("tag");
const titleEl = document.getElementById("releaseTitle");
const metaEl = document.getElementById("releaseMeta");
const contentEl = document.getElementById("releaseContent");

const REPO = "emexos/emexOS1";
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases`;

if (!tag) {
  titleEl.innerText = "No release selected";
} else {
  fetch(RELEASES_API)
    .then((r) => r.json())
    .then((releases) => {
      const release = releases.find((r) => r.tag_name === tag);

      if (!release) {
        titleEl.innerText = "Release not found";
        return;
      }

      titleEl.innerText = release.tag_name;
      metaEl.innerText = release.name || "";

      // if exist then use
      if (release.body && release.body.trim().length > 0) {
        renderMarkdown(release.body, release.target_commitish);
      }
      /// kiad readme
      else {
        loadReadme(release.target_commitish);
      }
    })
    .catch((err) => {
      console.error(err);
      titleEl.innerText = "Error loading release";
    });
}

function loadReadme(branch) {
  const readmeUrl = `https://raw.githubusercontent.com/${REPO}/${branch}/README.md`;

  fetch(readmeUrl)
    .then((r) => {
      if (!r.ok) throw new Error("nothing found :( ");
      return r.text();
    })
    .then((md) => renderMarkdown(md, branch))
    .catch((err) => {
      console.error(err);
      contentEl.innerText = "couldnt find a README";
    });
}

function renderMarkdown(md, branch) {
  console.log("Original markdown:", md.substring(0, 500)); // Debug log

  /// Fix relative image paths - improved regex to handle more cases
  let fixedMd = md;

  // Handle images with paths starting with ./ or just filename
  fixedMd = fixedMd.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
    (match, alt, path) => {
      console.log("Found image:", path); // Debug log

      // Remove leading ./ or /
      const clean = path.replace(/^\.?\//, "").trim();
      const fullUrl = `https://raw.githubusercontent.com/${REPO}/${branch}/${clean}`;

      console.log("Converted to:", fullUrl); // Debug log

      return `![${alt}](${fullUrl})`;
    },
  );

  // Also handle HTML img tags if present
  fixedMd = fixedMd.replace(
    /<img\s+([^>]*?)src=["'](?!https?:\/\/)([^"']+)["']([^>]*?)>/gi,
    (match, before, path, after) => {
      const clean = path.replace(/^\.?\//, "").trim();
      const fullUrl = `https://raw.githubusercontent.com/${REPO}/${branch}/${clean}`;
      return `<img ${before}src="${fullUrl}"${after}>`;
    },
  );

  console.log("Fixed markdown:", fixedMd.substring(0, 500)); // Debug log

  const html = marked.parse(fixedMd);
  const safe = DOMPurify.sanitize(html);

  contentEl.innerHTML = safe;

  /// opens in a new tab
  contentEl.querySelectorAll("a").forEach((a) => {
    a.target = "_blank";
    a.rel = "noopener";
  });

  // add error handling for images
  contentEl.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", function () {
      console.error("Failed to load image:", this.src);
      this.alt = `[Image failed to load: ${this.alt || "Screenshot"}]`;
      this.style.border = "2px dashed #ccc";
      this.style.padding = "20px";
      this.style.background = "#f5f5f5";
    });

    img.addEventListener("load", function () {
      console.log("Successfully loaded image:", this.src);
    });
  });
}
