// Function to create overlays
function createOverlays(color) {
    console.log('Creating overlays...');
    if (color != undefined){
      var highlightColor =  hexToRgba(color)
    }
    else{
      var highlightColor = 'rgba(255, 0, 0, 0.5)'
    }
    console.log('Highlight Color:', highlightColor);

    document.querySelectorAll('img[usemap]').forEach(img => {
        const mapName = img.getAttribute('usemap').replace('#', '');
        const map = document.querySelector(`map[name="${mapName}"]`);
        const rect = img.getBoundingClientRect();

        // Create a div to hold overlays
        const overlayDiv = document.createElement('div');
        overlayDiv.classList.add('overlay-div');
        overlayDiv.style.position = 'absolute';
        overlayDiv.style.left = `${rect.left + window.scrollX}px`;
        overlayDiv.style.top = `${rect.top + window.scrollY}px`;
        overlayDiv.style.width = `${rect.width}px`;
        overlayDiv.style.height = `${rect.height}px`;
        document.body.appendChild(overlayDiv);

        // Process each area element within the map
        map.querySelectorAll('area').forEach(area => {
            const coords = area.coords.split(',').map(Number);

            if (area.shape.toLowerCase() === 'rect') {
                const [left, top, right, bottom] = coords;
                const overlayLink = document.createElement('a');
                overlayLink.style.position = 'absolute';
                overlayLink.style.left = `${left}px`;
                overlayLink.style.top = `${top}px`;
                overlayLink.style.width = `${right - left}px`;
                overlayLink.style.height = `${bottom - top}px`;
                overlayLink.style.backgroundColor = highlightColor;
                overlayLink.href = area.href;
                overlayLink.target = area.target;
                overlayLink.title = area.alt;
                overlayDiv.appendChild(overlayLink);
            } else if (area.shape.toLowerCase() === 'polygon') {
                // Calculate bounding box for polygon
                let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
                for (let i = 0; i < coords.length; i += 2) {
                    minX = Math.min(minX, coords[i]);
                    maxX = Math.max(maxX, coords[i]);
                    minY = Math.min(minY, coords[i+1]);
                    maxY = Math.max(maxY, coords[i+1]);
                }
                const width = maxX - minX;
                const height = maxY - minY;

                // Create a rectangle to cover the polygon
                const overlayLink = document.createElement('a');
                overlayLink.style.position = 'absolute';
                overlayLink.style.left = `${minX}px`;
                overlayLink.style.top = `${minY}px`;
                overlayLink.style.width = `${width}px`;
                overlayLink.style.height = `${height}px`;
                overlayLink.style.backgroundColor = highlightColor;
                overlayLink.href = area.href;
                overlayLink.target = area.target;
                overlayLink.title = area.alt;
                overlayDiv.appendChild(overlayLink);
            }
        });
    });
}

function removeOverlayDivas() {
    const overlays = document.querySelectorAll('.overlay-diva');
    overlays.forEach(overlay => {
        overlay.parentNode.removeChild(overlay);
    });

}

function removeOverlayDivs() {
    const overlays = document.querySelectorAll('.overlay-div');
    overlays.forEach(overlay => {
        overlay.parentNode.removeChild(overlay);
    });

}


// Function to convert hex color to RGBA
function hexToRgba(hex) {
    // Remove # if it's there
    hex = hex.replace('#', '');

    // Parse hex to RGB
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Convert RGB to RGBA with 0.5 alpha (50% opacity)
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
}

/// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getStatus') {
      const status = localStorage.getItem('extensionStatus') || 'off';
      sendResponse({ status: status });
  } else if (request.status === 'off') {
      removeOverlayDivas();
      removeOverlayDivs();

    } else if (request.action === 'updateLinkColor') {
      const hasOverlayDiv = document.querySelector('.overlay-div') !== null;

      if (hasOverlayDiv) {
        removeOverlayDivs();
        createOverlays(request.color)
      }

      changeOverlayColor('overlay-diva', request.color);

    } else if (request.itemList) {
        const color = localStorage.getItem('highlightColor') || 'rgba(255, 0, 0, 0.5)';
        console.log(request.itemList)
        createOverlaysForItems(request.itemList, color);
    }
});

function changeOverlayColor(className, color) {
    if (color != undefined){
      var highlightColor =  hexToRgba(color)
    }
    else{
      var highlightColor = 'rgba(255, 0, 0, 0.5)'
    }
    // Select all elements with the specified class name
    const overlays = document.querySelectorAll(`.${className}`);
    const elementsWithOverlayClass = document.querySelectorAll('.overlay-diva');

    // Remove existing elements
    overlays.forEach(overlay => {
        overlay.style.backgroundColor = highlightColor;
    });


}

function createOverlaysForItems(itemList, color) {
    // Check if 'usemap' is in the item list
    const usemapIndex = itemList.indexOf('map');
    if (usemapIndex !== -1) {
        // Run createOverlays
        createOverlays(color);

        // Remove 'usemap' from the item list
        itemList.splice(usemapIndex, 1);
    }

    // If itemList is provided, create overlay-div elements for each item
    itemList.forEach(item => {
        const elements = document.querySelectorAll(item);
        elements.forEach(element => {
            const overlayDiv = document.createElement('div');
            overlayDiv.classList.add('overlay-diva');
            const highlightColor = hexToRgba(color);
            overlayDiv.style.backgroundColor = highlightColor;
            overlayDiv.style.position = 'absolute';
            overlayDiv.style.left = `${element.offsetLeft}px`;
            overlayDiv.style.top = `${element.offsetTop}px`;
            overlayDiv.style.width = `${element.offsetWidth}px`;
            overlayDiv.style.height = `${element.offsetHeight}px`;
            overlayDiv.style.zIndex = '9999'; // Ensure the overlay sits on top
            document.body.appendChild(overlayDiv);
        });
    });
}
