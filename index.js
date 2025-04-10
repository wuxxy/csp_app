// @ts-nocheck
// Variables
let timeSelected = 5;
let attempts = [];

let currentlyPlaying = 0;
let timer;
let tree;
let char_index = 0;
let word_index = 0;
let typed = [];
let incorrectly_typed = [];
let wrong_chars = 0;

const DEBUG_MODE = true;
function debugLog(...args) {
  if (DEBUG_MODE) {
    console.debug("[DEBUG]", ...args);
  }
}

// Generated using ChatGPT
const typingTexts = [
  `It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness. It was the epoch of belief, it was the epoch of incredulity. We had everything before us, we had nothing before us.
  
  The time was so much like the present that some of its noisiest authorities insisted on it being received, for good or for evil, in the superlative degree of comparison only.`,

  `There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning, but since dinner the cold winter wind had brought with it clouds so somber and a rain so penetrating that further outdoor exercise was now out of the question.
  
  I was glad of it. I never liked long walks, especially on chilly afternoons. Dull and drizzling weather made my thoughts more vivid.`,

  `He was an old man who fished alone in a skiff in the Gulf Stream, and he had gone eighty-four days now without taking a fish. In the first forty days a boy had been with him. But after forty days without a fish, the boy's parents had told him the old man was definitely and finally unlucky.
  
  So the boy had gone at their orders in another boat which caught three good fish the first week. It made the boy sad to see the old man come in each day with his skiff empty.`,

  `There is no charm equal to tenderness of heart. Some people think it is weak to be kind, to show care or softness. But kindness is not weakness. It is strength wrapped in gentleness.
  
  When someone is gentle with another, especially when it is undeserved, it reveals character. In silence and restraint there is a kind of nobility.`,

  `I am no bird, and no net ensnares me. I am a free human being with an independent will. That will is as strong as yours, and it shall not be bent or broken by the expectations of others.
  
  You think I have no feelings because I am quiet. But I do feel, and deeply. I keep them beneath the surface, because I choose reason over chaos.`,

  `Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, I thought I would sail about a little and see the watery part of the world.
  
  Whenever I find myself growing grim about the mouth, whenever it is a damp, drizzly November in my soul, then I account it high time to get to sea as soon as I can.`,
];
// Generated using ChatGPT
const disallowedCodes = [
  "ShiftLeft",
  "ShiftRight",
  "Shift",
  "Control",
  "Alt",
  "ControlLeft",
  "ControlRight",
  "AltLeft",
  "AltRight",
  "MetaLeft",
  "MetaRight", // Command key on Mac or Windows key on Windows
  "CapsLock",
  "Tab",
  "Enter",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Insert",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "ContextMenu",
  "Pause",
  "NumLock",
  "ScrollLock",
  "PrintScreen",
  "Meta",
];

// Document Elements
const timer_label = document.getElementById("timer-label");
const timer_bar = document.getElementById("timer-bar");
const typewriter = document.getElementById("typewriter");

const stats_accuracy = document.getElementById("stats-accuracy");
const stats_wpm = document.getElementById("stats-wpm");
const stats_time = document.getElementById("stats-time");
let { words, characterTree } = loadText();

// Event Listeners
document.addEventListener("keydown", start);
document.addEventListener("keydown", handleChar);

function restart() {
  currentlyPlaying = 0;
  timer = 0;
  tree = null;
  char_index = 0;
  word_index = 0;
  typed = [];
  wrong_chars = 0;
  const reloadText = loadText();
  words = reloadText.words;
  characterTree = reloadText.characterTree;
}

function start({ key: key_pressed }) {
  if (disallowedCodes.includes(key_pressed)) return;
  if (currentlyPlaying) return;
  document.getElementById("start-hint")?.classList.add("hiddenn");

  currentlyPlaying = 1;
  timer = timeSelected;

  const interval = setInterval(() => {
    timer--;

    if (timer <= 0) {
      clearInterval(interval);
      timer_label.textContent = "0s left";
      timer_bar.style.width = "0%";
      gameOver();
      return;
    }

    const time_elapsed = timeSelected - timer;
    stats_wpm.innerText = Math.round(calculateWPM(typed.length, time_elapsed));
    stats_time.innerText = time_elapsed + "seconds";

    timer_label.textContent = `${timer}s left`;
    const progress = (timer / timeSelected) * 100;
    timer_bar.style.width = `${progress}%`;
  }, 1000);
}

function loadText() {
  document.getElementById("start-hint")?.classList.remove("hiddenn");
  const pickedText =
    typingTexts[Math.floor(Math.random() * typingTexts.length)];

  const words = pickedText.split(" ");
  let characterTree = [];
  words.forEach((word) => {
    characterTree.push([...word.split(""), " "]);
  });

  debugLog("Character Tree:", characterTree);
  tree = characterTree;
  typewriter.innerHTML = "";
  let typewriterHTML = "";
  let charLength = 0;

  for (let w = 0; w < characterTree.length; w++) {
    typewriterHTML += `<span id="typewriter-word-${w}">`;
    let whitespace = false;
    for (let c = 0; c < characterTree[w].length; c++) {
      debugLog("Char:", characterTree[w][c]);
      charLength++;
      if (characterTree[w][c] === " ") {
        whitespace = true;
      } else {
        typewriterHTML += `<span class="pointer-events-none" id="typewriter-char-${charLength}">${characterTree[w][c]}</span>`;
      }
    }
    typewriterHTML += `</span>`;
    if (whitespace) {
      typewriterHTML += `<span class="pointer-events-none" id="typewriter-char-${charLength}"> </span>`;
    }
  }
  typewriterHTML += `<div id="cursor" class="cursor"></div>`;
  typewriterHTML += `<div id="start-hint" class="start-hint">Start typing to begin</div>`;
  typewriter.innerHTML = typewriterHTML;
  document.getElementById(`typewriter-char-1`).classList.add("char_index");
  updateCursorPosition();

  return { words, characterTree };
}

