(function () {
  const edges = window.tangly_edges;
  const svg = document.getElementById('dependency-svg');
  const container = document.getElementById('container');
  let selectedFolder = null;

  function drawLines() {
    svg.innerHTML = '';

    const containerRect = container.getBoundingClientRect();
    svg.setAttribute('width', containerRect.width);
    svg.setAttribute('height', containerRect.height);

    // Create defs section for gradients
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    let gradientCounter = 0;

    edges.forEach((edge) => {
      const fromEl = document.querySelector(`[data-file-path="${edge.from}"] span`);
      const toEl = document.querySelector(`[data-file-path="${edge.to}"] span`);

      if (!fromEl || !toEl) return;

      // Filter based on selected folder
      if (selectedFolder) {
        const fromLi = fromEl.parentElement;
        const toLi = toEl.parentElement;
        const fromFolder = fromLi.getAttribute('data-folder');
        const toFolder = toLi.getAttribute('data-folder');
        if (fromFolder !== selectedFolder && toFolder !== selectedFolder) {
          return; // Skip this edge if neither endpoint is in selected folder
        }
      }

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const x1 = fromRect.left - containerRect.left + fromRect.width + 4;
      const y1 = fromRect.top - containerRect.top + 2;
      const x2 = toRect.left - containerRect.left + toRect.width + 4;
      const y2 = toRect.top - containerRect.top + toRect.height - 2;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      // Create arc to the right of the tree
      const midX = Math.max(x1, x2) + 400;
      const midY = (y1 + y2) / 2;
      const controlOffset = 50;

      // Path: start -> arc right to midpoint -> arc back to end
      const d = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${midX - controlOffset} ${y1}, ${midX} ${midY} S ${midX - controlOffset} ${y2}, ${x2} ${y2}`;

      path.setAttribute('d', d);

      // Create gradient from source to target using actual coordinates
      const gradientId = `gradient${gradientCounter++}`;
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', gradientId);
      gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
      gradient.setAttribute('x1', x1);
      gradient.setAttribute('y1', y1);
      gradient.setAttribute('x2', x2);
      gradient.setAttribute('y2', y2);

      // Define colors based on edge type - contrasting hues
      let startColor, endColor;
      if (edge.class === 'import-type') {
        startColor = '#9c27b0'; // Purple
        endColor = '#00e676'; // Green
      } else if (edge.class === 'import-side-effect') {
        startColor = '#ff6f00'; // Orange
        endColor = '#2196f3'; // Blue
      } else {
        startColor = '#e91e63'; // Magenta/Pink
        endColor = '#00bcd4'; // Cyan
      }

      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('style', `stop-color:${startColor};stop-opacity:1`);

      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('style', `stop-color:${endColor};stop-opacity:1`);

      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);

      // Use gradient for stroke
      path.setAttribute('stroke', `url(#${gradientId})`);
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '0.6');
      if (edge.class === 'import-side-effect') {
        path.setAttribute('stroke-dasharray', '5,5');
      }
      path.setAttribute('class', 'dependency-line');
      path.setAttribute('pointer-events', 'stroke'); // Enable hover on stroke only

      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${edge.from.replace(window.tangly_root, '')} → ${edge.to.replace(window.tangly_root, '')}`;
      path.appendChild(title);

      svg.appendChild(path);
    });
  }

  // Handle folder selection
  function setupFolderSelection() {
    const folders = document.querySelectorAll('.tree li.directory');
    folders.forEach((folder) => {
      folder.addEventListener('click', (e) => {
        e.stopPropagation();
        const folderPath = folder.getAttribute('data-folder-path');

        // Toggle selection
        if (selectedFolder === folderPath) {
          selectedFolder = null;
          folders.forEach((f) => f.classList.remove('selected'));
        } else {
          selectedFolder = folderPath;
          folders.forEach((f) => f.classList.remove('selected'));
          folder.classList.add('selected');
        }

        drawLines();
      });
    });
  }

  // Draw lines on initial load
  window.addEventListener('load', () => {
    drawLines();
    setupFolderSelection();
  });

  // Redraw when container size changes
  const resizeObserver = new ResizeObserver(drawLines);
  resizeObserver.observe(container);
})();
