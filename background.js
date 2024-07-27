let mode = "memorize";
chrome.storage.local.get("mode").then((result) => {
  if(result.mode){
    mode = result.mode;
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  mode = {
    "memorize": "printer",
    "printer": "normal",
    "normal": "memorize"
  }[mode];
  await chrome.storage.local.set({ "mode": mode });
  setIcon()

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: callActivate
  });
});

function callActivate(){
  if (typeof activate === 'function') {
    activate();
  }
}

// Icon
function setIcon(){
  if (mode == "printer") {
    chrome.action.setIcon({ path: "icon128_printer.png" });
  } else if (mode == "normal") {
    chrome.action.setIcon({ path: "icon128_normal.png" });
  } else {
    chrome.action.setIcon({ path: "icon128_memorize.png" });
  }
}
setIcon();
