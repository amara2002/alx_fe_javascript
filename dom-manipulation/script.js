// Default quotes if no data in localStorage
let quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
];

// Load quotes from localStorage if available
function loadQuotes() {
  const savedQuotes = localStorage.getItem('quotes');
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  }
}

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate categories dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  // Remove all except first option ("All Categories")
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter if valid
  const lastFilter = localStorage.getItem('lastCategoryFilter');
  if (lastFilter && uniqueCategories.includes(lastFilter)) {
    categoryFilter.value = lastFilter;
  } else {
    categoryFilter.value = 'all';
  }
}

// Show a random quote from given array
function displayQuote(quoteArray) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  if (quoteArray.length === 0) {
    quoteDisplay.textContent = 'No quotes found for this category.';
    return;
  }
  const randomIndex = Math.floor(Math.random() * quoteArray.length);
  const quote = quoteArray[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
}

// Filter quotes based on selected category and display one
function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  const selectedCategory = categoryFilter.value;

  localStorage.setItem('lastCategoryFilter', selectedCategory);

  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  displayQuote(filtered);
}

// Add a new quote from inputs
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert('Please enter both quote text and category.');
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();

  // Update category dropdown and reset to new category
  populateCategories();
  document.getElementById('categoryFilter').value = newCategory;
  filterQuotes();

  // Clear input fields
  textInput.value = '';
  categoryInput.value = '';
}

// Show new quote on button click
document.getElementById('newQuote').addEventListener('click', () => {
  filterQuotes();
});

// Initialize on load
window.onload = () => {
  loadQuotes();
  populateCategories();
  filterQuotes();
};
