import React from 'react';
import { AlertOctagon, RefreshCw, Terminal } from 'lucide-react';

interface Props {
  error: string;
}

export const ErrorState: React.FC<Props> = ({ error }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-pine-bg">
      <div className="max-w-lg w-full bg-pine-panel border border-risk-high/40 rounded-xl p-6 shadow-modal space-y-4">
        <div className="flex items-center gap-3 text-risk-high">
          <AlertOctagon className="w-8 h-8 shrink-0" />
          <div>
            <h2 className="text-lg font-serif font-bold text-pine-text">
              Data Pipeline Ingestion Error
            </h2>
            <p className="text-xs font-mono text-risk-high">
              Unable to load spatial data matrix: /public/data.json
            </p>
          </div>
        </div>

        <div className="bg-pine-bg p-3.5 rounded border border-pine-border font-mono text-xs text-pine-muted leading-relaxed">
          <div className="text-pine-text font-bold mb-1">Diagnostic Log:</div>
          <p className="text-risk-high break-all">{error}</p>
        </div>

        <div className="bg-pine-elevated p-3.5 rounded border border-pine-border text-xs space-y-2">
          <div className="flex items-center gap-2 font-mono text-pine-accent">
            <Terminal className="w-4 h-4" />
            <span>Resolution Steps:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-pine-muted font-mono text-[11px]">
            <li>Verify datasets in <code className="text-pine-text bg-pine-bg px-1 py-0.5 rounded">data/raw/</code></li>
            <li>Run ingestion: <code className="text-pine-accent bg-pine-bg px-1 py-0.5 rounded">python scripts/build_data.py</code></li>
            <li>Check that <code className="text-pine-text bg-pine-bg px-1 py-0.5 rounded">public/data.json</code> is accessible</li>
          </ol>
        </div>

        <button
          onClick={handleReload}
          className="w-full py-2.5 px-4 bg-pine-accent hover:bg-emerald-400 text-pine-bg font-mono font-bold text-xs rounded transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>RETRY PIPELINE CONNECTION</span>
        </button>
      </div>
    </div>
  );
};
