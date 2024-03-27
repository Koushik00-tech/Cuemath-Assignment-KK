// // game.js

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  scene: {
    preload: preload,
    create: create,
    update: handleRookMovement,
  },
};

const game = new Phaser.Game(config);

// Define grid constants
const NUM_ROWS = 8; // Number of rows on the chessboard grid
const NUM_COLS = 8; // Number of columns on the chessboard grid
const SQUARE_SIZE = 334.16 / NUM_ROWS; // Assuming NUM_ROWS equals NUM_COLS

// Offset for the chessboard grid (centered on the canvas)
const BOARD_OFFSET_X = (800 - 334.16) / 2;
const BOARD_OFFSET_Y = (600 - 334.16) / 2;

// Create a 2D array to represent the grid
let grid = [];

// Create variables for the chessboard and rook
let chessboard;
let rook;

// Function to create the grid
function createGrid() {
  for (let i = 0; i < NUM_ROWS; i++) {
    grid[i] = [];
    for (let j = 0; j < NUM_COLS; j++) {
      grid[i][j] = {
        x: BOARD_OFFSET_X + j * SQUARE_SIZE,
        y: BOARD_OFFSET_Y + i * SQUARE_SIZE,
      };
    }
  }
}

// Function to handle rook movement
function handleRookMovement(targetX, targetY) {
  // Calculate rook's current grid position
  let currentRow = Math.floor((rook.y - BOARD_OFFSET_Y) / SQUARE_SIZE);
  let currentCol = Math.floor((rook.x - BOARD_OFFSET_X) / SQUARE_SIZE);

  // Calculate target grid position
  let targetRow = Math.floor((targetY - BOARD_OFFSET_Y) / SQUARE_SIZE);
  let targetCol = Math.floor((targetX - BOARD_OFFSET_X) / SQUARE_SIZE);

  // Check if the target square is valid (left or down from the current position)
  if (
    targetCol <= currentCol &&
    targetRow >= currentRow &&
    targetCol >= 0 &&
    targetRow < NUM_ROWS
  ) {
    // Calculate the center position of the target square
    let centerX = BOARD_OFFSET_X + (targetCol + 0.5) * SQUARE_SIZE;
    let centerY = BOARD_OFFSET_Y + (targetRow + 0.5) * SQUARE_SIZE;
    rook.x = centerX;
    rook.y = centerY;
    // Winner Text
    // Check if the rook has reached the bottom-left corner
    if (targetRow === NUM_ROWS - 1 && targetCol === 0) {
      timerText.setText("Player 1 wins!");
    }
  }
}

function preload() {
  this.load.image("chessboard", "assets/chessboard.png");
  this.load.image("rook", "assets/rook.png");
  this.load.image("player1", "assets/player1.png");
  this.load.image("player2", "assets/player2.png");
}

let isRookMoved = false;

function create() {
  // Create the grid
  createGrid();

  // Add chessboard background
  chessboard = this.add.image(400, 300, "chessboard"); // Adjust position as needed
  this.add.image(400, 80, "player1");
  this.add.image(400, 530, "player2");

  timerText = this.add.text(16, 16, "Time: 30", {
    fontSize: "32px",
    fill: "#fff",
  });

  // Add rook sprite
  const initialRow = 0; // Row index of the starting position
  const initialCol = 7; // Column index of the starting position
  const xOffset = SQUARE_SIZE / 2; // Offset to center the rook within the square
  const yOffset = SQUARE_SIZE / 2;
  rook = this.add.sprite(
    grid[initialRow][initialCol].x + xOffset,
    grid[initialRow][initialCol].y + yOffset,
    "rook"
  );

  // Add rook sprite
  // Resize the rook sprite to fit inside the grid squares
  rook.setScale(SQUARE_SIZE / rook.width);

  // Enable rook sprite for input events
  rook.setInteractive();

  // Listen for pointer events on the scene
  this.input.on("pointerdown", function (pointer) {
    // Calculate grid coordinates of the clicked position
    let gridX =
      Math.floor((pointer.x - BOARD_OFFSET_X) / SQUARE_SIZE) * SQUARE_SIZE +
      BOARD_OFFSET_X;
    let gridY =
      Math.floor((pointer.y - BOARD_OFFSET_Y) / SQUARE_SIZE) * SQUARE_SIZE +
      BOARD_OFFSET_Y;

    // Handle rook movement if it's the current player's turn
    handleRookMovement(gridX, gridY);

    if (!isRookMoved) {
      startTimer();
      isRookMoved = true; // Set flag to true indicating the rook has been moved
    }
  });
}

function startTimer() {
  let timeLeft = 30;

  // Update timer display every second
  const timerInterval = setInterval(() => {
    // Display remaining time
    timerText.setText(`Time: ${timeLeft}`);

    // Decrease time left
    timeLeft--;

    // Check if time runs out
    if (timeLeft < 0) {
      clearInterval(timerInterval); // Stop the timer
      timerText.setText("Time is up! Game over."); // End the game
    }
  }, 1000); // Update every second
}

function gameOver(message) {
  // Display game over message at the center of the screen
  gameOverText = this.add.text(16, 16, message, {
    fontSize: "32px",
    fill: "#ffffff",
  });
  gameOverText.setText(message);
  clearInterval(timerInterval);
}