function get_typewriter_char(i) {
  return document.getElementById(`typewriter-char-${i}`);
}

function handleChar(e) {
  if (currentlyPlaying != 1) return;

  const current_typewriter_char = get_typewriter_char(char_index + 1);
  const key_pressed = e.key;
  let pressedSpace;

  if (disallowedCodes.includes(key_pressed)) return;

  if (key_pressed == "Backspace" || key_pressed == "Delete") {
    if (get_typewriter_char(char_index).innerText == " " && word_index > 0) {
      word_index--;
    }
    if (char_index > 0) {
      typed.splice(char_index - 1, 1);
    }

    if (char_index > 0) moveCharIndex(-1);

    if (current_typewriter_char.classList.contains("wrong-char")) {
      current_typewriter_char.classList.remove("wrong-char");
      wrong_chars--;
    }
    current_typewriter_char.classList.remove("correct-char");
    return;
  } else if (key_pressed == " ") {
    debugLog("== SPACE ==");
    pressedSpace = true;
    if (current_typewriter_char == " ") {
      debugLog("MOVE WORD INDEX");
      word_index++;
    }
    moveCharIndex(1);
  } else {
    typed.push(key_pressed);
    moveCharIndex(1);
  }

  debugLog("CURRENT CHAR SHOULD BE:", current_typewriter_char.innerText);
  if (
    current_typewriter_char.innerText == key_pressed ||
    (pressedSpace && !current_typewriter_char)
  ) {
    current_typewriter_char.classList.add("correct-char");
    if (current_typewriter_char.classList.contains("wrong-char")) {
      current_typewriter_char.classList.remove("wrong-char");
      wrong_chars--;
    }
  } else {
    wrong_chars++;
    incorrectly_typed.push({
      pressed: key_pressed,
      correct: current_typewriter_char.innerText,
      at: char_index,
    });
    current_typewriter_char.classList.add("wrong-char");
    current_typewriter_char.classList.remove("correct-char");
  }

  debugLog(
    "LENGTH OF TYPE:",
    typed.length,
    "LAST LETTER TYPED:",
    typed[typed.length - 1]
  );

  stats_accuracy.innerText =
    (((typed.length - wrong_chars) / typed.length) * 100).toFixed(2) + "%";

  debugLog(
    "TYPED",
    typed,
    "CHAR_INDEX:",
    char_index,
    " | WORD INDEX:",
    word_index
  );
}

function moveCharIndex(dist) {
  const prev = document.getElementById(`typewriter-char-${char_index + 1}`);
  if (prev) prev.classList.remove("char_index");

  char_index += dist;

  const current = document.getElementById(`typewriter-char-${char_index + 1}`);
  if (current) current.classList.add("char_index");

  updateCursorPosition();
}

function calculateWPM(chars, time) {
  if (time <= 0) return 0;
  return (60 * chars) / 5 / time;
}

function gameOver() {
  currentlyPlaying = 2;
  debugLog("GAME OVER");
  analyze_mistakes(incorrectly_typed);
}
function updateCursorPosition() {
  const cursor = document.getElementById("cursor");
  const currentChar = document.getElementById(
    `typewriter-char-${char_index + 1}`
  );
  const container = document.getElementById("typewriter");

  if (!cursor || !currentChar || !container) {
    cursor.style.display = "none";
    return;
  }

  const charRect = currentChar.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  cursor.style.display = "block";
  cursor.style.left = `${charRect.left - containerRect.left}px`;
  cursor.style.top = `${charRect.top - containerRect.top}px`;
  cursor.style.height = `${charRect.height}px`;
}

function analyze_mistakes(results) {
  let letter_mistake = {};
  let sequence_mistake = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    debugLog(result);

    // Find most common character mistake
    letter_mistake[result.pressed] += 1;

    // Find longest sequence of mistakes
    sequence_mistake.push(result.at);
  }
  // Find longest consecutive sequence:
  sequence_mistake.sort((a, b) => a < b);
  let longest_sequence = 0;
  let current_seq_count = 0;
  for (let i = 1; i < sequence_mistake.length; i++) {
    if (sequence_mistake[i] === sequence_mistake[i - 1]) continue;

    if (sequence_mistake[i] === sequence_mistake[i - 1] + 1) {
      current_seq_count++;
      longest_sequence = Math.max(longest_sequence, current_seq_count);
    } else {
      current_seq_count = 1;
    }
  }
  debugLog(longest_sequence);
}
