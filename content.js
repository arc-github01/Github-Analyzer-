chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getCode') {
      // Extract code from GitHub page
      let code = '';
      
      // Check if we're on a file view page
      const fileContent = document.querySelector('.blob-wrapper');
      if (fileContent) {
        code = fileContent.textContent;
      } 
      // Check if we're on a pull request page
      else {
        const diffElements = document.querySelectorAll('.diff-view .file');
        if (diffElements.length > 0) {
          diffElements.forEach(diff => {
            const fileName = diff.querySelector('.file-header').getAttribute('data-path');
            const diffContent = diff.querySelector('.diff-table').textContent;
            code += `File: ${fileName}\n\n${diffContent}\n\n`;
          });
        }
      }
      
      sendResponse({ code: code });
      return true;
    }
    
    if (request.action === 'getRepoInfo') {
      // Extract repository information
      const repoData = {};
      
      // Get repository name and owner
      const repoHeader = document.querySelector('meta[name="octolytics-dimension-repository_nwo"]');
      if (repoHeader) {
        const repoFullName = repoHeader.getAttribute('content');
        const [owner, repo] = repoFullName.split('/');
        repoData.owner = owner;
        repoData.name = repo;
        repoData.fullName = repoFullName;
      }
      
      // Get repository description
      const descriptionElement = document.querySelector('.f4.my-3');
      if (descriptionElement) {
        repoData.description = descriptionElement.textContent.trim();
      }
      
      // Get programming languages
      const languageElements = document.querySelectorAll('.d-inline-flex.flex-items-center.flex-nowrap.link-gray.no-underline.text-small.mr-3');
      if (languageElements.length > 0) {
        repoData.languages = [];
        languageElements.forEach(lang => {
          const langName = lang.textContent.trim();
          if (langName) {
            repoData.languages.push(langName);
          }
        });
      }
      
      // Get file structure (if on code tab)
      const fileElements = document.querySelectorAll('.js-navigation-item');
      if (fileElements.length > 0) {
        repoData.files = [];
        fileElements.forEach(file => {
          const fileNameElement = file.querySelector('.js-navigation-open');
          if (fileNameElement) {
            repoData.files.push(fileNameElement.textContent.trim());
          }
        });
      }
      
      sendResponse({ repoData: repoData });
      return true;
    }
  });
  