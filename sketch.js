let classroomImage; // 宣告教室背景圖片變數。
let idleSprite; // 宣告角色站立精靈圖變數。
let runSprite; // 宣告角色跑步精靈圖變數。
let character2StandSprite; // 宣告角色2站立精靈圖變數。
let character2HitSprite; // 宣告角色2被擊中精靈圖變數。
let character2KickSprite; // 宣告角色2踢擊精靈圖變數。
let characterX; // 宣告角色目前的水平位置。
let runStartFrame = 0; // 記錄本次跑步動畫開始的影格。
let wasMoving = false; // 記錄上一個影格角色是否正在移動。
let quizVisible = false; // 記錄選擇題視窗目前是否顯示。
let interactionLocked = false; // 避免角色仍在附近時重複觸發題目。
let character2Reaction = ""; // 記錄角色2目前的答題反應動畫。
let reactionStartFrame = 0; // 記錄角色2反應動畫開始的影格。
let currentQuestionIndex = -1; // 記錄目前題庫的題目索引。
const idleFrameCount = 14; // 設定站立精靈圖的總格數。
const runFrameCount = 12; // 設定跑步精靈圖的總格數。
const character2StandFrameCount = 11; // 設定角色2站立精靈圖的總格數。
const character2HitFrameCount = 11; // 設定角色2被擊中精靈圖的總格數。
const character2KickFrameCount = 9; // 設定角色2踢擊精靈圖的總格數。
const frameDelay = 6; // 設定每格動畫維持的繪圖影格數。
const runSpeed = 240; // 設定角色每秒移動的像素數。
const characterScale = 1.5; // 設定角色圖片放大為原尺寸的一點五倍。
const bottomMargin = 20; // 設定角色腳底與畫面底部保留的距離。
const character2StandFrameWidth = 55; // 設定角色2站立圖每格實際角色寬度。
const interactionDistance = 125; // 設定角色1接近角色2時觸發題目的距離。
const retreatDistance = 180; // 設定角色1離開到此距離後重設互動狀態。
const englishQuestions = [ // 建立輪流出現的國中程度英文選擇題。
  { prompt: "She ___ to school every day.", options: ["go", "goes", "going", "went"], answer: 1 }, // 練習第三人稱單數現在式。
  { prompt: "They ___ TV when I called.", options: ["watch", "watched", "were watching", "are watching"], answer: 2 }, // 練習過去進行式。
  { prompt: "I have lived here ___ 2020.", options: ["for", "since", "at", "by"], answer: 1 }, // 練習現在完成式的時間用法。
  { prompt: "Could you ___ me your dictionary?", options: ["borrow", "lend", "keep", "bring"], answer: 1 }, // 練習lend與borrow的用法。
  { prompt: "My brother is ___ than me.", options: ["tall", "taller", "tallest", "more tall"], answer: 1 }, // 練習形容詞比較級。
  { prompt: "We ___ visit Grandma next weekend.", options: ["will", "did", "are", "were"], answer: 0 }, // 練習未來式助動詞。
  { prompt: "There isn't ___ milk left.", options: ["many", "few", "much", "several"], answer: 2 }, // 練習不可數名詞的量詞。
  { prompt: "If it rains tomorrow, we ___ at home.", options: ["stay", "stayed", "will stay", "staying"], answer: 2 }, // 練習第一類條件句。
]; // 結束英文選擇題題庫。

function preload() { // 在畫面建立前載入所有圖片素材。
  classroomImage = loadImage("classroom.png"); // 載入教室背景圖片。
  idleSprite = loadImage("金髮男/stop.png"); // 載入角色站立精靈圖。
  runSprite = loadImage("金髮男/RUN.png"); // 載入角色跑步精靈圖。
  character2StandSprite = loadImage("跆拳道男/stand.png"); // 載入角色2站立精靈圖。
  character2HitSprite = loadImage("跆拳道男/be hit.png"); // 載入角色2被擊中精靈圖。
  character2KickSprite = loadImage("跆拳道男/kick.png"); // 載入角色2踢擊精靈圖。
} // 結束圖片載入函式。

