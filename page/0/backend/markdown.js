function getTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

function renderMarkdown(md, branch, repo, basePath, targetEl) {
  const rawBase = `https://raw.githubusercontent.com/${repo}/${branch}/${basePath}/`;

  let fixed = md
    .replace(
      /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
      (_, alt, path) => `![${alt}](${rawBase}${path.replace(/^\.?\//, "")})`,
    )
    .replace(
      /<img\s+([^>]*?)src=["'](https:\/\/github\.com\/[^\/]+\/[^\/]+\/blob\/[^\/]+\/)([^"']+)["']([^>]*?)>/gi,
      (_, before, blobUrl, path, after) =>
        `<img ${before}src="${blobUrl.replace("https://github.com/", "https://raw.githubusercontent.com/").replace("/blob/", "/")}${path}"${after}>`,
    );

  targetEl.innerHTML = DOMPurify.sanitize(marked.parse(fixed));

  targetEl.querySelectorAll("a").forEach((a) => {
    a.target = "_blank";
    a.rel = "noopener";
  });

  targetEl.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", function () {
      this.alt = `[Image failed to load: ${this.alt || "Screenshot"}]`;
      this.style.cssText =
        "border:2px dashed #ccc;padding:20px;background:#f5f5f5";
    });
  });

  targetEl.querySelectorAll("pre").forEach((pre) => {
    const btn = document.createElement("button");
    btn.className = "code-copy-button";
    btn.innerHTML = `<img class="theme-icon-dynamic" data-icon="copy" src="../gen/icons/${getTheme()}/copy.svg" alt="Copy" />`;

    btn.addEventListener("click", async () => {
      const text = (pre.querySelector("code") || pre).textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add("copied");
        setTimeout(() => btn.classList.remove("copied"), 1000);
      } catch (err) {
        console.error("copy failed:", err);
      }
    });

    pre.style.position = "relative";
    pre.appendChild(btn);
  });
}

document.addEventListener("themeChanged", () => {
  document
    .querySelectorAll(".code-copy-button .theme-icon-dynamic")
    .forEach((icon) => {
      icon.src = `../gen/icons/${getTheme()}/copy.svg`;
    });
});
