// Game State
let score = JSON.parse(localStorage.getItem('score')) || {
  Wins: 0,
  Losses: 0,
  Ties: 0
};

// Player move history for AI analysis
let moveHistory = [];

// Pattern analysis
let patternAnalysis = {
  rock: 0,
  paper: 0,
  scissors: 0
};

// Markov transition matrix
let transitions = {
  rock: { rock: 0, paper: 0, scissors: 0 },
  paper: { rock: 0, paper: 0, scissors: 0 },
  scissors: { rock: 0, paper: 0, scissors: 0 }
};

// AI settings
let aiEnabled = true;
let difficulty = "easy"; // "easy", "medium", "hard"
let confidenceLevel = 0;

// Current game state
let playerMove = null;
let computerMove = null;
let gameResult = null;

// DOM Elements
const aiToggleSwitch = document.getElementById('ai-toggle-switch');
const aiStatus = document.getElementById('ai-status');
const difficultyContainer = document.getElementById('difficulty-container');
const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');
const confidenceLevelElement = document.getElementById('confidence-level');
const rockBtn = document.getElementById('rock-btn');
const paperBtn = document.getElementById('paper-btn');
const scissorsBtn = document.getElementById('scissors-btn');
const resultText = document.getElementById('result-text');
const playerMoveDisplay = document.getElementById('player-move-display');
const computerMoveDisplay = document.getElementById('computer-move-display');
const winsCount = document.getElementById('wins-count');
const tiesCount = document.getElementById('ties-count');
const lossesCount = document.getElementById('losses-count');
const moveHistoryContainer = document.getElementById('move-history');
const rockMeter = document.getElementById('rock-meter');
const paperMeter = document.getElementById('paper-meter');
const scissorsMeter = document.getElementById('scissors-meter');
const rockPercent = document.getElementById('rock-percent');
const paperPercent = document.getElementById('paper-percent');
const scissorsPercent = document.getElementById('scissors-percent');
const resetBtn = document.getElementById('reset-btn');

// Initialize the game
function initGame() {
  updateScoreDisplay();
  updatePatternDisplay();
  
  // Set up event listeners
  aiToggleSwitch.addEventListener('change', toggleAI);
  easyBtn.addEventListener('click', () => setDifficulty('easy'));
  mediumBtn.addEventListener('click', () => setDifficulty('medium'));
  hardBtn.addEventListener('click', () => setDifficulty('hard'));
  rockBtn.addEventListener('click', () => handlePlayerMove('rock'));
  paperBtn.addEventListener('click', () => handlePlayerMove('paper'));
  scissorsBtn.addEventListener('click', () => handlePlayerMove('scissors'));
  resetBtn.addEventListener('click', resetGame);
}

// Toggle AI on/off
function toggleAI() {
  aiEnabled = aiToggleSwitch.checked;
  aiStatus.textContent = aiEnabled ? 'ON' : 'OFF';
  
  // Show/hide difficulty settings
  if (aiEnabled) {
    difficultyContainer.classList.remove('hidden');
  } else {
    difficultyContainer.classList.add('hidden');
  }
}

// Set difficulty level
function setDifficulty(level) {
  difficulty = level;
  
  // Update active button styling
  easyBtn.classList.remove('active');
  mediumBtn.classList.remove('active');
  hardBtn.classList.remove('active');
  
  if (level === 'easy') easyBtn.classList.add('active');
  else if (level === 'medium') mediumBtn.classList.add('active');
  else if (level === 'hard') hardBtn.classList.add('active');
}

// Handle player move
function handlePlayerMove(move) {
  playerMove = move;
  
  // Get computer move based on AI settings
  if (aiEnabled && moveHistory.length > 0) {
    computerMove = getAIMove(moveHistory, patternAnalysis, transitions, difficulty);
    
    // Update confidence level
    confidenceLevel = calculateConfidence(patternAnalysis, moveHistory.length);
    displayConfidenceLevel();
  } else {
    computerMove = pickRandomMove();
    confidenceLevel = 0;
    confidenceLevelElement.textContent = "Analyzing...";
  }
  
  // Determine winner
  gameResult = determineWinner(playerMove, computerMove);
  
  // Update displays
  displayMoves();
  displayResult();
  updateScore(gameResult);
  
  // Update move history and patterns
  updateMoveHistory(move);
  updatePatternAnalysis(move);
  
  // Update pattern display
  updatePatternDisplay();
  
  // Update Markov transitions
  if (moveHistory.length > 1) {
    const previousMove = moveHistory[moveHistory.length - 2];
    updateTransitions(previousMove, move);
  }
}

