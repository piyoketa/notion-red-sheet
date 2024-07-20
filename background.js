chrome.runtime.onInstalled.addListener(() => {
    chrome.action.disable();
  
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && /^https:\/\/.*\.notion\.site\/.*/.test(tab.url)) {
        chrome.action.enable(tabId);
      } else {
        chrome.action.disable(tabId);
      }
    });
  });
  