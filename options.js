document.addEventListener('DOMContentLoaded', async function() {
    // Load saved tokens if they exist
    const storage = await chrome.storage.local.get(['githubToken', 'geminiApiKey']);
    
    if (storage.githubToken) {
      document.getElementById('githubToken').value = storage.githubToken;
    }
    
    if (storage.geminiApiKey) {
      document.getElementById('geminiApiKey').value = storage.geminiApiKey;
    }
    
    // Toggle visibility for GitHub token
    document.getElementById('toggleGithubToken').addEventListener('click', function() {
      const input = document.getElementById('githubToken');
      const buttonText = document.getElementById('toggleGithubToken');
      
      if (input.type === 'password') {
        input.type = 'text';
        buttonText.textContent = 'Hide';
      } else {
        input.type = 'password';
        buttonText.textContent = 'Show';
      }
    });
    
    // Toggle visibility for Gemini API key
    document.getElementById('toggleGeminiKey').addEventListener('click', function() {
      const input = document.getElementById('geminiApiKey');
      const buttonText = document.getElementById('toggleGeminiKey');
      
      if (input.type === 'password') {
        input.type = 'text';
        buttonText.textContent = 'Hide';
      } else {
        input.type = 'password';
        buttonText.textContent = 'Show';
      }
    });
    
    // Save GitHub token
    document.getElementById('saveGithubToken').addEventListener('click', async function() {
      const githubToken = document.getElementById('githubToken').value.trim();
      const statusElement = document.getElementById('githubStatus');
      
      if (!githubToken) {
        statusElement.textContent = 'Error: GitHub token cannot be empty';
        statusElement.className = 'status error';
        return;
      }
      
      try {
        await chrome.storage.local.set({ 'githubToken': githubToken });
        
        statusElement.textContent = 'GitHub token saved successfully!';
        statusElement.className = 'status success';
      } catch (error) {
        statusElement.textContent = `Error: ${error.message}`;
        statusElement.className = 'status error';
      }
    });
    
    // Save Gemini API key
    document.getElementById('saveGeminiKey').addEventListener('click', async function() {
      const geminiApiKey = document.getElementById('geminiApiKey').value.trim();
      const statusElement = document.getElementById('geminiStatus');
      
      if (!geminiApiKey) {
        statusElement.textContent = 'Error: Gemini API key cannot be empty';
        statusElement.className = 'status error';
        return;
      }
      
      try {
        await chrome.storage.local.set({ 'geminiApiKey': geminiApiKey });
        
        statusElement.textContent = 'Gemini API key saved successfully!';
        statusElement.className = 'status success';
      } catch (error) {
        statusElement.textContent = `Error: ${error.message}`;
        statusElement.className = 'status error';
      }
    });
  });