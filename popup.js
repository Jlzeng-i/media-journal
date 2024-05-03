document.addEventListener('DOMContentLoaded', function() {
  loadEntries();
  loadPages();

  document.getElementById('addEntry').addEventListener('click', function() {
    addEntry();
  });

  document.getElementById('addPage').addEventListener('click', function() {
    addPage();
  });
  
  document.getElementById('delPage').addEventListener('click', function() {
    deletePage();
  });
  document.getElementById('youtube').addEventListener('click', function() {
    var labelTextBox = document.getElementById('label');
    labelTextBox.value = "YouTube";
  });
  document.getElementById('tiktok').addEventListener('click', function() {
    var labelTextBox = document.getElementById('label');
    labelTextBox.value = "TikTok";
  });
  document.getElementById('twitter').addEventListener('click', function() {
    var labelTextBox = document.getElementById('label');
    labelTextBox.value = "Twitter";
  });
  document.getElementById('instagram').addEventListener('click', function() {
    var labelTextBox = document.getElementById('label');
    labelTextBox.value = "Instagram";
  });
  document.getElementById('facebook').addEventListener('click', function() {
    var labelTextBox = document.getElementById('label');
    labelTextBox.value = "Facebook";
  });
  document.getElementById('gaming').addEventListener('click', function() {
    var labelTextBox = document.getElementById('label');
    labelTextBox.value = "Video Games";
  });
  document.getElementById('pageDropdown').addEventListener('change', function() {
    const selectedPage = this.value;
    loadEntries(selectedPage);
  });

});

function addEntry() {
  const label = document.getElementById('label').value;
  const start = document.getElementById('startTime').value;
  const stop = document.getElementById('stopTime').value;
  const notes = document.getElementById('notes').value;
  const page = document.getElementById('pageDropdown').value;
  
  if (!label || !start || !stop) {
    alert('Please fill in all fields.');
    return;
  }

  const entry = { label, start, stop, notes, page };

  // Save entry to account
  chrome.storage.sync.get('entries', function(result) {
    const entries = result.entries || [];
    entries.push(entry);
    chrome.storage.sync.set({ 'entries': entries }, function() {
      loadEntries(page);
    });
  });
}


function loadEntries(pageLabel = null) {
  chrome.storage.sync.get('entries', function(result) {
    const entries = result.entries || [];
    const entriesContainer = document.getElementById('entries');
    entriesContainer.innerHTML = '';

    // Check if value is All Pages and ignore it if it is
	if (pageLabel && pageLabel == 'All Pages') {
	pageLabel = null;
	}
    const filteredEntries = pageLabel ? entries.filter(entry => entry.page === pageLabel) : entries;
	
    // Display entries
    filteredEntries.forEach(function(entry) {
      const entryDiv = document.createElement('div');
      entryDiv.classList.add('entry');
      entryDiv.innerHTML = `
        <div class="label">Label: ${entry.label}</div>
        <div class="timestamp">Start: ${entry.start} - Stop: ${entry.stop}</div>
        <div class="notes">Notes: ${entry.notes}</div>
      `;
      entriesContainer.appendChild(entryDiv);
    });
  });
}

function loadPages() {
  chrome.storage.sync.get('pages', function(result) {
    const pages = result.pages || [];
    const pageDropdown = document.getElementById('pageDropdown');
    pageDropdown.innerHTML = '';
	
	//Create the All Pages option by default
    const defaultOption = document.createElement('option');
    defaultOption.text = 'All Pages';
    pageDropdown.add(defaultOption);

    // load every page
    pages.forEach(function(page) {
      const option = document.createElement('option');
      option.text = page.label;
      pageDropdown.add(option);
    });
  });
}

function addPage() {
	//Defaults page label to current date 
  const pageLabel = document.getElementById('pageLabel').value || new Date().toLocaleDateString('en-US');
  
  // Save page to storage
  chrome.storage.sync.get('pages', function(result) {
    const pages = result.pages || [];
	const pageExists = pages.some(page => page.label === pageLabel);
	//check if page exists so no duplicates can exist
	if (!pageExists) {
    const newPage = { label: pageLabel };
    pages.push(newPage);
    chrome.storage.sync.set({ 'pages': pages }, function() {
      loadPages(); // Refresh pages after adding new page
	  
	  
	  //TODO set the page value to the new page immediately cuz this dont work
	  const selectedPage = newPage;
      loadEntries(selectedPage);
      //loadEntries(pageLabel); // Load entries for the new page
    });
	} else {
      alert('Page already exists!');
	}
  });
}

// Function to delete a page and its associated entries
function deletePage() {
  pageLabel = document.getElementById('pageDropdown').value;
  chrome.storage.sync.get(['pages', 'entries'], function(result) {
    let pages = result.pages || [];
    let entries = result.entries || [];

    // Filter out the page and its associated entries
    pages = pages.filter(page => page.label !== pageLabel);
    entries = entries.filter(entry => entry.label !== pageLabel);

    // Save updated data
    chrome.storage.sync.set({ 'pages': pages, 'entries': entries }, function() {
      loadPages(); // Refresh pages after deletion
      loadEntries(); // Load entries for remaining pages
    });
  });
}