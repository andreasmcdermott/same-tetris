import { useCallback, useEffect, useState, useRef } from "react";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../constants/gameConstants";
import {
  TETROMINOS,
  TetrominoType,
  randomTetromino,
} from "../constants/tetrominos";

// Define the cell type for the game board
export type Cell = {
  filled: boolean;
  color: string;
  clearing?: boolean; // For animation
};

// Define the tetromino position
export type Position = {
  row: number;
  col: number;
};

// Local storage key for high score
const HIGH_SCORE_KEY = "tetris-high-score";

// Function to get the high score from localStorage
const getHighScore = (): number => {
  if (typeof localStorage !== "undefined") {
    const savedScore = localStorage.getItem(HIGH_SCORE_KEY);
    return savedScore ? parseInt(savedScore, 10) : 0;
  }
  return 0;
};

// Function to save high score to localStorage
const saveHighScore = (score: number): void => {
  if (typeof localStorage !== "undefined") {
    const currentHighScore = getHighScore();
    if (score > currentHighScore) {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  }
};

// Create an empty game board
export const createEmptyBoard = (): Cell[][] =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({ filled: false, color: "" })),
  );

// Hook for managing the game board
export const useGameBoard = () => {
  // Game board state
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard());

  // Current tetromino state
  const [currentTetromino, setCurrentTetromino] = useState<TetrominoType>(
    randomTetromino(),
  );
  const [nextTetromino, setNextTetromino] = useState<TetrominoType>(
    randomTetromino(),
  );
  const [position, setPosition] = useState<Position>({
    row: 0,
    col: Math.floor(BOARD_WIDTH / 2) - 2,
  });
  const [rotation, setRotation] = useState<number>(0);

  // Game state
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(getHighScore());
  const [level, setLevel] = useState<number>(1);
  const [lines, setLines] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Animation state
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animatingRows, setAnimatingRows] = useState<number[]>([]);

  // Use a ref to break the dependency cycle
  const placeTetromino = useRef<() => void>(() => {});

  // Load high score from localStorage on mount
  useEffect(() => {
    setHighScore(getHighScore());
  }, []);

  // Update high score when current score exceeds it
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      saveHighScore(score);
    }
  }, [score, highScore]);

  // Reset the game
  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentTetromino(randomTetromino());
    setNextTetromino(randomTetromino());
    setPosition({ row: 0, col: Math.floor(BOARD_WIDTH / 2) - 2 });
    setRotation(0);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setIsAnimating(false);
    setAnimatingRows([]);
  }, []);

  // Get the current tetromino shape based on rotation
  const getRotatedTetromino = useCallback(() => {
    const tetrominoShape = TETROMINOS[currentTetromino].shape;
    const size = tetrominoShape.length;
    let rotatedShape = [...tetrominoShape.map((row) => [...row])];

    // Apply rotation (0, 1, 2, or 3 times 90 degrees)
    for (let r = 0; r < rotation % 4; r++) {
      const temp = Array.from({ length: size }, () => Array(size).fill(0));
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          temp[x][size - 1 - y] = rotatedShape[y][x];
        }
      }
      rotatedShape = temp;
    }

    return rotatedShape;
  }, [currentTetromino, rotation]);

  // Check if the current tetromino can move to a position
  const isValidMove = useCallback(
    (
      newRow: number,
      newCol: number,
      rotatedTetromino = getRotatedTetromino(),
    ) => {
      // If we're animating, don't allow movement
      if (isAnimating) return false;

      const shape = rotatedTetromino;

      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          // Skip empty cells in the tetromino
          if (!shape[r][c]) continue;

          // Calculate the absolute position on the board
          const boardRow = newRow + r;
          const boardCol = newCol + c;

          // Check if outside board boundaries
          if (
            boardRow < 0 ||
            boardRow >= BOARD_HEIGHT ||
            boardCol < 0 ||
            boardCol >= BOARD_WIDTH
          ) {
            return false;
          }

          // Check if cell is already filled
          if (board[boardRow][boardCol].filled) {
            return false;
          }
        }
      }

      return true;
    },
    [board, getRotatedTetromino, isAnimating],
  );

  // Clear completed lines with animation
  const clearCompletedLines = useCallback(
    (newBoard: Cell[][], completedRows: number[]) => {
      if (completedRows.length === 0) return newBoard;

      // Set animation state
      setIsAnimating(true);
      setAnimatingRows(completedRows);

      // Animate the rows that will be cleared
      const animatedBoard = [...newBoard.map((row) => [...row])];
      for (const rowIndex of completedRows) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
          animatedBoard[rowIndex][col] = {
            ...animatedBoard[rowIndex][col],
            clearing: true,
          };
        }
      }

      // Update the board with animation
      setBoard(animatedBoard);

      // Wait for animation to complete before actually removing rows
      setTimeout(() => {
        // Remove completed rows
        const updatedBoard = [...animatedBoard.map((row) => [...row])];
        for (let i = completedRows.length - 1; i >= 0; i--) {
          const row = completedRows[i];
          updatedBoard.splice(row, 1);
        }

        // Add new empty rows at the top
        for (let i = 0; i < completedRows.length; i++) {
          updatedBoard.unshift(
            Array.from({ length: BOARD_WIDTH }, () => ({
              filled: false,
              color: "",
            })),
          );
        }

        // Update the board
        setBoard(updatedBoard);

        // Update lines and score
        const newLines = lines + completedRows.length;
        setLines(newLines);

        // Calculate score based on number of lines cleared
        let points = 0;
        switch (completedRows.length) {
          case 1:
            points = 100 * level;
            break;
          case 2:
            points = 300 * level;
            break;
          case 3:
            points = 500 * level;
            break;
          case 4:
            points = 800 * level;
            break;
          default:
            break;
        }

        setScore((prev) => prev + points);

        // Check level up
        if (Math.floor(newLines / 10) > Math.floor(lines / 10)) {
          setLevel((prev) => prev + 1);
        }

        // Reset animation state
        setIsAnimating(false);
        setAnimatingRows([]);

        // Get next tetromino
        const newTetromino = nextTetromino;
        const newNextTetromino = randomTetromino();
        const newPosition = { row: 0, col: Math.floor(BOARD_WIDTH / 2) - 2 };
        
        // Check if new tetromino can be placed at starting position
        const newTetrominoShape = TETROMINOS[newTetromino].shape;
        let canPlace = true;
        for (let r = 0; r < newTetrominoShape.length; r++) {
          for (let c = 0; c < newTetrominoShape[r].length; c++) {
            if (newTetrominoShape[r][c] !== 0) {
              const boardRow = newPosition.row + r;
              const boardCol = newPosition.col + c;
              if (
                boardRow >= 0 &&
                boardRow < BOARD_HEIGHT &&
                boardCol >= 0 &&
                boardCol < BOARD_WIDTH &&
                newBoard[boardRow][boardCol].filled
              ) {
                canPlace = false;
                break;
              }
            }
          }
          if (!canPlace) break;
        }
        
        if (!canPlace) {
          setGameOver(true);
          return;
        }
        
        setCurrentTetromino(newTetromino);
        setNextTetromino(newNextTetromino);
        setPosition(newPosition);
        setRotation(0);
      }, 500); // Animation duration

      return animatedBoard;
    },
    [level, lines, nextTetromino],
  );

  // Implement the actual placeTetromino function
  placeTetromino.current = () => {
    const shape = getRotatedTetromino();
    const tetrominoColor = TETROMINOS[currentTetromino].color;
    const newBoard = [...board.map((row) => [...row])];

    // Add the tetromino to the board
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardRow = position.row + r;
          const boardCol = position.col + c;

          // Check if the placement is above the top row (game over)
          if (boardRow < 0) {
            setGameOver(true);
            return;
          }

          // Update the board
          if (
            boardRow >= 0 &&
            boardRow < BOARD_HEIGHT &&
            boardCol >= 0 &&
            boardCol < BOARD_WIDTH
          ) {
            newBoard[boardRow][boardCol] = {
              filled: true,
              color: tetrominoColor,
            };
          }
        }
      }
    }

    // Check for completed lines
    const completedRows: number[] = [];
    for (let r = 0; r < BOARD_HEIGHT; r++) {
      if (newBoard[r].every((cell) => cell.filled)) {
        completedRows.push(r);
      }
    }

    // If there are completed lines, animate them
    if (completedRows.length > 0) {
      clearCompletedLines(newBoard, completedRows);
    } else {
      // No completed lines, just update the board
      setBoard(newBoard);

      // Get next tetromino
      const newTetromino = nextTetromino;
      const newNextTetromino = randomTetromino();
      const newPosition = { row: 0, col: Math.floor(BOARD_WIDTH / 2) - 2 };
      
      // Check if new tetromino can be placed at starting position
      const newTetrominoShape = TETROMINOS[newTetromino].shape;
      let canPlace = true;
      for (let r = 0; r < newTetrominoShape.length; r++) {
        for (let c = 0; c < newTetrominoShape[r].length; c++) {
          if (newTetrominoShape[r][c] !== 0) {
            const boardRow = newPosition.row + r;
            const boardCol = newPosition.col + c;
            if (
              boardRow >= 0 &&
              boardRow < BOARD_HEIGHT &&
              boardCol >= 0 &&
              boardCol < BOARD_WIDTH &&
              newBoard[boardRow][boardCol].filled
            ) {
              canPlace = false;
              break;
            }
          }
        }
        if (!canPlace) break;
      }
      
      if (!canPlace) {
        setGameOver(true);
        return;
      }
      
      setCurrentTetromino(newTetromino);
      setNextTetromino(newNextTetromino);
      setPosition(newPosition);
      setRotation(0);
    }
  };

  // Update the placeTetromino dependency whenever relevant state changes
  useEffect(() => {
    // No need to do anything here, just ensuring the ref is updated when dependencies change
  }, [
    board,
    currentTetromino,
    nextTetromino,
    position,
    getRotatedTetromino,
    clearCompletedLines,
  ]);

  // Move the tetromino left
  const moveLeft = useCallback(() => {
    if (isAnimating || isPaused || gameOver) return false;

    if (isValidMove(position.row, position.col - 1)) {
      setPosition((prev) => ({ ...prev, col: prev.col - 1 }));
      return true;
    }
    return false;
  }, [position, isPaused, gameOver, isValidMove, isAnimating]);

  // Move the tetromino right
  const moveRight = useCallback(() => {
    if (isAnimating || isPaused || gameOver) return false;

    if (isValidMove(position.row, position.col + 1)) {
      setPosition((prev) => ({ ...prev, col: prev.col + 1 }));
      return true;
    }
    return false;
  }, [position, isPaused, gameOver, isValidMove, isAnimating]);

  // Rotate the tetromino
  const rotateTetromino = useCallback(() => {
    if (isAnimating || isPaused || gameOver) return false;

    const newRotation = (rotation + 1) % 4;
    // Create a tetromino with the new rotation to check if it's valid
    const tetrominoShape = TETROMINOS[currentTetromino].shape;
    const size = tetrominoShape.length;
    const temp = Array.from({ length: size }, () => Array(size).fill(0));

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        temp[x][size - 1 - y] = tetrominoShape[y][x];
      }
    }

    const rotatedTetromino = [...temp];
    for (let r = 0; r < newRotation - 1; r++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          temp[x][size - 1 - y] = rotatedTetromino[y][x];
        }
      }
    }

    if (isValidMove(position.row, position.col, rotatedTetromino)) {
      setRotation(newRotation);
      return true;
    }

    // Try wall kick - move slightly if rotation is blocked by wall
    const kicks = [-1, 1, -2, 2];
    for (const kick of kicks) {
      if (isValidMove(position.row, position.col + kick, rotatedTetromino)) {
        setPosition((prev) => ({ ...prev, col: prev.col + kick }));
        setRotation(newRotation);
        return true;
      }
    }

    return false;
  }, [
    currentTetromino,
    position,
    rotation,
    isPaused,
    gameOver,
    isValidMove,
    isAnimating,
  ]);

  // Move the tetromino down (soft drop)
  const moveDown = useCallback(() => {
    // Skip if game is paused, over, or animating
    if (isPaused || gameOver || isAnimating) {
      return false;
    }

    // Try to move down
    if (isValidMove(position.row + 1, position.col)) {
      setPosition((prev) => ({ ...prev, row: prev.row + 1 }));
      return true;
    }

    // Can't move down, place the tetromino
    placeTetromino.current();
    return false;
  }, [position, isPaused, gameOver, isValidMove, isAnimating]);

  // Hard drop the tetromino
  const hardDrop = useCallback(() => {
    // Skip if game is paused, over, or animating
    if (isPaused || gameOver || isAnimating) {
      return false;
    }

    let dropDistance = 0;
    let newRow = position.row;

    // Find the furthest possible drop position
    while (isValidMove(newRow + 1, position.col)) {
      newRow++;
      dropDistance++;
    }

    // Update the position immediately
    setPosition({ row: newRow, col: position.col });

    // Add points for the hard drop
    setScore((prev) => prev + dropDistance * 2); // 2 points per cell for hard drop

    // Place the tetromino at the new position
    // We need to call this outside the current render cycle to ensure position is updated
    setTimeout(() => {
      placeTetromino.current();
    }, 0);

    return true;
  }, [position, isPaused, gameOver, isAnimating, isValidMove, setScore]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    if (!gameOver && !isAnimating) {
      setIsPaused((prev) => !prev);
    }
  }, [gameOver, isAnimating]);

  return {
    board,
    currentTetromino,
    nextTetromino,
    position,
    getRotatedTetromino,
    score,
    highScore,
    level,
    lines,
    gameOver,
    isPaused,
    isAnimating,
    animatingRows,
    moveLeft,
    moveRight,
    moveDown,
    rotateTetromino,
    hardDrop,
    resetGame,
    togglePause,
  };
};
