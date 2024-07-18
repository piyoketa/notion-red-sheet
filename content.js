// 要素が表示されるまで待機する関数
function waitForElements() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            // 読み込み完了を判定する
            let elements = document.querySelectorAll('span[spellcheck="false"]');
            const progressBarElement = document.querySelector('[role="progressbar"]');
            if (elements.length > 0 && progressBarElement == null) {
                clearInterval(interval);
                resolve(elements);
            }
        }, 100); // 100ミリ秒ごとにチェック
    });
}

function findParentDataBlockId(element) {
    while (element && element !== document) {
        if (element.hasAttribute('data-block-id')) {
            return element.getAttribute('data-block-id');
        }
        element = element.parentNode;
    }
    return null; // 見つからなかった場合
}

// 要素が見つかるまで待機し、見つかったらスタイルを適用する
waitForElements().then((elements) => {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.color = "transparent";

        // 左クリックイベントを設定
        elements[i].onclick = function() {
        if (this.style.color === "transparent") {
            this.style.color = "red";
        } else if (this.style.color === "red") {
            this.style.color = "transparent";
        }

        // 右クリックイベントを設定
        elements[i].oncontextmenu = function(event) {
            event.preventDefault();
            dataBlockId = findParentDataBlockId(event.target);

            chrome.storage.local.set({ "title": "hello!" }).then(() => {});
            chrome.storage.local.get("title").then((result) => {debugger;});

            chrome.storage.local.get([dataBlockId]).then((result) => {
                console.log("Value currently is " + result.key);
            });

            chrome.storage.local.set({ [dataBlockId]: new Date() }).then(() => {
                console.log("Value is set to " + 2);
            });
              
            console.log(dataBlockId)
            return false;
        }        
    };
    }
});
