document.addEventListener('DOMContentLoaded', function () {
    const toggleCheckbox = $('#toggleCheckbox');

    $('#flat').spectrum({
        flat: true,
        showInput: true,
        change: function(color) {
            // Save the selected color to localStorage
            localStorage.setItem('highlightColor', color.toHexString());
            console.log('Before querying tabs');
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
              console.log('Tabs queried');
              const tab = tabs[0];
              chrome.tabs.sendMessage(tab.id, { action: 'updateLinkColor', color: color.toHexString() });
          });
        }
    });

    toggleCheckbox.on('change', function () {
        const status = toggleCheckbox.prop('checked') ? 'on' : 'off';
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            chrome.tabs.sendMessage(tab.id, { status: status });
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
});
