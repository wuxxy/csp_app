// @ts-nocheck
// Variables

// Game Settings
let timeSelected = 5;
let difficulty = 1;

// Game Storage
let currentlyPlaying = 0;
let timer;
let tree;
let char_index = 0;
let word_index = 0;
let typeCount = 0;
let incorrectly_typed = [];
let wrong_chars = 0;
let attempts = [];
let forceStop = false;
let interval = null;


// For debug purposes
const DEBUG_MODE = false;
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
// List of keys that are ignored during the game because of conflicts

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

// Document Elements to reference
const timer_label = document.getElementById("timer-label");
const timer_bar = document.getElementById("timer-bar");
const typewriter = document.getElementById("typewriter");

const stats_accuracy = document.getElementById("stats-accuracy");
const stats_wpm = document.getElementById("stats-wpm");
const stats_time = document.getElementById("stats-time");

// Reference for hint element.
let hint;

// Initialize default values
let { words, characterTree } = loadText();

// Default settings
setTime(30);
setDiff(1);

// Updates all screen UI elements to have updated values
function updateScreen(){
  let timeSelectors = []
  let diffSelectors = []
  debugLog(document.getElementById("time_selector").children)
  Array.from(document.getElementById("time_selector").children).forEach(selector_button => {
    selector_button.classList.remove("bg-pink-700")
    timeSelectors.push(selector_button)
  })
  Array.from(document.getElementById("difficulty_selector").children).forEach(selector_button => {
    selector_button.classList.remove("bg-pink-700")
    diffSelectors.push(selector_button)
  })
  switch(timeSelected){
    case 15:
      timeSelectors[0].classList.add("bg-pink-700")
      break;
    case 30:
      timeSelectors[1].classList.add("bg-pink-700")
      break;
    case 45:
      timeSelectors[2].classList.add("bg-pink-700")
      break;
  }
  switch(difficulty){
    case 0:
      diffSelectors[0].classList.add("bg-pink-700")
      break;
    case 1:
      diffSelectors[1].classList.add("bg-pink-700")
      break;
    case 2:
      diffSelectors[2].classList.add("bg-pink-700")
      break;
  }
}
// Sets the time for the test to take
function setTime(time){
  debugLog("RUNNING FUNCTION setTime")
  timeSelected = time;
  if(currentlyPlaying != 0){
    forceStop=true; 
    debugLog("CALLING RESTART - SETTIME")
    restart();
  }

  updateScreen();
}
// Sets the test difficulty (difficulty not implement in game yet)
function setDiff(diff){
  difficulty = diff;
  if(currentlyPlaying != 0){
    forceStop=true; 
    debugLog("CALLING RESTART - DIFF")
    restart();
  }
  updateScreen();
}

// Event Listener for key presses
document.addEventListener("keydown", handleChar);

