document.addEventListener('DOMContentLoaded', function() {
    const apiKeySection = document.getElementById('apiKeySection');
    const analysisSection = document.getElementById('analysisSection');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const analyzeCodeButton = document.getElementById('analyzeCode');
    const generateReadmeButton = document.getElementById('generateReadme');
    const changeApiKeyButton = document.getElementById('changeApiKey');
    const downloadResultButton = document.getElementById('downloadResult');
    const responseContainer = document.getElementById('responseContainer');
    const responseElement = document.getElementById('response');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Check if API key is already saved
    chrome.storage.local.get(['geminiApiKey'], function(result) {
      if (result.geminiApiKey) {
        apiKeySection.classList.add('hidden');
        analysisSection.classList.remove('hidden');
      }
    });
    
    // Save API key
    saveApiKeyButton.addEventListener('click', function() {
      const apiKey = document.getElementById('apiKey').value.trim();
      if (apiKey) {
        chrome.storage.local.set({ geminiApiKey: apiKey }, function() {
          apiKeySection.classList.add('hidden');
          analysisSection.classList.remove('hidden');
        });
      } else {
        alert('Please enter a valid API key');
      }
    });
    
    // Change API key
    changeApiKeyButton.addEventListener('click', function() {
      apiKeySection.classList.remove('hidden');
      analysisSection.classList.add('hidden');
    });
    
    // Analyze code
    analyzeCodeButton.addEventListener('click', function() {
      loadingIndicator.classList.remove('hidden');
      responseContainer.classList.add('hidden');
      
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getCode' }, function(response) {
          if (response && response.code) {
            const customPrompt = document.getElementById('prompt').value.trim();
            const defaultPrompt = `Analyze the following GitHub code and generate a structured report with the following details:
  * Code Overview: Summarize what the code does.
  * Files Structure: List main components and their purpose.
  * Code Quality: Identify strengths and potential issues.
  * Best Practices & Suggestions: Offer coding and documentation recommendations.
  Here is the code: `;
            
            const prompt = customPrompt || defaultPrompt;
            
            chrome.storage.local.get(['geminiApiKey'], function(result) {
              if (result.geminiApiKey) {
                callGeminiApi(result.geminiApiKey, prompt + response.code);
              } else {
                loadingIndicator.classList.add('hidden');
                alert('API key not found. Please set your Gemini API key.');
              }
            });
          } else {
            loadingIndicator.classList.add('hidden');
            alert('Could not extract code from the current page.');
          }
        });
      });
    });
    
    // Generate README
    generateReadmeButton.addEventListener('click', function() {
      loadingIndicator.classList.remove('hidden');
      responseContainer.classList.add('hidden');
      
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getRepoInfo' }, function(response) {
          if (response && response.repoData) {
            const prompt = `Analyze the following GitHub repository and generate a comprehensive README file with:
  * Project Title & Description (Summarize purpose and features)
  * Installation Steps (List dependencies and setup instructions)
  * Usage Guide (Explain how to run the project)
  * Folder & File Structure (Brief overview)
  * Contributing Guidelines (How others can contribute)
  * License Details (If applicable)
  Here is the repository data: `;
            
            chrome.storage.local.get(['geminiApiKey'], function(result) {
              if (result.geminiApiKey) {
                callGeminiApi(result.geminiApiKey, prompt + JSON.stringify(response.repoData));
              } else {
                loadingIndicator.classList.add('hidden');
                alert('API key not found. Please set your Gemini API key.');
              }
            });
          } else {
            loadingIndicator.classList.add('hidden');
            alert('Could not extract repository information from the current page.');
          }
        });
      });
    });
    
    // Download result
    downloadResultButton.addEventListener('click', function() {
      const content = responseElement.textContent;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gemini-analysis.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    
    function callGeminiApi(apiKey, prompt) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      })
      .then(response => response.json())
      .then(data => {
        loadingIndicator.classList.add('hidden');
        
        if (data.candidates && data.candidates.length > 0 && 
            data.candidates[0].content && 
            data.candidates[0].content.parts && 
            data.candidates[0].content.parts.length > 0) {
          
          const generatedText = data.candidates[0].content.parts[0].text;
          responseElement.textContent = generatedText;
          responseContainer.classList.remove('hidden');
        } else {
          throw new Error('Invalid response format from Gemini API');
        }
      })
      .catch(error => {
        loadingIndicator.classList.add('hidden');
        alert('Error calling Gemini API: ' + error.message);
        console.error('Error:', error);
      });
    }
  });
  