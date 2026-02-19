import { useRef, useState, useCallback } from 'react';
import RabbitCanvas from './RabbitCanvas';
import { exportGif, exportJpeg } from './gifExport';

function App() {
  const canvasRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState('');

  const handleExportGif = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    setProgress('Preparation des frames...');
    try {
      // Small delay so the UI updates before heavy work
      await new Promise((r) => setTimeout(r, 50));
      setProgress('Generation du GIF...');
      await exportGif();
    } catch (err) {
      console.error('GIF export failed:', err);
    } finally {
      setExporting(false);
      setProgress('');
    }
  }, [exporting]);

  const handleExportJpeg = useCallback(() => {
    if (!canvasRef.current) return;
    exportJpeg(canvasRef.current);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden">
      <RabbitCanvas canvasRef={canvasRef} />

      {/* Hint text */}
      <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
        <p className="text-sm text-gray-300 font-light tracking-wide">
          Touche le lapin !
        </p>
      </div>

      {/* Export buttons */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-10 px-4">
        <button
          onClick={handleExportGif}
          disabled={exporting}
          className="px-5 py-2.5 rounded-full bg-pink-100 text-pink-600 text-sm font-medium
                     border border-pink-200 transition-all duration-200
                     hover:bg-pink-200 hover:border-pink-300
                     active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'Generation...' : 'Telecharger GIF'}
        </button>
        <button
          onClick={handleExportJpeg}
          disabled={exporting}
          className="px-5 py-2.5 rounded-full bg-gray-50 text-gray-500 text-sm font-medium
                     border border-gray-200 transition-all duration-200
                     hover:bg-gray-100 hover:border-gray-300
                     active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Telecharger JPEG
        </button>
      </div>

      {/* Loader overlay during GIF generation */}
      {exporting && (
        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-20">
          <div className="w-10 h-10 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-3" />
          <p className="text-sm text-pink-400 font-medium">{progress}</p>
        </div>
      )}
    </div>
  );
}

export default App;