// Restarts the game, sets all variables into default starting value.
function restart() {
  typewriter.focus();
  debugLog("RUNNING FUNCTION RESTART", document.activeElement)
  document.activeElement.blur();
  document.body.focus();
  currentlyPlaying = 0;
  timer = timeSelected;
  tree = null;
  char_index = 0;
  word_index = 0;
  typeCount = 0;
  wrong_chars = 0;
  const reloadText = loadText();
  words = reloadText.words;
  characterTree = reloadText.characterTree;
  stats_accuracy.innerText = "N/A";
  stats_wpm.innerText = "N/A";
  stats_time.innerText = "N/A";
  timer_label.textContent = `${timeSelected}s left`;
  timer_bar.style.width = `100%`;
}
// Starts the game
function start() {
  debugLog("RUNNING FUNCTION START")
  if (currentlyPlaying) return;
  if(hint) hint.classList.add("hiddenn");
  currentlyPlaying = 1;
  timer = timeSelected;
  if(interval) return;
  interval = setInterval(() => {
    if(forceStop){
      clearInterval(interval)
      interval = null;
      forceStop=false;
      gameOver();
      return;
    }
    
    const time_elapsed = timeSelected - timer;
    stats_wpm.innerText = Math.round(calculateWPM(typeCount, time_elapsed));
    stats_time.innerText = time_elapsed + " seconds";

    timer_label.textContent = `${timer}s left`;
    const progress = (timer / timeSelected) * 100;
    timer_bar.style.width = `${progress}%`;
    if (timer <= 0) {
      clearInterval(interval);
      timer_label.textContent = "0s left";
      timer_bar.style.width = "0%";
      gameOver();
      return;
    }

    timer--;
  }, 1000);
}
// Loads a random piece of text for the game to use
function loadText() {
  debugLog("RUNNING FUNCTION loadText()")
  if(hint) hint.classList.remove("hiddenn");
  const pickedText =
    typingTexts[Math.floor(Math.random() * typingTexts.length)];

  const words = pickedText.split(" ");
  let characterTree = [];
  words.forEach((word) => {
    characterTree.push([...word.split(""), " "]);
  });

  tree = characterTree;
  typewriter.innerHTML = "";
  let typewriterHTML = "";
  let charLength = 0;

  for (let w = 0; w < characterTree.length; w++) {
    typewriterHTML += `<span id="typewriter-word-${w}">`;
    let whitespace = false;
    for (let c = 0; c < characterTree[w].length; c++) {
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
  hint = document.getElementById("start-hint");
  document.getElementById(`typewriter-char-1`).classList.add("char_index");
  updateCursorPosition();

  return { words, characterTree };
}
// Gets the character for given index
// Parameter {i} - is a number and represents the requested index
function get_typewriter_char(i) {
  debugLog("RUNNING FUNCTION get_typewriter_char")
  return document.getElementById(`typewriter-char-${i}`);
}
// Handles what to do when a user presses a key
function handleChar(e) {
  const key_pressed = e.key;
  if(currentlyPlaying == 0){
    if (disallowedCodes.includes(key_pressed)) return;
    start();
  };
  
  debugLog("RUNNING FUNCTION handleChar")
  if (currentlyPlaying != 1) return;
  
  if (disallowedCodes.includes(key_pressed)) return;
  if (key_pressed.length !== 1 && !(key_pressed == "Backspace" || key_pressed == "Delete")) return;
  const current_typewriter_char = get_typewriter_char(char_index + 1);
  
  let pressedSpace;

  
  
  if ((key_pressed == "Backspace" || key_pressed == "Delete")) {
    if((char_index <= 0)) return;
    console.log(char_index);
    
    if (get_typewriter_char(char_index).innerText == " " && (word_index > 0)) {
      word_index--;
    }
    console.log("Test");
    moveCharIndex(-1);
    typeCount--;


    if (current_typewriter_char.classList.contains("wrong-char")) {
      current_typewriter_char.classList.remove("wrong-char");
      wrong_chars--;
    }
    current_typewriter_char.classList.remove("correct-char");
    return;
  } else if (key_pressed == " ") {
    pressedSpace = true;
    if (current_typewriter_char == " ") {
      word_index++;
      typeCount++;
    }
    moveCharIndex(1);
  } else {
    // typed.push(key_pressed);   ARRAY_TYPED
    typeCount++;
    moveCharIndex(1);
  }

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


  stats_accuracy.innerText =
    (((typeCount - wrong_chars) / typeCount) * 100).toFixed(2) + "%";

}
// Moves the virtual cursor
// Parameter {dist} - number - How much to move the cursor
function moveCharIndex(dist) {
  debugLog("RUNNING FUNCTION moveCharIndex")
  const prev = document.getElementById(`typewriter-char-${char_index + 1}`);
  if (prev) prev.classList.remove("char_index");

  char_index += dist;

  const current = document.getElementById(`typewriter-char-${char_index + 1}`);
  if (current) current.classList.add("char_index");

  updateCursorPosition();
}
// Calculates the WPM
// Parameter {chars} - The amount of characters that has been typed altogether
// Parameter {time} - The amount of time elapsed, which it took to to write the chars
function calculateWPM(chars, time) {
  debugLog("RUNNING FUNCTION calculateWPM")
  if (time <= 0) return 0;
  return (60 * chars) / 5 / time;
}
// Declares the game over
function gameOver() {
  debugLog("RUNNING FUNCTION gameOver")
  currentlyPlaying = 2;
  interval = null;
  debugLog("GAME OVER");
  analyze_mistakes(incorrectly_typed);
}
// Moves the cursor position to appropriate place
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

// Parameter: results - an array of objects representing incorrect keypresses.
// Each object has: { pressed, correct, at } — which are sets of characters and locations used to calculate common mistakes and mistake streaks.
// Analyzes the mistake made during the game and outputs to screen.

function analyze_mistakes(results) {
  let letter_mistake = {};
  let sequence_mistake = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (!letter_mistake[result.pressed]) {
      letter_mistake[result.pressed] = 0;
    }
    letter_mistake[result.pressed] += 1;
    sequence_mistake.push(result.at);
  }

  // Find longest consecutive mistake sequence
  sequence_mistake.sort((a, b) => a - b);
  let longest_sequence = 0;
  let current_seq_count = 1;
  for (let i = 1; i < sequence_mistake.length; i++) {
    if (sequence_mistake[i] === sequence_mistake[i - 1] + 1) {
      current_seq_count++;
      longest_sequence = Math.max(longest_sequence, current_seq_count);
    } else {
      current_seq_count = 1;
    }
  }

  // Output to screen
  const outputBox = document.getElementById("mistake-list");
  outputBox.innerHTML = "";

  const mistakesSorted = Object.entries(letter_mistake).sort((a, b) => b[1] - a[1]);

  mistakesSorted.forEach(([char, count]) => {
    const li = document.createElement("li");
    li.textContent = `Key "${char}" mistyped ${count} times`;
    outputBox.appendChild(li);
  });

  const longestStreak = document.createElement("li");
  longestStreak.textContent = `Longest streak of consecutive mistakes: ${longest_sequence}`;
  outputBox.appendChild(longestStreak);
}
