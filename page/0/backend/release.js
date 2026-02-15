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
  /// relative image
  const fixedMd = md.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
    (_, alt, path) => {
      const clean = path.replace(/^\.?\//, "");
      return `![${alt}](https://raw.githubusercontent.com/${REPO}/${branch}/${clean})`;
    },
  );

  const html = marked.parse(fixedMd);
  const safe = DOMPurify.sanitize(html);

  contentEl.innerHTML = safe;

  /// opens in a new tab
  contentEl.querySelectorAll("a").forEach((a) => {
    a.target = "_blank";
    a.rel = "noopener";
  });
}
