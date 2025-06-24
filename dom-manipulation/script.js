// Initialize quotes array
let quotes = [];

// Load quotes from localStorage or set default
function loadQuotes() {
  const saved = localStorage.getItem('quotes');
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    quotes = [
      { text: "Be yourself; everyone else is already taken.", category: "inspiration" },
      { text: "Two things are infinite: the universe and human stupidity.", category: "humor" }
    ];
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show a random quote based on filter
function showRandomQuote() {
  const filter = localStorage.getItem('lastCategory') || 'all';
  const filteredQuotes = filter === 'all' ? quotes : quotes.filter(q => q.category === filter);
  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = "No quotes in this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById('quoteDisplay').innerHTML = `"${filteredQuotes[randomIndex].text}" — <em>${filteredQuotes[randomIndex].category}</em>`;

  // Save last shown quote in sessionStorage
  sessionStorage.setItem('lastQuote', filteredQuotes[randomIndex].text);
}

// Add a new quote from input
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  textInput.value = '';
  categoryInput.value = '';
  notifyUser("Quote added!");
}

// Populate category dropdown dynamically
function populateCategories() {
  const select = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(q => q.category))];
  const currentValue = select.value || 'all';

  // Clear existing options except 'all'
  select.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    select.appendChild(option);
  });

  // Restore selected value
  select.value = currentValue;
}

// Filter quotes based on category selected
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastCategory', selectedCategory);
  showRandomQuote();
}

// Export quotes as JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
  notifyUser("Quotes exported as JSON file.");
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");

      // Merge imported quotes avoiding duplicates (by text + category)
      importedQuotes.forEach(iq => {
        if (!quotes.some(q => q.text === iq.text && q.category === iq.category)) {
          quotes.push(iq);
        }
      });

      saveQuotes();
      populateCategories();
      filterQuotes();
      notifyUser("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import quotes: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Notify user helper
function notifyUser(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  setTimeout(() => {
    notification.textContent = '';
  }, 4000);
}

// --- Simulated Server Sync --- //

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API

async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Map server data to quote format
    return serverData.slice(0, 10).map(item => ({
      text: item.title || "Server quote",
      category: "server",
      id: item.id
    }));
  } catch (error) {
    console.error("Failed to fetch server quotes:", error);
    return [];
  }
}

function mergeQuotes(local, server) {
  const merged = [...local];
  server.forEach(sq => {
    if (!merged.some(lq => lq.text === sq.text && lq.category === sq.category)) {
      merged.push(sq);
    }
  });
  return merged;
}

async function syncWithServer() {
  const serverQuotes = await fetchServerQuotes();

  let localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

  const combinedQuotes = mergeQuotes(localQuotes, serverQuotes);

  localStorage.setItem('quotes', JSON.stringify(combinedQuotes));
  quotes = combinedQuotes;
  populateCategories();
  filterQuotes();

  notifyUser("Quotes synced with server.");
}

// Set up event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Initialize app on page load
window.onload = () => {
  loadQuotes();
  populateCategories();

  // Restore last filter or default to all
  const lastFilter = localStorage.getItem('lastCategory') || 'all';
  document.getElementById('categoryFilter').value = lastFilter;

  filterQuotes();

  // Sync every 60 seconds
  setInterval(syncWithServer, 60000);
};
