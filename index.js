// Game state
const gameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  winningCombination: null,
  lastMove: null,
  playerXWins: 0,
  playerOWins: 0,
  draws: 0
};

// Winning combinations
const WINNING_COMBINATIONS = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal top-left to bottom-right
  [2, 4, 6], // diagonal top-right to bottom-left
];

// DOM elements
const gameBoard = document.getElementById('game-board');
const playerXStatus = document.getElementById('player-x-status');
const playerOStatus = document.getElementById('player-o-status');
const playerXWins = document.getElementById('player-x-wins');
const playerOWins = document.getElementById('player-o-wins');
const statsXWins = document.getElementById('stats-x-wins');
const statsOWins = document.getElementById('stats-o-wins');
const statsDraws = document.getElementById('stats-draws');
const resetButton = document.getElementById('reset-button');
const winnerMessage = document.getElementById('winner-message');
const playerXCard = document.getElementById('player-x-card');
const playerOCard = document.getElementById('player-o-card');
const toast = document.getElementById('toast');

// Initialize the game
function initGame() {
  createGameCells();
  updatePlayerStatus();
  resetButton.addEventListener('click', resetGame);
}

// Create game cells
function createGameCells() {
  const boardContent = document.querySelector('#game-board > div');
  
  // Clear existing cells if any
  while (boardContent.children.length > 1) {
    boardContent.removeChild(boardContent.lastChild);
  }
  
  // Create 9 cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add(
      'cell', 'w-full', 'h-full', 'flex', 'items-center', 'justify-center', 
      'cursor-pointer', 'text-4xl', 'md:text-5xl', 'lg:text-6xl', 'font-bold',
      'transition-all', 'duration-300', 'ease-out', 'hover:bg-white/5'
    );
    
    cell.dataset.index = i;
    cell.addEventListener('click', handleCellClick);
    
    // Add hover effect
    const hoverSymbol = document.createElement('div');
    hoverSymbol.classList.add(
      'w-full', 'h-full', 'opacity-0', 'hover:opacity-10', 
      'transition-opacity', 'duration-200', 'flex', 'items-center', 
      'justify-center'
    );
    
    hoverSymbol.textContent = gameState.currentPlayer;
    hoverSymbol.classList.add(gameState.currentPlayer === 'X' ? 'text-game-purple' : 'text-game-blue');
    
    cell.appendChild(hoverSymbol);
    boardContent.appendChild(cell);
  }
}

// Handle cell click
function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = parseInt(cell.dataset.index);
  
  // Return if cell is already filled or there's a winner
  if (gameState.board[index] || gameState.winner) {
    return;
  }
  
  // Update the game state
  gameState.board[index] = gameState.currentPlayer;
  gameState.lastMove = index;
  
  // Update the UI
  updateCell(index);
  
  // Check for winner
  checkWinner();
  
  // Switch player if no winner
  if (!gameState.winner) {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updatePlayerStatus();
    updateHoverSymbols();
  }
}

// Update cell with current player's symbol
function updateCell(index) {
  const cell = document.querySelector(`[data-index="${index}"]`);
  
  // Clear hover effect
  while (cell.firstChild) {
    cell.removeChild(cell.firstChild);
  }
  
  const symbol = document.createElement('div');
  symbol.classList.add(
    'w-16', 'h-16', 'flex', 'items-center', 'justify-center', 'animate-scale-in'
  );
  
  const span = document.createElement('span');
  span.textContent = gameState.board[index];
  span.classList.add(
    gameState.board[index] === 'X' ? 'text-game-purple' : 'text-game-blue'
  );
  
  // Add glow effect for last move
  if (index === gameState.lastMove) {
    span.classList.add('drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]');
  }
  
  symbol.appendChild(span);
  cell.appendChild(symbol);
}

// Update hover symbols to show current player
function updateHoverSymbols() {
  const emptyCells = document.querySelectorAll('.cell:not(:has(span))');
  
  emptyCells.forEach(cell => {
    const hoverSymbol = document.createElement('div');
    hoverSymbol.classList.add(
      'w-full', 'h-full', 'opacity-0', 'hover:opacity-10', 
      'transition-opacity', 'duration-200', 'flex', 'items-center', 
      'justify-center'
    );
    
    hoverSymbol.textContent = gameState.currentPlayer;
    hoverSymbol.classList.add(gameState.currentPlayer === 'X' ? 'text-game-purple' : 'text-game-blue');
    
    // Clear existing content
    while (cell.firstChild) {
      cell.removeChild(cell.firstChild);
    }
    
    cell.appendChild(hoverSymbol);
  });
}

