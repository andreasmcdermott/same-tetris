import { GameBoard } from './GameBoard';

export const TetrisGame = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          React Tetris
        </h1>
        <p className="text-gray-400 mt-2 text-center">
          The classic game built with React
        </p>
      </header>

      <main className="flex-1 flex items-start justify-center">
        <GameBoard />
      </main>

      <footer className="mt-8 text-gray-500 text-sm text-center">
        <p>
          Use arrow keys to move, Up to rotate, Space to hard drop, P to pause
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} React Tetris Game
        </p>
      </footer>
    </div>
  );
};
