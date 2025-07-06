// Initial quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "motivation" },
  { text: "Failure is not the opposite of success; it's part of success.", category: "inspiration" }
];

let filteredQuotes = [...quotes];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const syncNotification = document.getElementById("syncNotification");

// Show a random quote
function showRandomQuote() {
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for the selected category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
}

// Populate category dropdown
function updateCategoryOptions() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
}

// Filter quotes by selected category
function filterQuotesByCategory(category) {
  if (category === "all") {
    filteredQuotes = [...quotes];
  } else {
    filteredQuotes = quotes.filter(q => q.category === category);
  }
  showRandomQuote();
}

// Add new quote
addQuoteBtn.addEventListener("click", () => {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim().toLowerCase();

  if (text && category) {
    quotes.push({ text, category });
    newQuoteText.value = "";
    newQuoteCategory.value = "";

    updateCategoryOptions();
    filterQuotesByCategory(categoryFilter.value);

    showSyncMessage("Quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
});

// Export quotes to JSON file
exportBtn.addEventListener("click", () => {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  showSyncMessage("Quotes exported.");
});

// Import quotes from JSON file
importFile.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        importedQuotes.forEach(q => {
          if (q.text && q.category) {
            quotes.push({ text: q.text, category: q.category.toLowerCase() });
          }
        });
        updateCategoryOptions();
        filterQuotesByCategory(categoryFilter.value);
        showSyncMessage("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error reading file.");
    }
  };
  reader.readAsText(file);
});

// Show new quote
newQuoteBtn.addEventListener("click", showRandomQuote);

// Change filter
categoryFilter.addEventLis
