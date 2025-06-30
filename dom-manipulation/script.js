// Load quotes from localStorage or fallback default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: 'The journey of a thousand miles begins with one step.', category: 'Inspiration' },
  { text: 'Life is what happens when you’re busy making other plans.', category: 'Life' },
  { text: 'To be, or not to be, that is the question.', category: 'Philosophy' },
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const categoryFilter = document.getElementById('categoryFilter');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');
const syncNotification = document.getElementById('syncNotification');

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function notifyUser(message) {
  syncNotification.textContent = message;
  syncNotification.style.display = 'block';
  setTimeout(() => {
    syncNotification.style.display = 'none';
  }, 3000);
}

function getFilteredQuotes() {
  const selectedCategory = categoryFilter.value;
  if (selectedCategory === 'all') {
    return quotes;
  }
  return quotes.filter(q => q.category === selectedCategory);
}

function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = 'No quotes available for selected category.';
    sessionStorage.removeItem('lastQuote');
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function populateCategories() {
  // Extract unique categories from quotes
  const categories = [...new Set(quotes.map(q => q.category))];
  
  // Clear existing options except 'all'
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const savedCategory = localStorage.getItem('selectedCategory') || 'all';
  categoryFilter.value = savedCategory;
}

function filterQuotes() {
  localStorage.setItem('selectedCategory', categoryFilter.value);
  showRandomQuote();
}

async function postQuoteToServer(quote) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    });
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (err) {
    console.error('Post error:', err);
    notifyUser('Failed to sync quote to server.');
    return null;
  }
}

async function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const newQuoteText = textInput.value.trim();
  const newQuoteCategory = categoryInput.value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert('Please enter both quote text and category.');
    return;
  }

  const newQuote = { text: newQuoteText, category: newQuoteCategory };

  // Add locally
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  // Clear inputs
  textInput.value = '';
  categoryInput.value = '';

  // Post to server
  const res = await postQuoteToServer(newQuote);
  if (res) notifyUser('Quote added and synced with server!');
}

async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const data = await response.json();

  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: 'Server',
  }));
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let addedCount = 0;

    serverQuotes.forEach(sq => {
      if (!quotes.some(q => q.text === sq.text && q.category === sq.category)) {
        quotes.push(sq);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      notifyUser(`Synced ${addedCount} quotes from server.`);
    }
  } catch (err) {
    console.error('Sync error:', err);
    notifyUser('Failed to sync with server.');
  }
}

function downloadQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
  notifyUser('Quotes exported as JSON file!');
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert('Invalid JSON format. Expected an array.');
        return;
      }

      const validQuotes = importedQuotes.filter(q => q.text && q.category);
      if (validQuotes.length === 0) {
        alert('No valid quotes found.');
        return;
      }

      let addedCount = 0;
      validQuotes.forEach(iq => {
        if (!quotes.some(q => q.text === iq.text && q.category === iq.category)) {
          quotes.push(iq);
          addedCount++;
        }
      });

      if (addedCount > 0) {
        saveQuotes();
        populateCategories();
        filterQuotes();
        notifyUser(`Imported ${addedCount} new quotes.`);
      } else {
        notifyUser('No new quotes to import.');
      }
    } catch (err) {
      alert('Failed to parse JSON: ' + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);

  // Reset file input so same file can be uploaded again if needed
  event.target.value = '';
}

function restoreLastQuote() {
  const lastQuoteJSON = sessionStorage.getItem('lastQuote');
  if (lastQuoteJSON) {
    const lastQuote = JSON.parse(lastQuoteJSON);
    quoteDisplay.textContent = `"${lastQuote.text}" — ${lastQuote.category}`;
  }
}

// Initialize
populateCategories();
categoryFilter.value = localStorage.getItem('selectedCategory') || 'all';
restoreLastQuote() || showRandomQuote();

newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
categoryFilter.addEventListener('change', filterQuotes);
exportBtn.addEventListener('click', downloadQuotes);
importFileInput.addEventListener('change', importFromJsonFile);

// Auto sync every 30 seconds
setInterval(syncQuotes, 30000);
