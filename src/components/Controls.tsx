export function Controls() {
  return (
    <div className="bg-gray-800 p-4 rounded text-white text-sm hidden sm:block">
      <h3 className="font-semibold mb-1">Controls:</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>← → : Move</li>
        <li>↓ : Soft Drop</li>
        <li>↑ : Rotate</li>
        <li>Space : Hard Drop</li>
        <li>P/Esc : Pause</li>
      </ul>
    </div>
  );
}