// Update player status (active/waiting)
function updatePlayerStatus() {
  if (gameState.currentPlayer === 'X') {
    playerXStatus.textContent = 'CURRENT TURN';
    playerXStatus.classList.add('text-game-purple');
    playerXStatus.classList.remove('text-gray-400');
    
    playerOStatus.textContent = 'WAITING';
    playerOStatus.classList.add('text-gray-400');
    playerOStatus.classList.remove('text-game-blue');
    
    playerXCard.classList.add('shadow-[0_0_15px_rgba(139,92,246,0.3)]');
    playerOCard.classList.remove('shadow-[0_0_15px_rgba(14,165,233,0.3)]');
  } else {
    playerOStatus.textContent = 'CURRENT TURN';
    playerOStatus.classList.add('text-game-blue');
    playerOStatus.classList.remove('text-gray-400');
    
    playerXStatus.textContent = 'WAITING';
    playerXStatus.classList.add('text-gray-400');
    playerXStatus.classList.remove('text-game-purple');
    
    playerOCard.classList.add('shadow-[0_0_15px_rgba(14,165,233,0.3)]');
    playerXCard.classList.remove('shadow-[0_0_15px_rgba(139,92,246,0.3)]');
  }
}

// Check for winner
function checkWinner() {
  // Check winning combinations
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (
      gameState.board[a] && 
      gameState.board[a] === gameState.board[b] && 
      gameState.board[a] === gameState.board[c]
    ) {
      gameState.winner = gameState.board[a];
      gameState.winningCombination = combination;
      
      // Update scores
      if (gameState.winner === 'X') {
        gameState.playerXWins++;
      } else {
        gameState.playerOWins++;
      }
      
      highlightWinningCombination();
      showWinnerMessage();
      updateScores();
      return;
    }
  }
  
  // Check for a draw
  if (!gameState.board.includes(null)) {
    gameState.winner = 'DRAW';
    gameState.draws++;
    showWinnerMessage();
    updateScores();
  }
}

// Highlight winning combination
function highlightWinningCombination() {
  if (gameState.winningCombination) {
    gameState.winningCombination.forEach(index => {
      const cell = document.querySelector(`[data-index="${index}"]`);
      cell.classList.add('bg-white/10', 'animate-scale-bounce');
    });
  }
}

// Show winner message
function showWinnerMessage() {
  winnerMessage.classList.remove('hidden');
  
  let bgColor, messageColor, message;
  
  if (gameState.winner === 'X') {
    bgColor = 'bg-game-purple/20';
    messageColor = 'text-game-purple';
    message = 'Player X Wins!';
    showToast('Player X wins!', 'bg-game-purple');
  } else if (gameState.winner === 'O') {
    bgColor = 'bg-game-blue/20';
    messageColor = 'text-game-blue';
    message = 'Player O Wins!';
    showToast('Player O wins!', 'bg-game-blue');
  } else {
    bgColor = 'bg-white/10';
    messageColor = 'text-white';
    message = "It's a Draw!";
    showToast("It's a draw!", 'bg-game-slate');
  }
  
  winnerMessage.className = `p-5 rounded-lg text-center backdrop-blur-md border border-white/10 ${bgColor} animate-scale-in`;
  
  winnerMessage.innerHTML = `
    <div class="flex items-center justify-center gap-3 mb-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${messageColor}">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
      </svg>
      <h3 class="font-bold text-xl">
        ${message}
      </h3>
    </div>
    <p class="text-white/70">
      ${gameState.winner === 'DRAW' 
        ? "No one could claim victory this time."
        : "Congratulations on your victory!"
      }
    </p>
    <button id="play-again" class="mt-4 w-full py-2 px-4 rounded-md font-medium flex items-center justify-center gap-2 
      ${gameState.winner === 'X' 
        ? 'bg-game-purple hover:bg-game-purple/90' 
        : gameState.winner === 'O' 
          ? 'bg-game-blue hover:bg-game-blue/90' 
          : 'bg-white/20 hover:bg-white/30'
      }">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
        <path d="M3 3v5h5"></path>
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
        <path d="M16 16h5v5"></path>
      </svg>
      Play Again
    </button>
  `;
  
  // Add event listener to Play Again button
  document.getElementById('play-again').addEventListener('click', resetGame);
}

// Show toast notification
function showToast(message, bgColor) {
  toast.textContent = message;
  toast.className = `toast ${bgColor} visible`;
  
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

// Update scores
function updateScores() {
  playerXWins.textContent = gameState.playerXWins;
  playerOWins.textContent = gameState.playerOWins;
  statsXWins.textContent = gameState.playerXWins;
  statsOWins.textContent = gameState.playerOWins;
  statsDraws.textContent = gameState.draws;
}

// Reset game
function resetGame() {
  gameState.board = Array(9).fill(null);
  gameState.currentPlayer = 'X';
  gameState.winner = null;
  gameState.winningCombination = null;
  gameState.lastMove = null;
  
  // Update UI
  createGameCells();
  updatePlayerStatus();
  winnerMessage.classList.add('hidden');
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
