if (document.getElementById('custom-sidebar')) {
    document.getElementById('custom-sidebar').remove();
} else {
  const sidebar = document.createElement('div');
  sidebar.id = 'custom-sidebar';
  sidebar.style.position = 'fixed';
  sidebar.style.top = '0';
  sidebar.style.left = '0';
  sidebar.style.width = '300px';
  sidebar.style.height = '100%';
  sidebar.style.backgroundColor = 'white';
  sidebar.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  sidebar.style.zIndex = 10000;
  sidebar.innerHTML = `
  <h1>Notion赤シート</h1>
  <div>
    <button id="NotionRedSheet__memorize-btn">暗記モード</button>
    <button id="NotionRedSheet__printer-btn">印刷モード</button>
    <button id="NotionRedSheet__disable-btn">解除</button>
    <button id="NotionRedSheet__dump-storage">ストレージを見る</button>
  </div>
  `;

  document.body.appendChild(sidebar);

  function memorizeMode(){
    document.body.classList.remove('printer');
    document.body.classList.add('memorize');
  }
  function printerMode(){
      document.body.classList.remove('memorize');
      document.body.classList.add('printer');
  }
  function normalMode(){
      document.body.classList.remove('memorize');
      document.body.classList.remove('printer');
  }

  document.getElementById("NotionRedSheet__memorize-btn").onclick = function(){
    chrome.storage.local.set({ "mode": "memorize" });
    memorizeMode()
  }
  document.getElementById("NotionRedSheet__printer-btn").onclick = function(){
    chrome.storage.local.set({ "mode": "printer" });
    printerMode()
  }
  document.getElementById("NotionRedSheet__disable-btn").onclick = function(){
    chrome.storage.local.set({ "mode": "normal" });
    normalMode()
  }
  
  document.getElementById("NotionRedSheet__dump-storage").onclick = function(event){
    chrome.storage.local.get(null, ((data) => {console.log(data)}));
  }
}
