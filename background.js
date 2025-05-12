// background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'commit-report') {
      generateCommitReport(request, sendResponse);
      return true; // Keep the message channel open for async response
    } else if (request.action === 'readme-generation') {
      generateReadme(request, sendResponse);
      return true; // Keep the message channel open for async response
    }
  });
  
  async function generateCommitReport(request, sendResponse) {
    try {
      // Fetch the commit data
      const commitData = await fetchCommitData(
        request.repoOwner, 
        request.repoName, 
        request.commitHash, 
        request.githubToken
      );
      
      if (!commitData) {
        sendResponse({success: false, error: 'Unable to fetch commit data'});
        return;
      }
      
      // Generate report using Gemini API
      const report = await generateGeminiReport(
        'commit-report', 
        commitData, 
        request.geminiApiKey
      );
      
      sendResponse({success: true, data: report});
    } catch (error) {
      console.error('Error generating commit report:', error);
      sendResponse({success: false, error: error.message || 'Failed to generate commit report'});
    }
  }
  
  async function generateReadme(request, sendResponse) {
    try {
      // Fetch repository data
      const repoData = await fetchRepositoryData(
        request.repoOwner, request.repoName, 
        request.githubToken
      );
      
      if (!repoData) {
        sendResponse({success: false, error: 'Unable to fetch repository data'});
        return;
      }
      
      // Generate README using Gemini API
      const readme = await generateGeminiReport(
        'readme-generation', 
        repoData, 
        request.geminiApiKey
      );
      
      sendResponse({success: true, data: readme});
    } catch (error) {
      console.error('Error generating README:', error);
      sendResponse({success: false, error: error.message || 'Failed to generate README'});
    }
  }
  
  async function fetchCommitData(owner, repo, commitHash, token) {
    try {
      // Get the commit hash if not provided
      if (!commitHash) {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
          {
            headers: token ? {'Authorization': `token ${token}`} : {}
          }
        );
        
        if (!commitsResponse.ok) {
          throw new Error(`Failed to fetch commits: ${commitsResponse.status}`);
        }
        
        const commits = await commitsResponse.json();
        commitHash = commits[0].sha;
      }
      
      // Get the commit details
      const commitResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits/${commitHash}`,
        {
          headers: token ? {'Authorization': `token ${token}`} : {}
        }
      );
      
      if (!commitResponse.ok) {
        throw new Error(`Failed to fetch commit: ${commitResponse.status}`);
      }
      
      const commitData = await commitResponse.json();
      
      // Get the detailed diff
      const diffResponse = await fetch(
        commitData.html_url + '.diff',
        {
          headers: token ? {'Authorization': `token ${token}`} : {}
        }
      );
      
      if (!diffResponse.ok) {
        throw new Error(`Failed to fetch diff: ${diffResponse.status}`);
      }
      
      const diffText = await diffResponse.text();
      
      return {
        commitMessage: commitData.commit.message,
        author: commitData.commit.author.name,
        date: commitData.commit.author.date,
        stats: commitData.stats,
        files: commitData.files,
        diff: diffText
      };
    } catch (error) {
      console.error('Error fetching commit data:', error);
      throw error;
    }
  }
  
  async function fetchRepositoryData(owner, repo, token) {
    try {
      // Get repository info
      const repoResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: token ? {'Authorization': `token ${token}`} : {}
        }
      );
      
      if (!repoResponse.ok) {
        throw new Error(`Failed to fetch repository: ${repoResponse.status}`);
      }
      
      const repoInfo = await repoResponse.json();
      
      // Get contents of the repository
      const contentsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents`,
        {
          headers: token ? {'Authorization': `token ${token}`} : {}
        }
      );
      
      if (!contentsResponse.ok) {
        throw new Error(`Failed to fetch contents: ${contentsResponse.status}`);
      }
      
      const contents = await contentsResponse.json();
      
      // Get languages used
      const languagesResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/languages`,
        {
          headers: token ? {'Authorization': `token ${token}`} : {}
        }
      );
      
      if (!languagesResponse.ok) {
        throw new Error(`Failed to fetch languages: ${languagesResponse.status}`);
      }
      
      const languages = await languagesResponse.json();
      
      return {
        name: repoInfo.name,
        description: repoInfo.description,
        owner: repoInfo.owner.login,
        license: repoInfo.license,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        issues: repoInfo.open_issues_count,
        homepage: repoInfo.homepage,
        languages: languages,
        contents: contents
      };
    } catch (error) {
      console.error('Error fetching repository data:', error);
      throw error;
    }
  }
  
  async function generateGeminiReport(type, data, apiKey) {
    try {
      let prompt;
      
      if (type === 'commit-report') {
        prompt = `Analyze the following GitHub commit and generate a structured report with the following details:
        * **Commit Message:** Summarize the intent concisely.
        * **Files Changed:** List filenames with brief changes.
        * **Code Impact:** Explain how the changes affect functionality.
        * **Potential Issues:** Identify possible bugs or improvements.
        * **Best Practices & Suggestions:** Offer coding and documentation recommendations.
        
        Here is the commit data: ${JSON.stringify(data)}`;
      } else { // readme-generation
        prompt = `Analyze the following GitHub repository and generate a comprehensive README file with:
        * **Project Title & Description** (Summarize purpose and features)
        * **Installation Steps** (List dependencies and setup instructions)
        * **Usage Guide** (Explain how to run the project)
        * **Folder & File Structure** (Brief overview)
        * **Contributing Guidelines** (How others can contribute)
        * **License Details** (If applicable)
        
        Here is the repository data: ${JSON.stringify(data)}`;
      }
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Extract text from response
      const generatedText = responseData.candidates[0].content.parts[0].text;
      return generatedText;
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw error;
    }
  }