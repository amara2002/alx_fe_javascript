// ===== Existing quotes array and initialization =====
let quotes = [];

// Load quotes from localStorage or use default
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    // Default quotes example
    quotes = [
      { text: "Life is what happens when you're busy making other plans.", category: "life" },
      { text: "The only way to do great work is to love what you do.", category: "work" },
      { text: "To be or not to be, that is the question.", category: "philosophy" },
    ];
  }
}
loadQuotes();

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ===== Display a random quote (filtered by category if set) =====
function showRandomQuote() {
  const filter = localStorage.getItem('selectedCategory') || 'all';
  let filteredQuotes = filter === 'all' ? quotes : quotes.filter(q => q.category === filter);

  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').textContent = 'No quotes available in this category.';
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById('quoteDisplay').textContent = filteredQuotes[randomIndex].text;

  // Save last shown quote text to sessionStorage
  sessionStorage.setItem('lastQuote', filteredQuotes[randomIndex].text);
}

// ===== Add new quote from form =====
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert('Please enter both quote text and category.');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  textInput.value = '';
  categoryInput.value = '';
}

// ===== Populate categories dynamically in dropdown =====
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;

  // Get unique categories
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  // Clear existing options except 'all'
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  // Restore last selected category if any
  const lastCategory = localStorage.getItem('selectedCategory') || 'all';
  categoryFilter.value = lastCategory;
}

// ===== Filter quotes based on selected category =====
function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;

  const selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);
  showRandomQuote();
}

// ===== Export quotes as JSON file =====
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ===== Import quotes from JSON file =====
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error('Invalid format: expected an array');

      // Merge without duplicates based on text & category
      importedQuotes.forEach(newQuote => {
        if (!quotes.some(q => q.text === newQuote.text && q.category === newQuote.category)) {
          quotes.push(newQuote);
        }
      });
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert('Quotes imported successfully!');
    } catch(err) {
      alert('Failed to import quotes: ' + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ===== Show notification (for sync messages) =====
function showNotification(message) {
  let notif = document.getElementById('notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notification';
    notif.style.position = 'fixed';
    notif.style.top = '10px';
    notif.style.right = '10px';
    notif.style.backgroundColor = '#4caf50';
    notif.style.color = 'white';
    notif.style.padding = '10px';
    notif.style.borderRadius = '5px';
    notif.style.zIndex = '1000';
    document.body.appendChild(notif);
  }
  notif.textContent = message;
  notif.style.display = 'block';

  setTimeout(() => {
    notif.style.display = 'none';
  }, 4000);
}

// ===== Simulated server URL and syncing =====
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Fetch quotes from the server (simulated)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error('Network response was not ok');

    const serverData = await response.json();

    // Map server data to quote objects (take first 10 for demo)
    const serverQuotes = serverData.slice(0, 10).map(post => ({
      text: post.title,
      category: 'server'
    }));

    // Conflict resolution: server data overrides local quotes
    quotes = serverQuotes;
    saveQuotes();

    populateCategories();
    filterQuotes();

    showNotification('Quotes synced with server successfully!');
  } catch (error) {
    console.error('Failed to fetch from server:', error);
    showNotification('Error syncing with server. Check console.');
  }
}

// Periodic syncing every 30 seconds
setInterval(fetchQuotesFromServer, 30000);

// Initial load calls
loadQuotes();
populateCategories();
filterQuotes();
showRandomQuote();
fetchQuotesFromServer();

