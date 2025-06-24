// Initial quotes array
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: 'The journey of a thousand miles begins with one step.', category: 'Inspiration' },
  { text: 'Life is what happens when you’re busy making other plans.', category: 'Life' },
  { text: 'To be, or not to be, that is the question.', category: 'Philosophy' },
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const notificationDiv = document.getElementById('notification');

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = 'No quotes available for selected category.';
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function getFilteredQuotes() {
  const selectedCategory = categoryFilter.value;
  if (selectedCategory === 'all') {
    return quotes;
  }
  return quotes.filter(q => q.category === selectedCategory);
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  // Clear previous options except 'all'
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category from localStorage
  const savedCategory = localStorage.getItem('selectedCategory') || 'all';
  categoryFilter.value = savedCategory;
}

function filterQuotes() {
  localStorage.setItem('selectedCategory', categoryFilter.value);
  showRandomQuote();
}

function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value.trim();
  const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
  if (!newQuoteText || !newQuoteCategory) {
    alert('Please enter both quote text and category.');
    return;
  }
  quotes.push({ text: newQuoteText, category: newQuoteCategory });
  saveQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

// Notification helper
function notifyUser(message) {
  notificationDiv.textContent = message;
  notificationDiv.style.display = 'block';
  setTimeout(() => {
    notificationDiv.style.display = 'none';
  }, 3000);
}

// Simulate fetching from a mock server
async function fetchQuotesFromServer() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const data = await response.json();

  // Convert server data to quotes format - simulate
  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: 'Server',
  }));
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    // Server data takes precedence - merge and remove duplicates
    serverQuotes.forEach(sq => {
      if (!quotes.some(q => q.text === sq.text && q.category === sq.category)) {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();

    notifyUser('Quotes synced with server!');
  } catch (error) {
    console.error('Sync error:', error);
    notifyUser('Failed to sync with server.');
  }
}

// Initial population
populateCategories();
filterQuotes();

newQuoteBtn.addEventListener('click', showRandomQuote);

document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
categoryFilter.addEventListener('change', filterQuotes);

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);
