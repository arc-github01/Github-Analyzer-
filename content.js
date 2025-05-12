// content.js
// This script runs on GitHub pages to enhance the user experience

// When on a commit page, add a button to analyze the commit
if (window.location.href.includes('/commit/')) {
    // Create the analyze button
    const analyzeButton = document.createElement('button');
    analyzeButton.textContent = 'Analyze with Gemini';
    analyzeButton.style.cssText = `
      background-color: #2ea44f;
      color: white;
      border: none;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      margin-left: 10px;
    `;
    
    // Find a good spot to inject the button (near the commit title)
    const commitTitle = document.querySelector('.commit-title');
    if (commitTitle) {
      commitTitle.parentNode.insertBefore(analyzeButton, commitTitle.nextSibling);
      
      // Add click handler
      analyzeButton.addEventListener('click', function() {
        // Extract repository owner and name from URL
        const urlParts = window.location.pathname.split('/');
        const repoOwner = urlParts[1];
        const repoName = urlParts[2];
        const commitHash = urlParts[4];
        
        // Send message to the background script
        analyzeButton.textContent = 'Analyzing...';
        analyzeButton.disabled = true;
        
        chrome.runtime.sendMessage({
          action: 'page-commit-analysis',
          repoOwner: repoOwner,
          repoName: repoName,
          commitHash: commitHash
        }, function(response) {
          analyzeButton.textContent = 'Analyze with Gemini';
          analyzeButton.disabled = false;
          
          if (response && response.success) {
            // Open the report page
            chrome.runtime.sendMessage({
              action: 'open-report-tab'
            });
          } else {
            alert('Error analyzing commit. Please check extension settings.');
          }
        });
      });
    }
  }
  
  // When on a repository homepage, add a button to generate README
  if (window.location.pathname.split('/').length === 3 && !window.location.pathname.includes('/commit/')) {
    // Create the README button
    const readmeButton = document.createElement('button');
    readmeButton.textContent = 'Generate README with Gemini';
    readmeButton.style.cssText = `
      background-color: #0366d6;
      color: white;
      border: none;
      padding: 5px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      margin-left: 10px;
    `;
    
    // Find a good spot to inject the button (near the repository name)
    const repoHeader = document.querySelector('.d-flex.flex-wrap.flex-items-center.wb-break-word.f3.text-normal');
    if (repoHeader) {
      repoHeader.appendChild(readmeButton);
      
      // Add click handler
      readmeButton.addEventListener('click', function() {
        // Extract repository owner and name from URL
        const urlParts = window.location.pathname.split('/');
        const repoOwner = urlParts[1];
        const repoName = urlParts[2];
        
        // Send message to the background script
        readmeButton.textContent = 'Generating...';
        readmeButton.disabled = true;
        
        chrome.runtime.sendMessage({
          action: 'page-readme-generation',
          repoOwner: repoOwner,
          repoName: repoName
        }, function(response) {
          readmeButton.textContent = 'Generate README with Gemini';
          readmeButton.disabled = false;
          
          if (response && response.success) {
            alert('README generated successfully! Check your downloads folder.');
          } else {
            alert('Error generating README. Please check extension settings.');
          }
        });
      });
    }
  }