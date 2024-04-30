window.onload = function() {
    document.querySelectorAll('img[usemap]').forEach(img => {
        const mapName = img.getAttribute('usemap').replace('#', '');
        const map = document.querySelector(`map[name="${mapName}"]`);
        const rect = img.getBoundingClientRect();

        // Create a div to hold overlays
        const overlayDiv = document.createElement('div');
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
                overlayLink.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
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
                overlayLink.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                overlayLink.href = area.href;
                overlayLink.target = area.target;
                overlayLink.title = area.alt;
                overlayDiv.appendChild(overlayLink);
            }
        });
    });
};
