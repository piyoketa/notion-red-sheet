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

function resetElements(elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.color = "transparent";

        // 左クリックイベントを設定
        elements[i].onclick = function() {
            if (this.style.color === "transparent") {
                this.style.setProperty('color', 'red', 'important');
            } else if (this.style.color === "red") {
                this.style.setProperty('color', 'transparent', 'important');
            }

            // 右クリックイベントを設定
            elements[i].oncontextmenu = async function(event) {
                event.preventDefault();
                dataBlockId = findParentDataBlockId(event.target);

                try {
                    // 現在のカウンタ値を取得
                    const dataBlockResult = await chrome.storage.local.get(dataBlockId);
                    let counter = parseInt(dataBlockResult[dataBlockId]) || 0; // カウンタが存在しない場合は0からスタート

                    // カウンタを増加
                    counter += 1;

                    // 更新されたカウンタ値を保存
                    await chrome.storage.local.set({ [dataBlockId]: counter });

                    console.log(dataBlockId + " is " + counter);
                } catch (error) {
                    console.error("Error accessing chrome storage:", error);
                }

                return false;
            };
        };
    }
}

// CSSスタイルを動的に作成する関数
function addGlobalStyle(css) {
    let head = document.head || document.getElementsByTagName('head')[0];
    let style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
}
