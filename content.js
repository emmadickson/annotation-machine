// Function to create overlays
function hexToRgba(hex) {
    // Remove # if it's there
    hex = hex.replace('#', '');

    // Parse hex to RGB
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Convert RGB to RGBA with the specified alpha (opacity)
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
}
function createOverlays(color) {
    console.log('Creating overlays...');
    const highlightColor = hexToRgba(color) || 'rgba(255, 0, 0, 0.5)';
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

// Function to remove overlays
function removeOverlays() {
    const overlays = document.querySelectorAll('.overlay-div');
    overlays.forEach(overlay => {
        overlay.parentNode.removeChild(overlay);
    });
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'getStatus') {
        const status = localStorage.getItem('extensionStatus') || 'off';
        sendResponse({ status: status });
    } else if (request.status === 'on') {
        createOverlays();
    } else if (request.status === 'off') {
        removeOverlays();
    } else if (request.action === 'updateLinkColor') {
        removeOverlays();
        console.log('Received color update message:', request.color);
        createOverlays(request.color); // Pass the color to the createOverlays function
    }
});
