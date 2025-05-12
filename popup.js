// popup.js
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const mainPanel = document.getElementById('main-panel');
    const settingsPanel = document.getElementById('settings-panel');
    const repoUrlInput = document.getElementById('repo-url');
    const actionTypeSelect = document.getElementById('action-type');
    const commitOptionsDiv = document.getElementById('commit-options');
    const commitHashInput = document.getElementById('commit-hash');
    const analyzeBtn = document.getElementById('analyze-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const backBtn = document.getElementById('back-btn');
    const saveSettingsBtn = document.getElementById('save-settings');
    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    const githubTokenInput = document.getElementById('github-token');
    const statusMessage = document.getElementById('status-message');
    
    // Load saved settings
    chrome.storage.sync.get(['geminiApiKey', 'githubToken'], function(data) {
      if (data.geminiApiKey) {
        geminiApiKeyInput.value = data.geminiApiKey;
      }
      if (data.githubToken) {
        githubTokenInput.value = data.githubToken;
      }
    });
    
    // Toggle between commit report and README generation options
    actionTypeSelect.addEventListener('change', function() {
      if (actionTypeSelect.value === 'commit-report') {
        commitOptionsDiv.classList.remove('hidden');
      } else {
        commitOptionsDiv.classList.add('hidden');
      }
    });
    
    // Button to navigate to settings panel
    settingsBtn.addEventListener('click', function() {
      mainPanel.classList.add('hidden');
      settingsPanel.classList.remove('hidden');
    });
    
    // Button to navigate back to main panel
    backBtn.addEventListener('click', function() {
      settingsPanel.classList.add('hidden');
      mainPanel.classList.remove('hidden');
    });
    
    // Save settings
    saveSettingsBtn.addEventListener('click', function() {
      chrome.storage.sync.set({
        geminiApiKey: geminiApiKeyInput.value,
        githubToken: githubTokenInput.value
      }, function() {
        showStatus('Settings saved successfully!', 'success');
        setTimeout(() => {
          settingsPanel.classList.add('hidden');
          mainPanel.classList.remove('hidden');
        }, 1500);
      });
    });
    
    // Analyze button click handler
    analyzeBtn.addEventListener('click', function() {
      const repoUrl = repoUrlInput.value.trim();
      if (!repoUrl) {
        showStatus('Please enter a GitHub repository URL', 'error');
        return;
      }
      
      // Extract username and repo name from URL
      const urlParts = repoUrl.split('/');
      const username = urlParts[urlParts.indexOf('github.com') + 1];
      const repoName = urlParts[urlParts.indexOf('github.com') + 2];
      
      if (!username || !repoName) {
        showStatus('Invalid GitHub repository URL', 'error');
        return;
      }
      
      analyzeBtn.disabled = true;
      showStatus('Processing...', 'success');
      
      chrome.storage.sync.get(['geminiApiKey', 'githubToken'], function(data) {
        if (!data.geminiApiKey) {
          showStatus('Please set your Gemini API key in settings', 'error');
          analyzeBtn.disabled = false;
          return;
        }
        
        const actionType = actionTypeSelect.value;
        const commitHash = commitHashInput.value.trim();
        
        // Send message to background script
        chrome.runtime.sendMessage({
          action: actionType,
          repoOwner: username,
          repoName: repoName,
          commitHash: commitHash,
          geminiApiKey: data.geminiApiKey,
          githubToken: data.githubToken || ''
        }, function(response) {
          if (response.success) {
            if (actionType === 'readme-generation') {
              // Download the README file
              const blob = new Blob([response.data], {type: 'text/plain'});
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'README.txt';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              showStatus('README generated and downloaded!', 'success');
            } else {
              // Show commit report in a new tab
              chrome.tabs.create({
                url: chrome.runtime.getURL('report.html')
              }, function(tab) {
                chrome.storage.local.set({
                  'commitReport': response.data
                });
              });
              
              showStatus('Commit report generated!', 'success');
            }
          } else {
            showStatus(response.error || 'An error occurred', 'error');
          }
          analyzeBtn.disabled = false;
        });
      });
    });
    
    function showStatus(message, type) {
      statusMessage.textContent = message;
      statusMessage.className = type === 'error' ? 'error' : 'success';
      statusMessage.classList.remove('hidden');
      
      // Hide after 5 seconds
      setTimeout(() => {
        statusMessage.classList.add('hidden');
      }, 5000);
    }
  });