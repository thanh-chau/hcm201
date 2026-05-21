const TILE = {
  PATH: 0,
  ROCK: 1,
  QUESTION: 2,
  TREASURE: 3,
  LOCKED: 4
};

const LEVELS = [
  {
    name: "Bến cảng khát vọng",
    time: 95,
    map: [
      "P.#Q.#..",
      "..Q..#..",
      ".##..Q..",
      "Q.#..#..",
      ".##.Q#..",
      "..Q#.#..",
      ".#...Q..",
      ".Q#..#.T"
    ]
  },
  {
    name: "Con đường độc lập",
    time: 105,
    map: [
      "P.#.#..Q",
      "Q.Q.#.#.",
      ".##.Q..#",
      "Q..#.#..",
      "##Q..#..",
      "...#..Q.",
      ".#.#.#..",
      "..Q...#T"
    ]
  },
  {
    name: "Mốc son lịch sử",
    time: 115,
    map: [
      "P.#..#..",
      ".#Q..Q..",
      "..#.#...",
      "Q.Q..#..",
      "#Q#..Q#.",
      "..Q#.#..",
      ".#...#..",
      "..#..Q.T"
    ]
  }
];

const screens = {
  menu: document.querySelector("#menuScreen"),
  level: document.querySelector("#levelScreen"),
  game: document.querySelector("#gameScreen"),
  pause: document.querySelector("#pauseScreen"),
  victory: document.querySelector("#victoryScreen"),
  gameOver: document.querySelector("#gameOverScreen")
};

const els = {
  board: document.querySelector("#board"),
  levelList: document.querySelector("#levelList"),
  levelName: document.querySelector("#levelName"),
  answeredCount: document.querySelector("#answeredCount"),
  timer: document.querySelector("#timer"),
  score: document.querySelector("#score"),
  bestScore: document.querySelector("#bestScore"),
  messageBar: document.querySelector("#messageBar"),
  modal: document.querySelector("#questionModal"),
  questionText: document.querySelector("#questionText"),
  answers: document.querySelector("#answers"),
  victoryText: document.querySelector("#victoryText"),
  gameOverText: document.querySelector("#gameOverText"),
  soundBtn: document.querySelector("#soundBtn")
};

const state = {
  questions: [],
  currentLevel: 0,
  map: [],
  player: { row: 0, col: 0 },
  score: 0,
  answered: 0,
  timeLeft: 90,
  timerId: null,
  activeQuestion: null,
  activeQuestionTile: null,
  questionDeck: [],
  selectedAnswers: [],
  paused: false,
  sound: true,
  audio: null,
  musicTimer: null
};

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function parseMap(lines) {
  let start = { row: 0, col: 0 };
  const map = lines.map((line, row) => line.split("").map((char, col) => {
    if (char === "P") {
      start = { row, col };
      return TILE.PATH;
    }
    if (char === "#") return TILE.ROCK;
    if (char === "Q") return TILE.QUESTION;
    if (char === "T") return TILE.TREASURE;
    return TILE.PATH;
  }));
  return { map, start };
}

