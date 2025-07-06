let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Productivity" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" }
];

function getRandomQuote(category = "all") {
  const filteredQuotes = category === "all"
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === category.toLowerCase());
  return filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
}

function updateQuoteDisplay() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const quote = getRandomQuote(selectedCategory);
  const display = document.getElementById("quoteDisplay");
  display.textContent = quote ? quote.text : "No quotes available for this category.";
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const filter = document.getElementById("categoryFilter");
  filter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });
}

function addNewQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (text && category) {
    quotes.push({ text, category });
    populateCategories();
    showSyncMessage("Quote added and synced.");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  }
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importQuotes(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = [...quotes, ...importedQuotes];
        populateCategories();
        showSyncMessage("Quotes imported and synced.");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error reading JSON file.");
    }
  };
  reader.readAsText(file);
}

function showSyncMessage(message) {
  const notification = document.getElementById("syncNotification");
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

function createAddQuoteForm() {
  const container = document.getElementById("addQuoteFormContainer");

  const heading = document.createElement("h2");
  heading.textContent = "Add a New Quote";

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const button = document.createElement("button");
  button.id = "addQuoteBtn";
  button.textContent = "Add Quote";

  container.appendChild(heading);
  container.appendChild(inputText);
  container.appendChild(inputCategory);
  container.appendChild(button);
}

document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();
  populateCategories();
  updateQuoteDisplay();

  document.getElementById("newQuote").addEventListener("click", updateQuoteDisplay);
  document.getElementById("categoryFilter").addEventListener("change", updateQuoteDisplay);
  document.getElementById("exportBtn").addEventListener("click", exportQuotes);
  document.getElementById("importFile").addEventListener("change", importQuotes);

  // Add event listener after form is created
  document.getElementById("addQuoteBtn").addEventListener("click", addNewQuote);
});
