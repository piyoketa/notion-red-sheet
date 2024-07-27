// ===============================================
// 全モード共通のUtils
// ===============================================
function selectTargetElements(filter=true) {
  // spellcheckがfalseに設定されている全てのspan要素を取得します。
  var elements = document.querySelectorAll('span[spellcheck="false"]');

  if(filter){
    var elements = Array.prototype.filter.call(elements, function (element) {
      return element.style.cursor !== "pointer";
    });
  }

  return elements;
}

// ===============================================
// 暗記モード用のコード
// ===============================================
// 要素の初期状態を復元する
function resetElements() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  let elements = selectTargetElements(false);

  for (let i = 0; i < elements.length; i++) {
    // 色を元に戻す
    elements[i].style.color = "#EB5757";
    elements[i].style.cursor = "";
    // elements[i].style.fontSynthesis = "";

    // 背景色を元に戻す
    elements[i].style.backgroundColor = "rgba(135, 131, 120, .15)";

    // 左クリックイベントを削除
    elements[i].onclick = null;

    // 右クリックイベントを削除
    elements[i].oncontextmenu = null;
  }
}

// ===============================================
// 暗記モード用のコード
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

function setBackground(element, successNum) {
  if (successNum == 0) {
    // ０回目 赤
    element.style.background = "rgb(255 0 0 / 15%)";
  } else if (successNum == 1) {
    // １回目 緑
    element.style.background = "rgb(0 255 0 / 15%)";
  } else {
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
async function initializeElements() {
  let elements = selectTargetElements();

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
    elements[i].onclick = function (event) {
      if (this.style.color === "transparent") {
        this.style.setProperty('color', 'red', 'important');
      } else if (this.style.color === "red") {
        this.style.setProperty('color', 'transparent', 'important');
      }
    };

    // 右クリックイベントを設定
    elements[i].oncontextmenu = async function (event) {
      event.preventDefault();

      try {
        // 現在のカウンタ値を取得
        let successNum = getSuccessNum(event.target)

        // カウンタを増加
        successNum += 1;
        if (successNum > 2) successNum = 0;

        // 色を更新
        setBackground(event.target, successNum)

        // 更新されたカウンタ値を保存
        const text = event.target.textContent;
        const dataBlockId = findParentDataBlockId(event.target);
        const storageId = `${dataBlockId}_${text}`
        await chrome.storage.local.set({ [storageId]: successNum });

        // console.log(storageId + " is " + successNum);
      } catch (error) {
        console.error("Error accessing chrome storage:", error);
      }

      return false;
    };
  }
}

// ===============================================
// モードの起動
// ===============================================
async function activate() {
  // URL判定
  const currentUrl = window.location.href;
  if (!currentUrl.includes('notion.site')) return;

  const result = await chrome.storage.local.get("mode");
  let mode = result.mode;
  if(!mode){
    mode = "memorize"
  }
  console.log(`Notion 赤シート activated! Mode: ${mode}`);

  if (mode == "printer") {
    activatePrinterMode()
  } else if (mode == "normal") {
    activateNormalMode()
  } else {
    activateMemorizeMode();
  }
}

let intervalId = null;

function activateMemorizeMode() {
  document.body.classList.remove('printer');
  document.body.classList.remove('normal');
  document.body.classList.add('memorize');

  initializeElements();

  intervalId = setInterval(function () {
    let elements = selectTargetElements();
    if (elements.length > 0) {
      initializeElements(elements);
    }
  }, 1000)
}

function activatePrinterMode() {
  document.body.classList.remove('memorize');
  document.body.classList.remove('normal');
  document.body.classList.add('printer');

  resetElements();
}

function activateNormalMode() {
  document.body.classList.remove('memorize');
  document.body.classList.remove('printer');
  document.body.classList.add('normal');

  resetElements();
}

// ===============================================
// 実行のトリガーを指定する
// ===============================================

// 要素が表示されるまで待機する関数
function setActivateTimer() {
  const interval = setInterval(async () => {
    // Notionページの読み込み完了を判定する
    let elements = selectTargetElements();
    const progressBarElement = document.querySelector('[role="progressbar"]');
    if (elements.length > 0 && progressBarElement == null) {
      clearInterval(interval);
      activate();
    }
  }, 100); // 100ミリ秒ごとにチェック
}

setActivateTimer();