// Converts a designed map into tile data and checks that the treasure can be reached.
// Question tiles stay fixed so they work as deliberate gates, not random clutter.
function generateMap(lines) {
  const parsed = parseMap(lines);
  const isEightByEight = parsed.map.length === 8 && parsed.map.every(row => row.length === 8);
  if (!isEightByEight) {
    throw new Error("Level map must be 8x8.");
  }
  if (!canReachTreasureOnMap(parsed.map, parsed.start)) {
    throw new Error("Level map is blocked before the game starts.");
  }
  if (canReachTreasureOnMap(parsed.map, parsed.start, { blockQuestions: true })) {
    throw new Error("Level map must require at least one question gate.");
  }
  return parsed;
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function canReachTreasureOnMap(map, start, options = {}) {
  const queue = [{ ...start }];
  const seen = new Set([`${start.row},${start.col}`]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length) {
    const current = queue.shift();
    if (map[current.row][current.col] === TILE.TREASURE) return true;

    dirs.forEach(([dr, dc]) => {
      const nr = current.row + dr;
      const nc = current.col + dc;
      const key = `${nr},${nc}`;
      if (nr < 0 || nc < 0 || nr >= map.length || nc >= map[0].length || seen.has(key)) return;
      const tile = map[nr][nc];
      if (options.blockQuestions && tile === TILE.QUESTION) return;
      if (tile === TILE.ROCK || tile === TILE.LOCKED) return;
      seen.add(key);
      queue.push({ row: nr, col: nc });
    });
  }

  return false;
}

function randomQuestion() {
  if (state.questionDeck.length === 0) {
    state.questionDeck = shuffle([...state.questions]);
  }
  return state.questionDeck.pop();
}

function startLevel(index) {
  const level = LEVELS[index];
  const parsed = generateMap(level.map);
  state.currentLevel = index;
  state.map = parsed.map;
  state.player = parsed.start;
  state.score = index === 0 ? 0 : state.score;
  state.answered = 0;
  state.timeLeft = level.time;
  state.paused = false;
  state.activeQuestion = null;
  state.activeQuestionTile = null;
  state.questionDeck = shuffle([...state.questions]);
  state.selectedAnswers = [];
  showScreen("game");
  updateHud();
  renderBoard();
  startTimer();
  startMusic();
  setMessage("Tìm ô ? để mở đường tới dấu mốc độc lập.");
}

function updateHud() {
  els.levelName.textContent = `${state.currentLevel + 1} - ${LEVELS[state.currentLevel].name}`;
  els.answeredCount.textContent = state.answered;
  els.timer.textContent = state.timeLeft;
  els.score.textContent = state.score;
  els.bestScore.textContent = localStorage.getItem("treasureBestScore") || "0";
}

function renderBoard() {
  const size = state.map.length;
  els.board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  els.board.innerHTML = "";

  state.map.forEach((row, r) => {
    row.forEach((tile, c) => {
      const cell = document.createElement("div");
      cell.className = `tile ${tileClass(tile)}`;
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (state.player.row === r && state.player.col === c) {
        const player = document.createElement("div");
        player.className = "player";
        cell.appendChild(player);
      }

      els.board.appendChild(cell);
    });
  });
}

function tileClass(tile) {
  if (tile === TILE.ROCK) return "rock";
  if (tile === TILE.QUESTION) return "question";
  if (tile === TILE.TREASURE) return "treasure";
  if (tile === TILE.LOCKED) return "locked";
  return "path";
}

function movePlayer(dr, dc) {
  if (!screens.game.classList.contains("active") || state.activeQuestion || state.paused) return;

  const next = { row: state.player.row + dr, col: state.player.col + dc };
  if (!isInside(next.row, next.col)) return;

  const tile = state.map[next.row][next.col];
  if (tile === TILE.ROCK || tile === TILE.LOCKED) {
    wrongBump();
    return;
  }

  if (tile === TILE.QUESTION) {
    openQuestion(next);
    return;
  }

  state.player = next;
  animatePlayerWalk();
  renderBoard();

  if (tile === TILE.TREASURE) {
    winLevel();
  }
}

function isInside(row, col) {
  return row >= 0 && col >= 0 && row < state.map.length && col < state.map[0].length;
}

function openQuestion(tilePos) {
  state.activeQuestion = randomQuestion();
  state.activeQuestionTile = tilePos;
  state.selectedAnswers = [];
  els.questionText.textContent = state.activeQuestion.question;
  els.answers.innerHTML = "";

  const isMultiAnswer = Array.isArray(state.activeQuestion.correct);
  if (isMultiAnswer) {
    const hint = document.createElement("div");
    hint.className = "multi-hint";
    hint.textContent = "Câu này có nhiều đáp án đúng. Chọn đủ đáp án rồi bấm Xác nhận.";
    els.answers.appendChild(hint);
  }

  state.activeQuestion.answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
    btn.addEventListener("click", () => {
      if (isMultiAnswer) {
        toggleMultiAnswer(index, btn);
      } else {
        answerQuestion([index]);
      }
    });
    els.answers.appendChild(btn);
  });

  if (isMultiAnswer) {
    const submit = document.createElement("button");
    submit.className = "submit-answer";
    submit.textContent = "Xác nhận đáp án";
    submit.addEventListener("click", () => {
      if (state.selectedAnswers.length > 0) answerQuestion(state.selectedAnswers);
    });
    els.answers.appendChild(submit);
  }

  els.modal.classList.remove("hidden");
}

