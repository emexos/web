const contentEl = document.getElementById("releaseContent");
const titleEl = document.getElementById("docsTitle");
const backBtn = document.querySelector(".ibackButton");

const docHistory = [];

loadDoc("docs/index.md");

backBtn.addEventListener("click", (e) => {
  if (docHistory.length > 1) {
    e.preventDefault();
    docHistory.pop(); // remove current
    loadDoc(docHistory.pop()); // go back, gets pushed again in loadDoc
  }
  // default href="index.html" takes over
});

function loadDoc(path) {
  fetch(path)
    .then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    })
    .then((md) => {
      titleEl.style.display = "none";
      docHistory.push(path);
      renderDoc(md, path);
    })
    .catch((err) => {
      console.error(err);
      contentEl.innerText = "Could not load " + path;
    });
}

function renderDoc(md, currentPath) {
  contentEl.innerHTML = DOMPurify.sanitize(marked.parse(md));

  const dir = currentPath.substring(0, currentPath.lastIndexOf("/") + 1);

  contentEl.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && href.endsWith(".md") && !href.startsWith("http")) {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        loadDoc(dir + href);
      });
    } else {
      a.target = "_blank";
      a.rel = "noopener";
    }
  });

  contentEl.querySelectorAll("pre").forEach((pre) => {
    const btn = document.createElement("button");
    btn.className = "code-copy-button";
    btn.innerHTML = `<img class="theme-icon-dynamic" data-icon="copy" src="../gen/icons/${getTheme()}/copy.svg" alt="Copy" />`;
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(
        (pre.querySelector("code") || pre).textContent,
      );
      btn.classList.add("copied");
      setTimeout(() => btn.classList.remove("copied"), 1000);
    });
    pre.style.position = "relative";
    pre.appendChild(btn);
  });
}

function getTheme() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

document.addEventListener("themeChanged", () => {
  contentEl
    .querySelectorAll(".code-copy-button .theme-icon-dynamic")
    .forEach((icon) => {
      icon.src = `../gen/icons/${getTheme()}/copy.svg`;
    });
});
