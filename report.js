
    document.addEventListener('DOMContentLoaded', function() {
      chrome.storage.local.get(['commitReport'], function(data) {
        if (data.commitReport) {
          document.getElementById('report-content').innerHTML = JSON.parse(data.commitReport);
        } else {
          document.getElementById('report-content').textContent = 'No commit report data found.';
        }
      });
    });
  