function toggleMultiAnswer(index, button) {
  if (state.selectedAnswers.includes(index)) {
    state.selectedAnswers = state.selectedAnswers.filter(item => item !== index);
    button.classList.remove("selected");
    return;
  }

  state.selectedAnswers.push(index);
  button.classList.add("selected");
}

function answerQuestion(selected) {
  if (!state.activeQuestion || !state.activeQuestionTile) return;

  const { row, col } = state.activeQuestionTile;
  const correctAnswers = Array.isArray(state.activeQuestion.correct)
    ? state.activeQuestion.correct
    : [state.activeQuestion.correct];
  const normalizedSelected = [...selected].sort((a, b) => a - b);
  const normalizedCorrect = [...correctAnswers].sort((a, b) => a - b);
  const correct =
    normalizedSelected.length === normalizedCorrect.length &&
    normalizedSelected.every((answer, index) => answer === normalizedCorrect[index]);
  els.modal.classList.add("hidden");

  if (correct) {
    state.map[row][col] = TILE.PATH;
    state.player = { row, col };
    state.score += 100 + state.timeLeft;
    state.answered += 1;
    setMessage("Đúng rồi! Đường đã mở.");
    playSound("correct");
    sparkleBurst();
  } else {
    state.map[row][col] = TILE.LOCKED;
    setMessage("Sai mất rồi! Ô này đã bị khóa.");
    playSound("wrong");
    document.body.classList.add("shake");
    setTimeout(() => document.body.classList.remove("shake"), 280);
  }

  state.activeQuestion = null;
  state.activeQuestionTile = null;
  state.selectedAnswers = [];
  updateHud();
  renderBoard();

  if (!canReachTreasure()) {
    loseGame("Tất cả đường tới dấu mốc cuối màn đã bị chặn.");
  }
}

function canReachTreasure() {
  const queue = [{ ...state.player }];
  const seen = new Set([`${state.player.row},${state.player.col}`]);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length) {
    const current = queue.shift();
    const tile = state.map[current.row][current.col];
    if (tile === TILE.TREASURE) return true;

    dirs.forEach(([dr, dc]) => {
      const nr = current.row + dr;
      const nc = current.col + dc;
      const key = `${nr},${nc}`;
      if (!isInside(nr, nc) || seen.has(key)) return;
      const nextTile = state.map[nr][nc];
      if (nextTile === TILE.ROCK || nextTile === TILE.LOCKED) return;
      seen.add(key);
      queue.push({ row: nr, col: nc });
    });
  }

  return false;
}

function winLevel() {
  stopTimer();
  playSound("treasure");
  sparkleBurst(36);
  saveBestScore();
  els.victoryText.textContent = `Bạn đã hoàn thành hành trình với ${state.score} điểm!`;
  document.querySelector("#nextLevelBtn").style.display =
    state.currentLevel < LEVELS.length - 1 ? "inline-block" : "none";
  showScreen("victory");
}

function loseGame(text) {
  stopTimer();
  playSound("wrong");
  els.gameOverText.textContent = text;
  showScreen("gameOver");
}

function startTimer() {
  stopTimer();
  state.timerId = setInterval(() => {
    if (state.paused || state.activeQuestion) return;
    state.timeLeft -= 1;
    updateHud();
    if (state.timeLeft <= 0) loseGame("Hết thời gian hoàn thành hành trình.");
  }, 1000);
}

function stopTimer() {
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = null;
}

function setMessage(text) {
  els.messageBar.textContent = text;
}

function animatePlayerWalk() {
  const player = document.querySelector(".player");
  if (!player) return;
  player.classList.add("walk");
  setTimeout(() => player.classList.remove("walk"), 220);
}

function wrongBump() {
  playSound("wrong");
  setMessage("Ô này bị chắn rồi, thử đường khác nhé.");
  els.board.classList.add("shake");
  setTimeout(() => els.board.classList.remove("shake"), 280);
}