function setup() { // 設定畫布與角色的初始狀態。
  createCanvas(windowWidth, windowHeight); // 建立符合瀏覽器視窗大小的畫布。
  imageMode(CENTER); // 讓圖片座標代表圖片中心點。
  frameRate(60); // 將繪圖更新率設定為每秒六十格。
  characterX = width * 2 / 3; // 將角色1初始水平位置設在畫面三分之二處。
} // 結束畫面設定函式。

function draw() { // 每個繪圖影格更新背景與角色動畫。
  const scaleFactor = max(width / classroomImage.width, height / classroomImage.height); // 計算背景填滿畫面所需的縮放比例。
  const sourceWidth = width / scaleFactor; // 計算背景圖片需要裁切的來源寬度。
  const sourceHeight = height / scaleFactor; // 計算背景圖片需要裁切的來源高度。
  const sourceX = (classroomImage.width - sourceWidth) / 2; // 計算背景圖片水平置中裁切的起點。
  const sourceY = (classroomImage.height - sourceHeight) / 2; // 計算背景圖片垂直置中裁切的起點。
  image(classroomImage, width / 2, height / 2, width, height, sourceX, sourceY, sourceWidth, sourceHeight); // 裁切並繪製填滿畫面的教室背景。

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查目前是否按住鍵盤右方向鍵。
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查目前是否按住鍵盤左方向鍵。
  const direction = quizVisible ? 0 : movingRight ? 1 : movingLeft ? -1 : 0; // 題目顯示時暫停角色1移動，其餘時間依方向鍵決定方向。
  const isMoving = direction !== 0; // 判斷角色目前是否正在移動。
  if (isMoving && !wasMoving) { // 偵測角色從停止轉為移動的時刻。
    runStartFrame = frameCount; // 將這次跑步動畫的起始影格設為目前影格。
  } // 結束跑步動畫起始判斷。
  wasMoving = isMoving; // 記錄目前移動狀態供下一個影格判斷使用。

  if (isMoving) { // 只有按住方向鍵時才更新角色位置。
    characterX += direction * runSpeed * deltaTime / 1000; // 依經過時間和移動方向更新角色水平位置。
    characterX = constrain(characterX, 0, width); // 將角色位置限制在畫布左右範圍內。
  } // 結束角色移動判斷。

  const character2X = width / 3; // 將角色2水平位置設在畫面三分之一處。
  const distanceToCharacter2 = abs(characterX - character2X); // 計算兩個角色之間的水平距離。
  if (character2Reaction !== "" && distanceToCharacter2 > retreatDistance) { // 判斷角色1是否已離開角色2足夠遠。
    character2Reaction = ""; // 清除角色2答題後的反應動畫。
    interactionLocked = false; // 允許角色1下次接近時再次觸發題目。
  } // 結束角色遠離判斷。
  if (!quizVisible && character2Reaction === "" && !interactionLocked && distanceToCharacter2 <= interactionDistance) { // 判斷角色1是否首次接近角色2。
    currentQuestionIndex = (currentQuestionIndex + 1) % englishQuestions.length; // 每次接近時切換到題庫中的下一題。
    quizVisible = true; // 顯示選擇題視窗。
    interactionLocked = true; // 鎖定本次互動直到角色1離開。
  } // 結束接近觸發判斷。

  const animationFrame = floor(frameCount / frameDelay); // 根據影格數計算目前播放到的動畫格。

  drawCharacter1(isMoving, direction, animationFrame); // 繪製角色1目前的站立或跑步動畫。
  drawCharacter2(animationFrame); // 繪製角色2目前的站立或答題反應動畫。
  if (quizVisible) { // 角色接近時才顯示選擇題。
    drawQuizPanel(); // 繪製含粉紅底色與花朵圖案的選擇題視窗。
  } // 結束題目視窗顯示判斷。
} // 結束每格畫面更新函式。

