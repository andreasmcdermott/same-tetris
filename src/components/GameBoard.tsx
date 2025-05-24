import { useEffect, useRef } from "react";
import { TETROMINOS } from "../constants/tetrominos";
import { KEY_CODES, SPEED_BY_LEVEL } from "../constants/gameConstants";
import { useGameBoard } from "../hooks/useGameBoard";
import { Controls } from "./Controls";
import { GameControls } from "./GameControls";
import { Score } from "./Score";


export const GameBoard = () => {
  const {
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
  } = useGameBoard();

  // Use a ref to store the interval
  const intervalRef = useRef<number | null>(null);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) {
        // Allow restart when game is over
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          resetGame();
        }
        return;
      }

      switch (e.key) {
        case KEY_CODES.LEFT:
          e.preventDefault();
          moveLeft();
          break;
        case KEY_CODES.RIGHT:
          e.preventDefault();
          moveRight();
          break;
        case KEY_CODES.DOWN:
          e.preventDefault();
          moveDown();
          break;
        case KEY_CODES.UP:
          e.preventDefault();
          rotateTetromino();
          break;
        case KEY_CODES.SPACE:
          e.preventDefault();
          hardDrop();
          break;
        case KEY_CODES.P:
        case KEY_CODES.ESCAPE:
          e.preventDefault();
          togglePause();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    moveLeft,
    moveRight,
    moveDown,
    rotateTetromino,
    hardDrop,
    togglePause,
    gameOver,
  ]);

  // Game tick for tetromino falling
  useEffect(() => {
    if (!isPaused && !gameOver && !isAnimating) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Set new interval based on current level
      intervalRef.current = window.setInterval(() => {
        moveDown();
      }, SPEED_BY_LEVEL[level] || SPEED_BY_LEVEL[10]); // Default to level 10 speed if level is > 10
    } else if (isPaused || gameOver || isAnimating) {
      // Clear interval when paused, game over, or animating
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, gameOver, isAnimating, level, moveDown]);

  // Render the current tetromino on the board
  const renderTetromino = () => {
    if (gameOver || isAnimating) return null;

    const tetromino = getRotatedTetromino();
    const tetrominoColor = TETROMINOS[currentTetromino].color;

    return tetromino.map((row, rowIdx) =>
      row.map((cell, colIdx) => {
        if (cell !== 0) {
          const boardRow = position.row + rowIdx;
          const boardCol = position.col + colIdx;

          // Only render cells that are within the visible board
          if (
            boardRow >= 0 &&
            boardRow < board.length &&
            boardCol >= 0 &&
            boardCol < board[0].length
          ) {
            return (
              <div
                key={`tetromino-${boardRow}-${boardCol}`}
                className={`absolute ${tetrominoColor} border border-gray-800`}
                style={{
                  top: `${boardRow * 25}px`,
                  left: `${boardCol * 25}px`,
                  width: "25px",
                  height: "25px",
                }}
              />
            );
          }
        }
        return null;
      }),
    );
  };

  // Render the next tetromino preview
  const renderNextTetromino = () => {
    const tetromino = TETROMINOS[nextTetromino].shape;
    const tetrominoColor = TETROMINOS[nextTetromino].color;

    return (
      <div className="relative h-20 w-20">
        {tetromino.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            if (cell !== 0) {
              return (
                <div
                  key={`next-${rowIdx}-${colIdx}`}
                  className={`absolute ${tetrominoColor} border border-gray-800`}
                  style={{
                    top: `${rowIdx * 20}px`,
                    left: `${colIdx * 20}px`,
                    width: "20px",
                    height: "20px",
                  }}
                />
              );
            }
            return null;
          }),
        )}
      </div>
    );
  };

  // Mobile touch controls
  const TouchControls = () => {
    return (
      <div className="grid grid-cols-3 gap-2 mt-4 sm:hidden">
        <button
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded"
          onClick={moveLeft}
          disabled={gameOver || isPaused || isAnimating}
        >
          ←
        </button>
        <div className="grid grid-rows-2 gap-2">
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded"
            onClick={rotateTetromino}
            disabled={gameOver || isPaused || isAnimating}
          >
            ↻
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded"
            onClick={hardDrop}
            disabled={gameOver || isPaused || isAnimating}
          >
            ↓↓
          </button>
        </div>
        <button
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded"
          onClick={moveRight}
          disabled={gameOver || isPaused || isAnimating}
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_200px]">
        {/* Game board */}
        <div className="relative bg-gray-900 border-2 border-gray-700 h-[500px] w-[250px]">
          {/* Background grid */}
          {board.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              // Determine if this cell is in a row being cleared
              const isClearing = cell.clearing;

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`absolute ${cell.filled ? cell.color : "bg-gray-800"} border border-gray-900 ${isClearing ? "animate-pulse bg-white" : ""
                    }`}
                  style={{
                    top: `${rowIdx * 25}px`,
                    left: `${colIdx * 25}px`,
                    width: "25px",
                    height: "25px",
                    transition: "background-color 0.2s ease-in-out",
                  }}
                />
              );
            }),
          )}

          {/* Current tetromino */}
          {renderTetromino()}

          {/* Game over or paused overlay */}
          {(gameOver || isPaused) && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white">
              <h2 className="text-2xl font-bold mb-4">
                {gameOver ? "Game Over" : "Paused"}
              </h2>
              {gameOver && (
                <div className="flex flex-col items-center">
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mb-2"
                    onClick={resetGame}
                  >
                    Play Again
                  </button>
                  <p className="text-sm text-gray-300">Press Enter or Space to restart</p>
                </div>
              )}
            </div>
          )}
        </div>


        <div className="flex flex-col gap-4">
          <div className="bg-gray-800 p-4 rounded">
            <h3 className="text-lg font-semibold text-white mb-2">Next</h3>
            {renderNextTetromino()}
          </div>
          <Score score={score} level={level} lines={lines} highScore={highScore} />
          <GameControls
            onPause={togglePause}
            canPause={!(gameOver || isAnimating)}
            onReset={resetGame}
            isPaused={isPaused}
          />
          <Controls />
        </div>
      </div>

      {/* Mobile touch controls */}
      <TouchControls />
    </div>
  );
};
