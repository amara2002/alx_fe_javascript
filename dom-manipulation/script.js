// Quotes array (load from localStorage or default)
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
  { text: "The only way to do great work is to love what you do.", category: "Work" },
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display a random quote, considering filter
function showRandomQuote() {
  const categoryFilter = document.getElementById('categoryFilter').value;
  let filteredQuotes = categoryFilter === 'all' ? quotes : quotes.filter(q => q.category === categoryFilter);

  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  document.getElementById('quoteDisplay').innerHTML = `"${quote.text}" - <em>${quote.category}</em>`;

  // Save last shown quote in sessionStorage
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Populate categories dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category)));

  // Clear existing except 'all'
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter from localStorage
  const lastCategory = localStorage.getItem('lastCategory') || 'all';
  categoryFilter.value = lastCategory;
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastCategory', selectedCategory);
  showRandomQuote();
}

// Add a new quote from user input
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

  // Clear inputs
  textInput.value = '';
  categoryInput.value = '';
}

// Export quotes to JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
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
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert('Invalid JSON format: Expected an array of quotes.');
        return;
      }
      // Append imported quotes
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert('Quotes imported successfully!');
    } catch (err) {
      alert('Error parsing JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// -----------------
// Async server sync
// -----------------

const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API for demo

// Fetch quotes from server (simulate)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const serverData = await response.json();

    // Simulate server quotes structure and merge logic
    // Here assuming serverData is an array of posts with title and body
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: 'Server',
    }));

    // Conflict resolution: server data takes precedence, so merge but remove duplicates
    serverQuotes.forEach(sq => {
      if (!quotes.some(q => q.text === sq.text && q.category === sq.category)) {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();

    notifyUser('Quotes updated from server.');

  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Post new quote to server (simulate)
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    });

    if (!response.ok) throw new Error('Failed to post quote');

    const data = await response.json();
    console.log('Posted to server:', data);

  } catch (error) {
    console.error('Post error:', error);
  }
}

// Notify user about sync or conflicts
function notifyUser(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Periodically sync data with server every 60 seconds
setInterval(fetchQuotesFromServer, 60000);

// Initial setup
window.onload = function() {
  populateCategories();
  filterQuotes();

  // Show last quote from sessionStorage if available
  const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
  if (lastQuote) {
    document.getElementById('quoteDisplay').innerHTML = `"${lastQuote.text}" - <em>${lastQuote.category}</em>`;
  }
};