function drawCharacter1(isMoving, direction, animationFrame) { // 依角色1的移動狀態繪製對應精靈格。
  if (isMoving) { // 移動時改為繪製跑步精靈圖。
    const frameWidth = runSprite.width / runFrameCount; // 計算跑步精靈圖中每格的寬度。
    const runAnimationFrame = floor((frameCount - runStartFrame) / frameDelay); // 計算本次跑步已播放的動畫格數。
    const frameIndex = runAnimationFrame < runFrameCount ? runAnimationFrame : 5 + (runAnimationFrame - runFrameCount) % 7; // 先播放第1到第12格一次，再循環播放第6到第12格。
    push(); // 暫存目前的座標與縮放設定。
    translate(characterX, height - runSprite.height * characterScale / 2 - bottomMargin); // 將繪圖原點設在跑步圖片底部靠近畫面底部的位置。
    if (direction < 0) { // 角色往左移動時需要水平翻轉圖片。
      scale(-1, 1); // 將角色圖片左右翻轉以面向左方。
    } // 結束角色朝向判斷。
    image(runSprite, 0, 0, frameWidth * characterScale, runSprite.height * characterScale, frameIndex * frameWidth, 0, frameWidth, runSprite.height); // 依設定倍率繪製目前的跑步動畫格。
    pop(); // 還原暫存前的座標與縮放設定。
  } else { // 沒有按方向鍵時播放站立動畫。
    const frameWidth = idleSprite.width / idleFrameCount; // 計算站立精靈圖中每格的寬度。
    const frameIndex = animationFrame % idleFrameCount; // 讓站立動畫在十四格之間循環。
    const characterY = height - idleSprite.height * characterScale / 2 - bottomMargin; // 計算站立圖片底部靠近畫面底部時的中心位置。
    image(idleSprite, characterX, characterY, frameWidth * characterScale, idleSprite.height * characterScale, frameIndex * frameWidth, 0, frameWidth, idleSprite.height); // 依設定倍率繪製目前的站立動畫格。
  } // 結束角色1站立動畫判斷。
} // 結束角色1繪圖函式。

