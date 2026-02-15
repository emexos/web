// Translations object to store loaded languages
const translations = {};
let currentLang = "en_us";

// Load translation file
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

// Apply translation to page
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

// Change language
async function changeLanguage(lang) {
  const data = await loadTranslation(lang);
  if (data) {
    currentLang = lang;
    applyTranslation(data);
    localStorage.setItem("preferredLanguage", lang);

    // Update active button
    document.querySelectorAll(".lang-button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  // Check for saved language preference
  const savedLang = localStorage.getItem("preferredLanguage") || "en_us";

  // Set up language switcher buttons
  document.querySelectorAll(".lang-button").forEach((button) => {
    button.addEventListener("click", () => {
      changeLanguage(button.dataset.lang);
    });
  });

  // Load initial language
  await changeLanguage(savedLang);
});
