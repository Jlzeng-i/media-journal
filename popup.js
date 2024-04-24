document.addEventListener('DOMContentLoaded', function() {
  const saveTabBtn = document.getElementById('saveTabBtn');
  const removeSelectedBtn = document.getElementById('removeSelectedBtn');
  const savedTabsList = document.getElementById('savedTabsList');
  const newPageNameInput = document.getElementById('newPageName');
  const addNewPageBtn = document.getElementById('addNewPageBtn');
  const pageDropdown = document.getElementById('pageDropdown');

  let pages = [];

  // Load from storage
  chrome.storage.sync.get(['savedTabs', 'pages'], function(data) {
    const savedTabs = data.savedTabs || [];
    pages = data.pages || [];
    updatePageDropdown();
    //displaySavedTabs(savedTabs);
  });

  // Save Current Tab
  saveTabBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];
      const savedTab = {
        id: currentTab.id,
        title: currentTab.title,
        url: currentTab.url,
        timestamp: Date.now()
      };
      chrome.storage.sync.get('savedTabs', function(data) {
        const savedTabs = data.savedTabs || [];
        savedTabs.push(savedTab);
        chrome.storage.sync.set({ 'savedTabs': savedTabs });
        displaySavedTabs(savedTabs);
      });
    });
  });
	  function displaySavedTabs(tabs) {
		savedTabsList.innerHTML = '';
		tabs.forEach(function(tab) {
		  const listItem = document.createElement('li');
		  const checkbox = document.createElement('input');
		  checkbox.type = 'checkbox';
		  checkbox.value = tab.id;
		  listItem.appendChild(checkbox);
		  listItem.appendChild(document.createTextNode(tab.title));
		  listItem.addEventListener('click', function(event) {
			if (event.target !== checkbox) {
			  chrome.tabs.create({ url: tab.url });
			}
		  });
		  savedTabsList.appendChild(listItem);
		});
	  }
	function displaySavedTabsForPage(page) {
	  chrome.storage.sync.get('savedTabs', function(data) {
		const savedTabs = data.savedTabs || [];
		const tabsForPage = savedTabs.filter(tab => tab.page === page);
		displaySavedTabs(tabsForPage);
	  });
	}

	pageDropdown.addEventListener('change', function() {
	  const selectedPage = pageDropdown.value;
	  displaySavedTabsForPage(selectedPage);
	});

	saveTabBtn.addEventListener('click', function() {
	  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		const currentTab = tabs[0];
		const savedTab = {
		  id: currentTab.id,
		  title: currentTab.title,
		  url: currentTab.url,
		  timestamp: Date.now(),
		  page: pageDropdown.value 
		};
		chrome.storage.sync.get('savedTabs', function(data) {
		  const savedTabs = data.savedTabs || [];
		  savedTabs.push(savedTab);
		  chrome.storage.sync.set({ 'savedTabs': savedTabs });
		  displaySavedTabsForPage(savedTab.page); 
		});
	  });
	});

	removeSelectedBtn.addEventListener('click', function() {
	  const checkboxes = savedTabsList.querySelectorAll('input[type="checkbox"]:checked');
	  const tabIdsToRemove = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
	  removeTabs(tabIdsToRemove);
	});

	function removeTabs(tabIds) {
	  chrome.storage.sync.get('savedTabs', function(data) {
		const savedTabs = data.savedTabs || [];
		const updatedTabs = savedTabs.filter(tab => !tabIds.includes(tab.id));
		chrome.storage.sync.set({ 'savedTabs': updatedTabs });
		displaySavedTabsForPage(pageDropdown.value); // Display saved tabs for the selected page
	  });
	}

	addNewPageBtn.addEventListener('click', function() {
	  const newPageName = newPageNameInput.value.trim();
	  if (!newPageName) {
		//console.log('Please enter a page name.');
		return;
	  }
	  if (pages.includes(newPageName)) {
		//console.log('Page name already exists.');
		return;
	  }
	  pages.push(newPageName);
	  chrome.storage.sync.set({ 'pages': pages });
	  updatePageDropdown();
	  newPageNameInput.value = '';
	});

	function updatePageDropdown() {
	  pageDropdown.innerHTML = '';
	  pages.forEach(function(page) {
		const option = document.createElement('option');
		option.value = page;
		option.textContent = page;
		pageDropdown.appendChild(option);
	  });
	}
	//Initialize
	updatePageDropdown();
});