function drawCharacter2(animationFrame) { // 根據答題狀態選擇角色2精靈圖並繪製一格。
  let sprite = character2StandSprite; // 預設使用角色2站立精靈圖。
  let frameCountForSprite = character2StandFrameCount; // 預設使用角色2站立動畫格數。
  let frameIndex = animationFrame % character2StandFrameCount; // 循環播放角色2站立動畫。
  let sourceFrameWidth = character2StandSprite.width / character2StandFrameCount; // 計算站立圖每格的水平間距。
  let displayFrameWidth = character2StandFrameWidth; // 設定站立角色本體以55像素原尺寸顯示。
  if (character2Reaction === "hit") { // 答對時選擇被擊中精靈圖。
    sprite = character2HitSprite; // 切換到角色2被擊中圖片。
    frameCountForSprite = character2HitFrameCount; // 使用被擊中動畫的格數。
    sourceFrameWidth = sprite.width / frameCountForSprite; // 計算被擊中精靈圖每格寬度。
    displayFrameWidth = sourceFrameWidth; // 以原始尺寸顯示被擊中動畫。
    frameIndex = floor((frameCount - reactionStartFrame) / frameDelay) % frameCountForSprite; // 循環播放被擊中動畫各格。
  } else if (character2Reaction === "kick") { // 答錯時選擇踢擊精靈圖。
    sprite = character2KickSprite; // 切換到角色2踢擊圖片。
    frameCountForSprite = character2KickFrameCount; // 使用踢擊動畫的格數。
    sourceFrameWidth = sprite.width / frameCountForSprite; // 計算踢擊精靈圖每格寬度。
    displayFrameWidth = sourceFrameWidth; // 以原始尺寸顯示踢擊動畫。
    frameIndex = floor((frameCount - reactionStartFrame) / frameDelay) % frameCountForSprite; // 循環播放踢擊動畫各格。
  } // 結束角色2反應圖片選擇。
  const displaySourceWidth = character2Reaction === "" ? character2StandFrameWidth : sourceFrameWidth; // 取得目前動畫格實際要裁切的來源寬度。
    const character2Scale = idleSprite.height * characterScale * 0.9 / sprite.height; // 將角色2縮至角色1站立高度的百分之九十。
  displayFrameWidth = displaySourceWidth * character2Scale; // 將角色2目前動畫格寬度等比例放大。
  const character2Y = height - sprite.height * character2Scale / 2 - bottomMargin; // 依放大後高度計算角色2圖片底部靠近畫面底部時的中心位置。
    const previousSmoothing = drawingContext.imageSmoothingEnabled; // 記錄繪圖前的圖片平滑設定。
    drawingContext.imageSmoothingEnabled = false; // 關閉角色2精靈圖的平滑插值以保持像素清晰。
  image(sprite, width / 3, character2Y, displayFrameWidth, sprite.height * character2Scale, frameIndex * sourceFrameWidth, 0, displaySourceWidth, sprite.height); // 以角色1站立高度為基準繪製放大的角色2動畫格。
    drawingContext.imageSmoothingEnabled = previousSmoothing; // 還原繪製前的圖片平滑設定。
} // 結束角色2繪圖函式。

function drawFlower(centerX, centerY, flowerSize, flowerAlpha) { // 在指定位置繪製一朵半透明粉色花朵。
  push(); // 暫存目前的繪圖狀態。
  translate(centerX, centerY); // 將原點移至花朵中心。
  noStroke(); // 移除花瓣與花心的外框。
  fill(255, 105, 180, flowerAlpha); // 設定花瓣的粉紅色與透明度。
  for (let petal = 0; petal < 5; petal++) { // 依序繪製五片花瓣。
    ellipse(0, -flowerSize * 0.42, flowerSize * 0.48, flowerSize * 0.72); // 繪製一片橢圓形花瓣。
    rotate(TWO_PI / 5); // 將下一片花瓣旋轉至花朵周圍。
  } // 結束花瓣繪製迴圈。
  fill(255, 220, 80, flowerAlpha); // 設定花朵中心的黃色與透明度。
  ellipse(0, 0, flowerSize * 0.36, flowerSize * 0.36); // 繪製花朵中央花心。
  pop(); // 還原暫存前的繪圖狀態。
} // 結束花朵繪圖函式。