// Display player and computer moves
function displayMoves() {
  // Clear previous moves
  playerMoveDisplay.innerHTML = '';
  computerMoveDisplay.innerHTML = '';
  
  if (playerMove) {
    const playerMoveImg = document.createElement('img');
    playerMoveImg.src = `Images/${playerMove}-emoji.png`;
    playerMoveImg.alt = playerMove;
    playerMoveImg.className = 'move-icon';
    playerMoveDisplay.appendChild(playerMoveImg);
  }
  
  if (computerMove) {
    const computerMoveImg = document.createElement('img');
    computerMoveImg.src = `Images/${computerMove}-emoji.png`;
    computerMoveImg.alt = computerMove;
    computerMoveImg.className = 'move-icon';
    computerMoveDisplay.appendChild(computerMoveImg);
  }
}

// Display game result
function displayResult() {
  resultText.textContent = gameResult || "Choose your move!";
  
  // Reset classes
  resultText.classList.remove('win-result', 'tie-result', 'lose-result');
  
  // Add appropriate class based on result
  if (gameResult === "You Win!") {
    resultText.classList.add('win-result');
  } else if (gameResult === "Tie") {
    resultText.classList.add('tie-result');
  } else if (gameResult === "You Lose") {
    resultText.classList.add('lose-result');
  }
}

// Update score based on game result
function updateScore(result) {
  if (result === "You Win!") {
    score.Wins++;
  } else if (result === "You Lose") {
    score.Losses++;
  } else if (result === "Tie") {
    score.Ties++;
  }
  
  // Save to localStorage
  localStorage.setItem('score', JSON.stringify(score));
  
  // Update display
  updateScoreDisplay();
}

// Update score display
function updateScoreDisplay() {
  winsCount.textContent = score.Wins;
  tiesCount.textContent = score.Ties;
  lossesCount.textContent = score.Losses;
}

// Update move history
function updateMoveHistory(move) {
  // Add to history
  moveHistory.push(move);
  
  // Keep only last 20 moves
  if (moveHistory.length > 20) {
    moveHistory.shift();
  }
  
  // Update display
  displayMoveHistory();
}

// Display move history
function displayMoveHistory() {
  // Clear container
  moveHistoryContainer.innerHTML = '';
  
  if (moveHistory.length === 0) {
    const emptyText = document.createElement('p');
    emptyText.className = 'empty-history';
    emptyText.textContent = 'No moves yet';
    moveHistoryContainer.appendChild(emptyText);
    return;
  }
  
  // Add each move to the container
  moveHistory.forEach(move => {
    const moveItem = document.createElement('div');
    moveItem.className = 'move-history-item';
    
    const moveImg = document.createElement('img');
    moveImg.src = `Images/${move}-emoji.png`;
    moveImg.alt = move;
    
    moveItem.appendChild(moveImg);
    moveHistoryContainer.appendChild(moveItem);
  });
}

// Update pattern analysis
function updatePatternAnalysis(move) {
  patternAnalysis[move]++;
}

// Update pattern display
function updatePatternDisplay() {
  const total = moveHistory.length;
  
  if (total === 0) {
    // Default even distribution
    rockMeter.style.width = '33%';
    paperMeter.style.width = '33%';
    scissorsMeter.style.width = '33%';
    rockPercent.textContent = '33%';
    paperPercent.textContent = '33%';
    scissorsPercent.textContent = '33%';
    return;
  }
  
  // Calculate percentages
  const rockPct = Math.round((patternAnalysis.rock / total) * 100);
  const paperPct = Math.round((patternAnalysis.paper / total) * 100);
  const scissorsPct = Math.round((patternAnalysis.scissors / total) * 100);
  
  // Update meters and text
  rockMeter.style.width = `${rockPct}%`;
  paperMeter.style.width = `${paperPct}%`;
  scissorsMeter.style.width = `${scissorsPct}%`;
  rockPercent.textContent = `${rockPct}%`;
  paperPercent.textContent = `${paperPct}%`;
  scissorsPercent.textContent = `${scissorsPct}%`;
}

// Display confidence level
function displayConfidenceLevel() {
  if (confidenceLevel <= 0) {
    confidenceLevelElement.textContent = "Analyzing...";
  } else {
    confidenceLevelElement.textContent = `${Math.round(confidenceLevel * 100)}% confident`;
  }
}

// Update transition matrix
function updateTransitions(previousMove, currentMove) {
  transitions[previousMove][currentMove]++;
}

