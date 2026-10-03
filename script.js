const boardSize = 12;
const startingSnake = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 },
];

const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');
const directionButtons = document.querySelectorAll('.direction-button');

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let apple = { x: 0, y: 0 };
let score = 0;
let intervalId = null;
let gameOver = false;
let isRunning = false;
let swipeStart = null;

const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const initialMessage = 'Use arrow keys, WASD, swipe, or the directional buttons to move.';

function createBoard() {
  board.innerHTML = '';
  for (let i = 0; i < boardSize * boardSize; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    board.appendChild(cell);
  }
}

function setMessage(text) {
  messageEl.textContent = text;
}

function randomApplePosition() {
  let nextPosition;
  do {
    nextPosition = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
  } while (snake.some((segment) => segment.x === nextPosition.x && segment.y === nextPosition.y));

  apple = nextPosition;
}

function render() {
  const cells = [...board.children];

  cells.forEach((cell) => {
    cell.classList.remove('snake', 'snake-head', 'apple');
  });

  snake.forEach((segment, index) => {
    const cellIndex = segment.y * boardSize + segment.x;
    const cell = cells[cellIndex];

    if (cell) {
      cell.classList.add('snake');
      if (index === 0) {
        cell.classList.add('snake-head');
      }
    }
  });

  const appleCell = cells[apple.y * boardSize + apple.x];
  if (appleCell) {
    appleCell.classList.add('apple');
  }

  scoreEl.textContent = String(score);
}

function endGame() {
  gameOver = true;
  isRunning = false;
  clearInterval(intervalId);
  setMessage(`Game over! Final score: ${score}. Press Restart to play again.`);
}

function updateSnake() {
  direction = { ...nextDirection };

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const willEat = head.x === apple.x && head.y === apple.y;
  const bodyToCheck = snake.slice(0, willEat ? snake.length : snake.length - 1);

  if (
    head.x < 0 ||
    head.x >= boardSize ||
    head.y < 0 ||
    head.y >= boardSize ||
    bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y)
  ) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (willEat) {
    score += 1;
    randomApplePosition();
    setMessage('Nice! Keep going!');
  } else {
    snake.pop();
  }

  render();
}

function startGame() {
  if (gameOver || isRunning) {
    return;
  }

  isRunning = true;
  intervalId = setInterval(updateSnake, 160);
}

function resetGame() {
  clearInterval(intervalId);
  snake = startingSnake.map((segment) => ({ ...segment }));
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  isRunning = false;
  randomApplePosition();
  render();
  setMessage(initialMessage);
}

function handleDirectionChange(newDirection) {
  if (gameOver) {
    return;
  }

  const isOpposite =
    newDirection.x === -direction.x && newDirection.y === -direction.y;

  if (!isOpposite) {
    nextDirection = newDirection;
  }

  if (!isRunning) {
    startGame();
  }
}

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (key === 'arrowup' || key === 'w') {
    event.preventDefault();
    handleDirectionChange({ x: 0, y: -1 });
  }

  if (key === 'arrowdown' || key === 's') {
    event.preventDefault();
    handleDirectionChange({ x: 0, y: 1 });
  }

  if (key === 'arrowleft' || key === 'a') {
    event.preventDefault();
    handleDirectionChange({ x: -1, y: 0 });
  }

  if (key === 'arrowright' || key === 'd') {
    event.preventDefault();
    handleDirectionChange({ x: 1, y: 0 });
  }

  if (key === ' ' && gameOver) {
    event.preventDefault();
    resetGame();
  }
});

restartBtn.addEventListener('click', resetGame);

directionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    handleDirectionChange(directions[button.dataset.direction]);
  });
});

board.addEventListener('pointerdown', (event) => {
  if (event.isPrimary) {
    swipeStart = { x: event.clientX, y: event.clientY };
    board.setPointerCapture(event.pointerId);
  }
});

board.addEventListener('pointerup', (event) => {
  if (!swipeStart || !event.isPrimary) {
    return;
  }

  const deltaX = event.clientX - swipeStart.x;
  const deltaY = event.clientY - swipeStart.y;
  swipeStart = null;

  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) {
    return;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    handleDirectionChange(deltaX > 0 ? directions.right : directions.left);
  } else {
    handleDirectionChange(deltaY > 0 ? directions.down : directions.up);
  }
});

board.addEventListener('pointercancel', () => {
  swipeStart = null;
});

createBoard();
resetGame();