function drawQuizPanel() { // 在畫布中央繪製粉紅花朵選擇題視窗。
  const panelWidth = width / 4; // 將題目視窗寬度設定為畫面寬度四分之一。
  const panelHeight = height / 4; // 將題目視窗高度設定為畫面高度四分之一。
  const panelX = (width - panelWidth) / 2; // 計算題目視窗水平置中的左側座標。
  const panelY = (height - panelHeight) / 2; // 計算題目視窗垂直置中的上方座標。
    const compactLayout = panelWidth < 280; // 判斷窄畫面是否需要改用單欄答案按鈕。
    const optionWidth = panelWidth * (compactLayout ? 0.84 : 0.4); // 依畫面寬度設定答案按鈕寬度。
    const optionHeight = max(compactLayout ? 22 : 24, min(compactLayout ? 28 : 34, panelHeight * (compactLayout ? 0.12 : 0.19))); // 依題目視窗大小限制答案按鈕高度。
    const optionX = compactLayout ? [panelX + panelWidth * 0.08] : [panelX + panelWidth * 0.08, panelX + panelWidth * 0.52]; // 計算單欄或雙欄答案按鈕的水平座標。
    const optionY = compactLayout ? Array.from({ length: 4 }, (_, row) => panelY + panelHeight * (0.46 + row * 0.13)) : [panelY + panelHeight * 0.53, panelY + panelHeight * 0.74]; // 計算單欄或雙欄答案按鈕的垂直座標。
  rectMode(CORNER); // 使用左上角座標繪製題目視窗與按鈕。
  noStroke(); // 移除題目視窗底色的外框。
  fill(255, 165, 195, 204); // 設定題目視窗粉紅底色為約百分之八十不透明。
  rect(panelX, panelY, panelWidth, panelHeight, 14); // 繪製四分之一視窗大小的粉紅題目框。
  noStroke(); // 移除花朵圖案的外框。
  for (let flowerY = panelY + 18; flowerY < panelY + panelHeight - 8; flowerY += 34) { // 逐列排列題目視窗中的花朵。
    for (let flowerX = panelX + 18; flowerX < panelX + panelWidth - 8; flowerX += 36) { // 逐欄排列題目視窗中的花朵。
      drawFlower(flowerX, flowerY, 15, 90); // 在題目背景中繪製半透明粉色花朵。
    } // 結束花朵水平排列迴圈。
  } // 結束花朵垂直排列迴圈。
  noFill(); // 讓接下來繪製的題目框外框保持透明。
  stroke(255, 245, 250, 230); // 設定題目視窗的淡粉白外框。
  strokeWeight(2); // 設定題目視窗外框粗細。
  rect(panelX, panelY, panelWidth, panelHeight, 14); // 在花朵圖案上方繪製題目框外框。
  noStroke(); // 移除答案按鈕文字區域的外框。
  fill(120, 35, 75); // 設定題目標題文字顏色。
  textAlign(CENTER, CENTER); // 將題目文字水平與垂直置中。
  textSize(max(12, min(18, panelWidth * 0.06))); // 依題目框寬度調整標題文字大小。
  text("英文挑戰", width / 2, panelY + panelHeight * 0.14); // 顯示英文選擇題標題。
  fill(75, 35, 55); // 設定英文題目文字顏色。
  const currentQuestion = englishQuestions[currentQuestionIndex]; // 取得目前要顯示的英文題目與選項。
  textSize(max(12, min(18, panelWidth * 0.055))); // 依題目框寬度調整英文題目文字大小。
  const promptTop = panelY + panelHeight * (compactLayout ? 0.24 : 0.24); // 將題幹置於標題下方與答案上方。
  const promptHeight = panelHeight * (compactLayout ? 0.18 : 0.22); // 限制題幹高度並保留自動換行空間。
  text(currentQuestion.prompt, panelX + panelWidth * 0.06, promptTop, panelWidth * 0.88, promptHeight); // 在題目框內置中顯示題幹且不與答案重疊。
  const optionLabels = currentQuestion.options.map((answer, index) => String.fromCharCode(65 + index) + ". " + answer); // 為四個英文答案加上選項代號。
  textSize(compactLayout ? max(9, min(12, panelWidth * 0.1)) : max(11, min(15, panelWidth * 0.05))); // 依單欄或雙欄版面調整答案文字大小。
  for (let option = 0; option < optionLabels.length; option++) { // 逐一繪製四個答案按鈕。
    const column = compactLayout ? 0 : option % 2; // 計算答案按鈕所在的欄位。
    const row = compactLayout ? option : floor(option / 2); // 計算答案按鈕所在的列。
    fill(255, 245, 250, 235); // 設定答案按鈕的淡粉白底色。
    stroke(220, 95, 145, 210); // 設定答案按鈕的玫瑰粉外框。
    strokeWeight(1); // 設定答案按鈕外框粗細。
    rect(optionX[column], optionY[row], optionWidth, optionHeight, 7); // 繪製可點選的答案按鈕。
    noStroke(); // 移除答案文字外框。
    fill(90, 35, 60); // 設定答案文字顏色。
    text(optionLabels[option], optionX[column] + optionWidth / 2, optionY[row] + optionHeight / 2); // 在答案按鈕中央顯示答案。
  } // 結束答案按鈕繪製迴圈。
} // 結束題目視窗繪圖函式。

