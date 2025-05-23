// Game constants

// Board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Game speeds (ms per tick)
export const SPEED_BY_LEVEL: Record<number, number> = {
  1: 800,
  2: 700,
  3: 600,
  4: 500,
  5: 400,
  6: 350,
  7: 300,
  8: 250,
  9: 200,
  10: 150,
  // More levels can be added
};

// Score points
export const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
};

// Level progression
export const LINES_PER_LEVEL = 10;

// Key mappings
export const KEY_CODES = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
  UP: 'ArrowUp', // Rotate
  SPACE: ' ', // Hard drop
  P: 'p', // Pause
  ESCAPE: 'Escape', // Pause
};
