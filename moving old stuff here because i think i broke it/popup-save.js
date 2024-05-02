document.addEventListener('DOMContentLoaded', function() {
  const saveForm = document.getElementById('saveForm');

  saveForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value.trim();
    const notes = document.getElementById('notes').value.trim();

    // Close the popup window
    window.close();

    // Send the title, notes, and other relevant information to the background script to save
    chrome.runtime.sendMessage({
      action: 'saveTab',
      title: title,
      notes: notes
    });
  });
});