// Reset game
function resetGame() {
  // Reset score
  score = {
    Wins: 0,
    Losses: 0,
    Ties: 0
  };
  localStorage.removeItem('score');
  
  // Reset move history
  moveHistory = [];
  
  // Reset pattern analysis
  patternAnalysis = {
    rock: 0,
    paper: 0,
    scissors: 0
  };
  
  // Reset transitions
  transitions = {
    rock: { rock: 0, paper: 0, scissors: 0 },
    paper: { rock: 0, paper: 0, scissors: 0 },
    scissors: { rock: 0, paper: 0, scissors: 0 }
  };
  
  // Reset current game state
  playerMove = null;
  computerMove = null;
  gameResult = null;
  confidenceLevel = 0;
  
  // Update displays
  updateScoreDisplay();
  displayMoveHistory();
  updatePatternDisplay();
  displayConfidenceLevel();
  
  // Clear result and move displays
  resultText.textContent = "Choose your move!";
  resultText.classList.remove('win-result', 'tie-result', 'lose-result');
  playerMoveDisplay.innerHTML = '';
  computerMoveDisplay.innerHTML = '';
}

//////////////////////////
// AI Logic Functions
//////////////////////////

// Get AI move based on player history and difficulty
function getAIMove(moveHistory, patternAnalysis, transitions, difficulty) {
  // Based on difficulty, make strategic or random choice
  if (difficulty === "easy") {
    // 70% random, 30% strategic
    return Math.random() < 0.7 ? pickRandomMove() : predictNextBestMove(moveHistory, patternAnalysis, transitions);
  } else if (difficulty === "medium") {
    // 40% random, 60% strategic
    return Math.random() < 0.4 ? pickRandomMove() : predictNextBestMove(moveHistory, patternAnalysis, transitions);
  } else {
    // 10% random, 90% strategic
    return Math.random() < 0.1 ? pickRandomMove() : predictNextBestMove(moveHistory, patternAnalysis, transitions);
  }
}

// Pick a random move
function pickRandomMove() {
  const moves = ["rock", "paper", "scissors"];
  return moves[Math.floor(Math.random() * 3)];
}

// Predict best counter move based on player patterns
function predictNextBestMove(moveHistory, patternAnalysis, transitions) {
  if (moveHistory.length < 2) {
    return pickRandomMove();
  }
  
  // Predict player's next move
  const predictedPlayerMove = predictPlayerMove(moveHistory, patternAnalysis, transitions);
  
  // Choose a move that would beat the predicted player move
  if (predictedPlayerMove === "rock") return "paper";
  if (predictedPlayerMove === "paper") return "scissors";
  if (predictedPlayerMove === "scissors") return "rock";
  
  return pickRandomMove();
}

// Predict player's next move
function predictPlayerMove(moveHistory, patternAnalysis, transitions) {
  const totalMoves = moveHistory.length;
  if (totalMoves === 0) return pickRandomMove();
  
  // First try Markov chain for prediction if we have enough data
  if (totalMoves > 3) {
    const lastMove = moveHistory[totalMoves - 1];
    const transitionsFromLast = transitions[lastMove];
    
    // Find move with highest transition probability
    let maxTransition = 0;
    let predictedMove = null;
    
    for (const move of ["rock", "paper", "scissors"]) {
      if (transitionsFromLast[move] > maxTransition) {
        maxTransition = transitionsFromLast[move];
        predictedMove = move;
      }
    }
    
    if (predictedMove && maxTransition > 0) {
      return predictedMove;
    }
  }
  
  // Fallback to frequency analysis
  if (
    patternAnalysis.rock > patternAnalysis.paper && 
    patternAnalysis.rock > patternAnalysis.scissors
  ) {
    return "rock";
  } else if (
    patternAnalysis.paper > patternAnalysis.rock && 
    patternAnalysis.paper > patternAnalysis.scissors
  ) {
    return "paper";
  } else if (
    patternAnalysis.scissors > patternAnalysis.rock && 
    patternAnalysis.scissors > patternAnalysis.paper
  ) {
    return "scissors";
  }
  
  return pickRandomMove();
}

// Determine winner
function determineWinner(playerMove, computerMove) {
  if (playerMove === computerMove) {
    return "Tie";
  } else if (
    (playerMove === "rock" && computerMove === "scissors") ||
    (playerMove === "paper" && computerMove === "rock") ||
    (playerMove === "scissors" && computerMove === "paper")
  ) {
    return "You Win!";
  } else {
    return "You Lose";
  }
}

// Calculate AI confidence level
function calculateConfidence(patternAnalysis, historyLength) {
  // Calculate confidence based on the number of moves and pattern strength
  if (historyLength < 3) return 0;
  
  const total = patternAnalysis.rock + patternAnalysis.paper + patternAnalysis.scissors;
  
  if (total === 0) return 0;
  
  // Calculate the deviation from uniform distribution
  const uniform = total / 3;
  const deviation = Math.sqrt(
    Math.pow(patternAnalysis.rock - uniform, 2) +
    Math.pow(patternAnalysis.paper - uniform, 2) +
    Math.pow(patternAnalysis.scissors - uniform, 2)
  ) / total;
  
  // Adjust based on history length
  const historyWeight = Math.min(historyLength / 10, 1);
  
  return Math.min(deviation * 3 * historyWeight, 1);
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);