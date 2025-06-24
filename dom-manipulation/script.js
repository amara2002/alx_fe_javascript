// Quotes array, will be loaded from localStorage if available
let quotes = [];

// Load quotes from localStorage on page load
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    try {
      quotes = JSON.parse(storedQuotes);
    } catch {
      quotes = [];
      console.warn("Could not parse stored quotes");
    }
  } else {
    // Default quotes if none in localStorage
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "Imagination is more important than knowledge.", category: "Inspiration" },
      { text: "Simplicity is the ultimate sophistication.", category: "Philosophy" },
    ];
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote, store last viewed in sessionStorage
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes available.</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  document.getElementById("quoteDisplay").innerHTML = `
    <p><strong>${quote.category}</strong>: "${quote.text}"</p>
  `;

  // Store last viewed quote index in sessionStorage
  sessionStorage.setItem("lastQuoteIndex", randomIndex);
}

// On page load, show last viewed quote from sessionStorage if available
function showLastViewedQuote() {
  const lastIndex = sessionStorage.getItem("lastQuoteIndex");
  if (lastIndex !== null && quotes[lastIndex]) {
    const quote = quotes[lastIndex];
    document.getElementById("quoteDisplay").innerHTML = `
      <p><strong>${quote.category}</strong>: "${quote.text}"</p>
    `;
  } else {
    showRandomQuote();
  }
}

// Add new quote, save to localStorage
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes();  // Save to localStorage
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please fill in both fields.");
  }
}

// Dynamically create form for adding quotes
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// Export quotes as JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2); // Pretty print JSON
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);

      // Validate imported data - must be array of objects with text and category
      if (Array.isArray(importedQuotes) && importedQuotes.every(q => q.text && q.category)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
      } else {
        alert("Invalid JSON format.");
      }
    } catch (error) {
      alert("Failed to parse JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Create Import input element dynamically
function createImportInput() {
  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.id = "importFile";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);

  document.body.appendChild(importInput);
}

// Create Export button dynamically
function createExportButton() {
  const exportButton = document.createElement("button");
  exportButton.textContent = "Export Quotes";
  exportButton.addEventListener("click", exportQuotes);

  document.body.appendChild(exportButton);
}

// Initial setup
function init() {
  loadQuotes();

  // Show last viewed quote or random one on page load
  showLastViewedQuote();

  // Setup event for "Show New Quote" button
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  createAddQuoteForm();
  createImportInput();
  createExportButton();
}

init();