function mousePressed() { // 偵測滑鼠點擊並判斷是否選取答案。
  if (!quizVisible) { // 題目未顯示時不處理答案點擊。
    return; // 結束滑鼠點擊處理。
  } // 結束題目顯示判斷。
  const panelWidth = width / 4; // 計算題目視窗寬度。
  const panelHeight = height / 4; // 計算題目視窗高度。
  const panelX = (width - panelWidth) / 2; // 計算題目視窗左側座標。
  const panelY = (height - panelHeight) / 2; // 計算題目視窗上方座標。
  const compactLayout = panelWidth < 280; // 判斷窄畫面是否使用單欄答案按鈕。
  const optionWidth = panelWidth * (compactLayout ? 0.84 : 0.4); // 依畫面寬度計算答案按鈕寬度。
  const optionHeight = max(compactLayout ? 22 : 24, min(compactLayout ? 28 : 34, panelHeight * (compactLayout ? 0.12 : 0.19))); // 依題目視窗大小計算答案按鈕高度。
  const optionX = compactLayout ? [panelX + panelWidth * 0.08] : [panelX + panelWidth * 0.08, panelX + panelWidth * 0.52]; // 計算單欄或雙欄答案按鈕的水平座標。
  const optionY = compactLayout ? Array.from({ length: 4 }, (_, row) => panelY + panelHeight * (0.46 + row * 0.13)) : [panelY + panelHeight * 0.53, panelY + panelHeight * 0.74]; // 計算單欄或雙欄答案按鈕的垂直座標。
  for (let option = 0; option < 4; option++) { // 逐一檢查滑鼠是否點中任一答案。
    const column = compactLayout ? 0 : option % 2; // 計算答案按鈕所在的欄位。
    const row = compactLayout ? option : floor(option / 2); // 計算答案按鈕所在的列。
    const insideButton = mouseX >= optionX[column] && mouseX <= optionX[column] + optionWidth && mouseY >= optionY[row] && mouseY <= optionY[row] + optionHeight; // 判斷滑鼠座標是否位於答案按鈕範圍內。
    if (insideButton) { // 點中答案按鈕時開始角色2反應。
      quizVisible = false; // 隱藏選擇題視窗。
      character2Reaction = option === englishQuestions[currentQuestionIndex].answer ? "hit" : "kick"; // 依目前題目的正確答案選擇角色2反應動畫。
      reactionStartFrame = frameCount; // 記錄角色2反應動畫的起始影格。
      return false; // 結束答案判斷並避免滑鼠預設行為。
    } // 結束按鈕命中判斷。
  } // 結束答案按鈕檢查迴圈。
} // 結束滑鼠點擊函式。

function windowResized() { // 瀏覽器視窗尺寸改變時重新調整畫布。
  resizeCanvas(windowWidth, windowHeight); // 將畫布調整成新的視窗大小。
  characterX = width * 2 / 3; // 視窗尺寸改變後將角色1重設在畫面三分之二處。
  quizVisible = false; // 視窗尺寸改變後關閉可能位置錯誤的題目視窗。
  interactionLocked = false; // 允許尺寸變更後重新觸發角色互動。
  character2Reaction = ""; // 將角色2恢復為站立動畫。
} // 結束視窗尺寸變更函式。

function keyPressed() { // 偵測按下按鍵時避免方向鍵捲動網頁。
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) { // 判斷按下的是否為左右方向鍵。
    return false; // 阻止瀏覽器執行方向鍵的預設捲動行為。
  } // 結束方向鍵判斷。
} // 結束按鍵事件函式。