function sparkleBurst(count = 18) {
  for (let i = 0; i < count; i += 1) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.textContent = ["✨", "⭐", "💛", "💎"][i % 4];
    sparkle.style.left = `${50 + (Math.random() * 20 - 10)}vw`;
    sparkle.style.top = `${45 + (Math.random() * 20 - 10)}vh`;
    sparkle.style.setProperty("--x", `${Math.random() * 240 - 120}px`);
    sparkle.style.setProperty("--y", `${Math.random() * -180 - 60}px`);
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 700);
  }
}

function saveBestScore() {
  const best = Number(localStorage.getItem("treasureBestScore") || "0");
  if (state.score > best) {
    localStorage.setItem("treasureBestScore", String(state.score));
  }
  updateHud();
}

function setupLevels() {
  els.levelList.innerHTML = "";
  LEVELS.forEach((level, index) => {
    const btn = document.createElement("button");
    btn.className = "level-card";
    btn.textContent = `Màn ${index + 1}: ${level.name}`;
    btn.addEventListener("click", () => startLevel(index));
    els.levelList.appendChild(btn);
  });
}

function pauseGame() {
  state.paused = true;
  showScreen("pause");
}

function resumeGame() {
  state.paused = false;
  showScreen("game");
}

function backToMenu() {
  stopTimer();
  state.paused = false;
  stopMusic();
  showScreen("menu");
  updateHud();
}

// Small Web Audio sound system. It avoids external mp3 dependencies.
function getAudio() {
  if (!state.audio) {
    state.audio = new (window.AudioContext || window.webkitAudioContext)();
  }
  return state.audio;
}

function playTone(freq, duration, type = "sine", volume = 0.08) {
  if (!state.sound) return;
  const audio = getAudio();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.value = freq;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  oscillator.stop(audio.currentTime + duration);
}

function playSound(name) {
  if (name === "correct") {
    playTone(660, 0.11, "triangle");
    setTimeout(() => playTone(880, 0.14, "triangle"), 95);
  }
  if (name === "wrong") {
    playTone(180, 0.18, "sawtooth", 0.06);
  }
  if (name === "treasure") {
    [523, 659, 784, 1046].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.18, "triangle", 0.07), i * 120);
    });
  }
}

function startMusic() {
  stopMusic();
  if (!state.sound) return;
  const audio = getAudio();
  if (audio.state === "suspended") audio.resume();
  const melody = [392, 440, 494, 523, 494, 440];
  let step = 0;
  state.musicTimer = setInterval(() => {
    playTone(melody[step % melody.length], 0.16, "sine", 0.025);
    step += 1;
  }, 560);
}

function stopMusic() {
  if (state.musicTimer) clearInterval(state.musicTimer);
  state.musicTimer = null;
}

function bindEvents() {
  document.querySelector("#playBtn").addEventListener("click", () => startLevel(0));
  document.querySelector("#levelBtn").addEventListener("click", () => showScreen("level"));
  document.querySelector("#pauseBtn").addEventListener("click", pauseGame);
  document.querySelector("#resumeBtn").addEventListener("click", resumeGame);
  document.querySelector("#retryBtn").addEventListener("click", () => startLevel(state.currentLevel));
  document.querySelector("#nextLevelBtn").addEventListener("click", () => startLevel(state.currentLevel + 1));
  document.querySelectorAll(".back-menu").forEach(btn => btn.addEventListener("click", backToMenu));
  els.soundBtn.addEventListener("click", () => {
    state.sound = !state.sound;
    els.soundBtn.textContent = state.sound ? "🔊" : "🔇";
    if (state.sound && screens.game.classList.contains("active")) startMusic();
    if (!state.sound) stopMusic();
  });

  window.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
    }
    if (key === "w" || key === "arrowup") movePlayer(-1, 0);
    if (key === "s" || key === "arrowdown") movePlayer(1, 0);
    if (key === "a" || key === "arrowleft") movePlayer(0, -1);
    if (key === "d" || key === "arrowright") movePlayer(0, 1);
    if (key === "escape" && screens.game.classList.contains("active")) pauseGame();
  });
}

async function init() {
  try {
    const response = await fetch("questions.json");
    state.questions = await response.json();
  } catch {
    state.questions = [
      { question: "5 + 5 bằng bao nhiêu?", answers: ["8", "9", "10", "11"], correct: 2 }
    ];
  }
  setupLevels();
  bindEvents();
  updateHud();
  showScreen("menu");
}

init();
