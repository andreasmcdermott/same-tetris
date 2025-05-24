
const formatter = new Intl.NumberFormat("en-US");

export function Score({ score, highScore, level, lines }: { score: number; highScore: number; level: number; lines: number }) {
  return <div className="bg-gray-800 p-4 rounded">
    <div className="mb-2">
      <h3 className="text-sm font-semibold text-gray-300">Score</h3>
      <p className="text-2xl font-bold text-white">
        {formatter.format(score)}
      </p>
    </div>
    <div className="mb-2">
      <h3 className="text-sm font-semibold text-gray-300">
        High Score
      </h3>
      <p className="text-xl font-bold text-white">
        {formatter.format(highScore)}
      </p>
    </div>
    <div className="mb-2">
      <h3 className="text-sm font-semibold text-gray-300">Level</h3>
      <p className="text-xl font-bold text-white">{level}</p>
    </div>
    <div className="mb-2">
      <h3 className="text-sm font-semibold text-gray-300">Lines</h3>
      <p className="text-xl font-bold text-white">{lines}</p>
    </div>
  </div>
}