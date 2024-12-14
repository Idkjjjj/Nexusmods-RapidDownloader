function clickSlowDownloadButton() {
  const slowDownloadButton = document.querySelector('#slowDownloadButton');
  if (slowDownloadButton) {
    slowDownloadButton.click();
  }
}

function addQuickDownloadButtons() {
  // Find all links that match the pattern: nexusmods.com/*/mods/[number]
  const modLinks = document.querySelectorAll('a[href*="nexusmods.com"]');
  
  modLinks.forEach(link => {
    // Skip if we've already processed this link
    if (link.nextElementSibling?.classList.contains('nmm-quick-download')) {
      return;
    }
    
    // Check if the link matches our pattern
    const match = link.href.match(/nexusmods\.com\/.*?\/mods\/(\d+)/);
    if (!match) return;
    
    const modId = match[1];
    
    // Create the quick download button
    const quickDownload = document.createElement('a');
    quickDownload.className = 'nmm-quick-download';
    quickDownload.title = 'Download with NMM';
    
    // Add download icon
    quickDownload.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </svg>
    `;
    
    // Add click handler to fetch the latest file ID and trigger download
    quickDownload.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // First, go to the files tab
      const filesUrl = `${link.href}?tab=files`;
      
      try {
        const response = await fetch(filesUrl);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        // Find the first mod manager download button
        const fileIdMatch = doc.querySelector('a[href*="file_id"][href*="nmm=1"]');
        if (fileIdMatch) {
          const fileId = fileIdMatch.href.match(/file_id=(\d+)/)[1];
          // Navigate to the download page
          window.location.href = `${link.href}?tab=files&file_id=${fileId}&nmm=1`;
        } else {
          window.location.href = filesUrl;
        }
      } catch (error) {
        console.error('Error fetching mod page:', error);
        window.location.href = filesUrl;
      }
    });
    
    // Insert button after the link
    link.insertAdjacentElement('afterend', quickDownload);
  });
}

// Check if we're on a download page and click the button if present
if (window.location.href.includes('file_id') && window.location.href.includes('nmm=1')) {
  // Try immediately
  clickSlowDownloadButton();
  
  // Also try after a short delay in case the button loads dynamically
  setTimeout(clickSlowDownloadButton, 1000);
  
  // Set up an observer to watch for the button in case it loads later
  const observer = new MutationObserver((mutations, obs) => {
    const button = document.querySelector('#slowDownloadButton');
    if (button) {
      button.click();
      obs.disconnect(); // Stop observing once we've clicked the button
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Run on page load and observe DOM changes for dynamic content
addQuickDownloadButtons();
const modLinksObserver = new MutationObserver(addQuickDownloadButtons);
modLinksObserver.observe(document.body, { childList: true, subtree: true });