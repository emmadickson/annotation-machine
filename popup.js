document.addEventListener('DOMContentLoaded', function () {
    const toggleCheckbox = $('#toggleCheckbox');

    $('#flat').spectrum({
        flat: true,
        showInput: true,
        change: function(color) {
            // Save the selected color to localStorage
            localStorage.setItem('highlightColor', color.toHexString());

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                const tab = tabs[0];
                chrome.tabs.sendMessage(tab.id, { action: 'updateLinkColor', color: color.toHexString() });
            });
        }
    });

    // Toggle button click event
     toggleButton.addEventListener('click', function () {
         console.log('click')
         chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
             const tab = tabs[0];
             chrome.tabs.sendMessage(tab.id, { status: 'off' });
         });
     });

    // Fetch extension status and update toggle checkbox
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, function (response) {
            toggleCheckbox.prop('checked', response.status === 'on');
        });
    });

    // Fetch saved color and set the color picker value
    const savedColor = localStorage.getItem('highlightColor');
    if (savedColor) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            chrome.tabs.sendMessage(tab.id, { color: savedColor});
        });
        $('#flat').spectrum('set', savedColor);
    }

    // Listen for changes in the item list
  $('#itemList').on('keypress', function(event) {
      if (event.which === 13 || event.keyCode === 13) {
          // Check if the key pressed is Enter
          const itemList = $(this).val().split(',').map(item => item.trim());
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
              const tab = tabs[0];
              chrome.tabs.sendMessage(tab.id, { itemList: itemList, color: savedColor});
          });
      }
  });
});
