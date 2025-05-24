export function GameControls({
  isPaused,
  canPause,
  onPause,
  onReset,
}: {
  isPaused: boolean;
  canPause: boolean;
  onPause: () => void;
  onReset: () => void;
}) {
  return (
    <div className="bg-gray-800 p-4 rounded">
      <button
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded mb-2"
        onClick={onPause}
        disabled={!canPause}
      >
        {isPaused ? "Resume" : "Pause"}
      </button>
      <button
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded"
        onClick={onReset}
      >
        New Game
      </button>
    </div>
  );
}
