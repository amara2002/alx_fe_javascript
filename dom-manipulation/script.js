// Initial quotes array or load from localStorage
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "Philosophy" },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", category: "Motivation" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const categoryFilter = document.getElementById('categoryFilter');
const syncNotification = document.getElementById('syncNotification');

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display a quote (random or filtered)
function showRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = categoryFilter.value;
  if (selectedCategory && selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerText = "No quotes found for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerText = filteredQuotes[randomIndex].text + " — [" + filteredQuotes[randomIndex].category + "]";
  sessionStorage.setItem('lastQuote', JSON.stringify(filteredQuotes[randomIndex]));
}

// Add new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();
  if (!text || !category) {
    alert('Please enter both quote text and category.');
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();
  newQuoteText.value = '';
  newQuoteCategory.value = '';
  alert('Quote added!');
}

// Populate category dropdown dynamically
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter from localStorage
  const lastFilter = localStorage.getItem('lastCategoryFilter');
  if (lastFilter && [...categoryFilter.options].some(o => o.value === lastFilter)) {
    categoryFilter.value = lastFilter;
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  localStorage.setItem('lastCategoryFilter', categoryFilter.value);
  showRandomQuote();
}

// Export quotes as JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        // Optional: Validate each quote object structure here
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format. Expected an array of quotes.');
      }
    } catch (err) {
      alert('Error parsing JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Fetch quotes from server (simulate GET)
function fetchQuotesFromServer() {
  return fetch('https://jsonplaceholder.typicode.com/posts')  // Mock API - replace with your real endpoint
    .then(response => response.json())
    .then(serverData => {
      // Let's say serverData is array of objects with title as quote text and body as category (for simulation)
      // Map it to our quote format (adjust accordingly)
      const serverQuotes = serverData.slice(0, 5).map(item => ({
        text: item.title,
        category: item.body || "Uncategorized"
      }));

      // Conflict resolution: server data overwrites local quotes
      quotes = serverQuotes;
      saveQuotes();
      populateCategories();
      filterQuotes();
      notifyUser('Quotes synced from server.');
    })
    .catch(err => {
      console.error('Error fetching quotes from server:', err);
      notifyUser('Failed to sync from server.');
    });
}

// Send quotes to server (POST)
function sendQuotesToServer() {
  fetch('https://jsonplaceholder.typicode.com/posts', { // Mock API - replace with your real endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(quotes)
  })
    .then(response => response.json())
    .then(data => {
      console.log('Quotes sent to server:', data);
      notifyUser('Quotes synced to server.');
    })
    .catch(err => {
      console.error('Error sending quotes to server:', err);
      notifyUser('Failed to send quotes to server.');
    });
}

// Notification helper
function notifyUser(message) {
  if (!syncNotification) return;
  syncNotification.innerText = message;
  syncNotification.style.display = 'block';
  setTimeout(() => {
    syncNotification.style.display = 'none';
  }, 3000);
}

// Periodic sync: fetch from server every 30 seconds and send local data as well
function periodicSync() {
  fetchQuotesFromServer();
  sendQuotesToServer();
}

// Initialize app
function init() {
  populateCategories();
  filterQuotes();
  // Restore last viewed quote from session storage if any
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    quoteDisplay.innerText = q.text + " — [" + q.category + "]";
  }
  // Start periodic sync every 30 seconds
  setInterval(periodicSync, 30000);
}

// Attach event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
document.getElementById('exportBtn').addEventListener('click', exportQuotes);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);

// Run init on load
window.onload = init;
