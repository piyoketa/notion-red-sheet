// ===============================================
// モード切り替えのコード
// Utilsとして共有する
// ===============================================
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

// ===============================================
// 暗記モード用のコード
// Utilsとして共有する
// ===============================================
function findParentDataBlockId(element) {
    while (element && element !== document) {
        if (element.hasAttribute('data-block-id')) {
            return element.getAttribute('data-block-id');
        }
        element = element.parentNode;
    }
    return null; // 見つからなかった場合
}

function selectTargetElements(){
    // spellcheckがfalseに設定されている全てのspan要素を取得します。
    var allSpans = document.querySelectorAll('span[spellcheck="false"]');

    // data-success-num属性を持たない要素をフィルタリングします。
    var filteredSpans = Array.prototype.filter.call(allSpans, function(span) {
        return span.style.cursor !== "pointer";
    });

    return filteredSpans;
}

function setBackground(element, successNum){
    if(successNum == 0){
        // ０回目 赤
        element.style.background = "rgb(255 0 0 / 15%)";
    }else if(successNum == 1){
        // １回目 緑
        element.style.background = "rgb(0 255 0 / 15%)";
    }else{
        // ２回目～ 青
        element.style.background = "rgb(0 0 255 / 15%)";
    }
}

function getSuccessNum(element) {
    // 背景色を取得
    const backgroundColor = window.getComputedStyle(element).backgroundColor;

    // 色に基づいて successNum を判断
    if (backgroundColor === 'rgba(255, 0, 0, 0.15)' || backgroundColor === 'rgb(255, 0, 0)') {
        return 0; // 赤
    } else if (backgroundColor === 'rgba(0, 255, 0, 0.15)' || backgroundColor === 'rgb(0, 255, 0)') {
        return 1; // 緑
    } else if (backgroundColor === 'rgba(0, 0, 255, 0.15)' || backgroundColor === 'rgb(0, 0, 255)') {
        return 2; // 青
    } else {
        return -1; // 不明な色
    }
}

// 暗記対象の要素を初期化する
// - 
async function initializeElements(elements) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.color = "transparent";
        elements[i].style.cursor = "pointer";

        // 親のIDを取得
        dataBlockId = findParentDataBlockId(elements[i]);
        elements[i].style.fontSynthesis = dataBlockId;
        // elements[i].setAttribute("parent-data-block-id", dataBlockId);

        // 正解の回数を取得
        const text = elements[i].textContent;
        const storageId = `${dataBlockId}_${text}`
        const result = await chrome.storage.local.get(storageId);
        const successNum = parseInt(result[storageId]) || 0; // カウンタが存在しない場合は0からスタート
        setBackground(elements[i], successNum);

        // elements[i].setAttribute("success-num", successNum);

        // 左クリックイベントを設定
        elements[i].onclick = function(event) {
            if (this.style.color === "transparent") {
                this.style.setProperty('color', 'red', 'important');
            } else if (this.style.color === "red") {
                this.style.setProperty('color', 'transparent', 'important');
            }
        };

        // 右クリックイベントを設定
        elements[i].oncontextmenu = async function(event) {
            event.preventDefault();

            try {
                // 現在のカウンタ値を取得
                let successNum = getSuccessNum(event.target)

                // カウンタを増加
                successNum += 1;
                if(successNum > 2) successNum = 0;

                // 色を更新
                setBackground(event.target, successNum)

                // 更新されたカウンタ値を保存
                const text = event.target.textContent;
                const dataBlockId = findParentDataBlockId(event.target);
                const storageId = `${dataBlockId}_${text}`
                await chrome.storage.local.set({ [storageId]: successNum });

                console.log(storageId + " is " + successNum);
            } catch (error) {
                console.error("Error accessing chrome storage:", error);
            }

            return false;
        };
    }
}

// ===============================================
// content.js 固有の処理
// ===============================================

// 要素が表示されるまで待機する関数
function waitForElements() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            // 読み込み完了を判定する
            let elements = selectTargetElements();
            const progressBarElement = document.querySelector('[role="progressbar"]');
            if (elements.length > 0 && progressBarElement == null) {
                clearInterval(interval);
                resolve(elements);
            }
        }, 100); // 100ミリ秒ごとにチェック
    });
}

// 要素が見つかるまで待機し、見つかったらスタイルを適用する
waitForElements().then(async (elements) => {
    const result = await chrome.storage.local.get("mode");

    if (result.mode == "printer"){
        printerMode()
    } else if (result.mode == "normal"){
        normalMode()
    } else {
        memorizeMode();
        initializeElements(elements);
        setInterval(function() {
            let elements = selectTargetElements();
            if(elements.length > 0){
                initializeElements(elements);
            }
        }, 1000)        
    }
});