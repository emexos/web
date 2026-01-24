const translations = {};
let currentLang = "en_us"; // could be set to any lang

// load translatio nfile
async function loadTranslation(lang) {
  if (translations[lang]) {
    return translations[lang];
  }

  try {
    const response = await fetch(`data/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${lang}`);
    }
    translations[lang] = await response.json();
    return translations[lang];
  } catch (error) {
    console.error("Error loading translation:", error);
    return null;
  }
}

// translation layer
function applyTranslation(data) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const keys = key.split(".");
    let value = data;

    for (const k of keys) {
      value = value[k];
      if (!value) break;
    }

    if (value) {
      element.textContent = value;
    }
  });
}

// en <> de
async function changeLanguage(lang) {
  const data = await loadTranslation(lang);
  if (data) {
    currentLang = lang;
    applyTranslation(data);
    localStorage.setItem("preferredLanguage", lang);
    //update
    document.querySelectorAll(".lang-button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }
}

// start/init
document.addEventListener("DOMContentLoaded", async () => {
  const savedLang = localStorage.getItem("preferredLanguage") || "en_us";


  document.querySelectorAll(".lang-button").forEach((button) => {
    button.addEventListener("click", () => {
      changeLanguage(button.dataset.lang);
    });
  });



  
  await changeLanguage(savedLang);
});
