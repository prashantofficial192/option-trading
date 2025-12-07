// src/components/GannNumber.jsx
import { useState } from "react";

const DEFAULT_STEP_SETS = {
  "Intraday (tight)": [-0.5, -0.25, 0, 0.25, 0.5],
  "Intraday (standard)": [-2, -1, -0.5, -0.25, 0, 0.25, 0.5, 1, 2],
  "Very tight (scalping)": [-0.5, -0.25, -0.125, 0, 0.125, 0.25, 0.5],
};

const formatNumber = (n) =>
  typeof n === "number" ? n.toLocaleString("en-IN", { maximumFractionDigits: 4 }) : n;

const GannNumber = () => {
  const [priceInput, setPriceInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [stepPreset, setStepPreset] = useState("Intraday (standard)");
  const [rounding, setRounding] = useState("round"); // "round" | "floor" | "ceil"

  // Main calculation
  const calculateGannLevels = () => {
    setError("");
    setResult(null);

    if (!priceInput || !priceInput.toString().trim()) {
      setError("Please enter a valid index price (e.g. 85698 or 85698.25).");
      return;
    }

    // Clean input: strip commas and spaces, then match optional sign + digits + optional decimal part
    const cleanedMatch = priceInput.toString().replace(/,/g, "").match(/-?\d+(\.\d+)?/);
    if (!cleanedMatch) {
      setError("Input must be a number (digits, optional single decimal point).");
      return;
    }

    const price = parseFloat(cleanedMatch[0]);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a positive numeric index price.");
      return;
    }

    // Keep decimals in sqrt
    const sqrtVal = Math.sqrt(price);

    // Choose step set from preset
    const steps = DEFAULT_STEP_SETS[stepPreset] ?? DEFAULT_STEP_SETS["Intraday (standard)"];

    // Build levels
    const levels = steps.map((step) => {
      const root = sqrtVal + step;
      const levelRaw = root * root;
      // rounding method applied to final level for plotting on typical charts
      let levelRounded;
      if (rounding === "floor") levelRounded = Math.floor(levelRaw);
      else if (rounding === "ceil") levelRounded = Math.ceil(levelRaw);
      else levelRounded = Math.round(levelRaw);

      return {
        step,
        root: Number(root.toFixed(6)),
        levelRaw: Number(levelRaw.toFixed(6)),
        levelRounded,
        diffFromPrice: Number((levelRaw - price).toFixed(4)),
      };
    });

    // Sort ascending so table shows lower -> higher
    levels.sort((a, b) => a.levelRaw - b.levelRaw);

    setResult({
      originalInput: priceInput,
      normalizedPrice: price,
      sqrtVal: Number(sqrtVal.toFixed(8)),
      levels,
    });
  };

  // CSV export
  const makeCSV = () => {
    if (!result) return "";
    const headers = ["Step", "Root (√price + step)", "Level (precise)", "Level (rounded)", "Diff from price"];
    const rows = result.levels.map((r) => [
      r.step,
      r.root,
      r.levelRaw,
      r.levelRounded,
      r.diffFromPrice,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    return csv;
  };

  const copyCSVToClipboard = async () => {
    try {
      const csv = makeCSV();
      if (!csv) return;
      await navigator.clipboard.writeText(csv);
      alert("CSV copied to clipboard — paste into TradingView or your sheet.");
    } catch (err) {
      console.error(err);
      alert("Unable to copy. Try selecting and copying manually.");
    }
  };

  const downloadCSV = () => {
    const csv = makeCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `gann-levels-${(new Date()).toISOString().slice(0,19).replace(/[:T]/g,"-")}.csv`;
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setPriceInput("");
    setResult(null);
    setError("");
  };

  return (
    <>
      <div className="gann-container" role="region" aria-label="Gann Number Calculator">
        <h2 className="gann-title">Gann Number Calculator</h2>

        <div className="gann-input-section">
          <label htmlFor="indexPrice" className="gann-label">
            Enter current index price:
          </label>
          <input
            id="indexPrice"
            type="text"
            inputMode="decimal"
            className="gann-input"
            placeholder="e.g. 85698 or 85698.25"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            aria-describedby="price-help"
          />

          <label htmlFor="stepPreset" className="gann-label" style={{ marginLeft: 6 }}>
            Preset:
          </label>
          <select
            id="stepPreset"
            value={stepPreset}
            onChange={(e) => setStepPreset(e.target.value)}
            className="gann-input"
            style={{ minWidth: 220 }}
          >
            {Object.keys(DEFAULT_STEP_SETS).map((k) => (
              <option key={k} value={k}>
                {k} — {DEFAULT_STEP_SETS[k].join(", ")}
              </option>
            ))}
          </select>

          <label htmlFor="rounding" className="gann-label" style={{ marginLeft: 6 }}>
            Rounding:
          </label>
          <select
            id="rounding"
            value={rounding}
            onChange={(e) => setRounding(e.target.value)}
            className="gann-input"
            style={{ minWidth: 120 }}
          >
            <option value="round">Round</option>
            <option value="floor">Floor</option>
            <option value="ceil">Ceil</option>
          </select>

          <div style={{ display: "flex", gap: 8, marginLeft: 6 }}>
            <button className="gann-button" onClick={calculateGannLevels}>
              Calculate Gann Levels
            </button>
            <button
              className="gann-button gann-ghost"
              onClick={clearAll}
              title="Clear all fields"
            >
              Clear
            </button>
          </div>
        </div>

        <div id="price-help" style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 8px" }}>
          Enter a positive number. Commas are allowed (e.g. 85,698) and decimals (e.g. 85698.25).
          Use <strong>Intraday</strong> presets for tighter levels.
        </div>

        {error && <div className="gann-error" role="alert">{error}</div>}

        {result && (
          <div className="gann-result-section" aria-live="polite">
            <div className="gann-summary">
              <p>
                <strong>Raw input:</strong> {result.originalInput}
              </p>
              <p>
                <strong>Normalized price:</strong> {formatNumber(result.normalizedPrice)}
              </p>
              <p>
                <strong>Square root of price:</strong> {formatNumber(result.sqrtVal)}
              </p>
              <p className="gann-note" style={{ marginTop: 6 }}>
                Levels shown use the preset <strong>{stepPreset}</strong>. The "Level (rounded)"
                column is what most traders plot as horizontal lines.
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button className="gann-button" onClick={copyCSVToClipboard}>
                Copy CSV
              </button>
              <button className="gann-button" onClick={downloadCSV}>
                Download CSV
              </button>
            </div>

            <table className="gann-table" aria-label="Gann levels table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Root (√price + step)</th>
                  <th>Level (precise)</th>
                  <th>Level (rounded)</th>
                  <th>Diff from price</th>
                </tr>
              </thead>
              <tbody>
                {result.levels.map((row) => {
                  const isBase = Math.abs(row.step) < 1e-9; // step === 0
                  return (
                    <tr key={String(row.step)} className={isBase ? "gann-table-row base-root-row" : "gann-table-row"}>
                      <td>{row.step}</td>
                      <td>{formatNumber(row.root)}</td>
                      <td>{formatNumber(row.levelRaw)}</td>
                      <td className={isBase ? "base-level-cell" : ""}>{row.levelRounded.toLocaleString()}</td>
                      <td>{(row.diffFromPrice >= 0 ? "+" : "") + formatNumber(row.diffFromPrice)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSS (preserved + small tweaks) */}
      <style>{`
        .gann-container {
          max-width: 920px;
          margin: 2rem auto;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #1f2937;
          background: #020617;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          color: #e5e7eb;
        }

        .gann-title {
          margin: 0 0 1rem;
          font-size: 1.5rem;
          font-weight: 600;
          text-align: left;
          color: #f9fafb;
        }

        .gann-input-section {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .gann-label {
          font-size: 0.95rem;
          color: #cbd5f5;
        }

        .gann-input {
          min-width: 160px;
          padding: 0.45rem 0.6rem;
          border-radius: 8px;
          border: 1px solid #374151;
          font-size: 0.95rem;
          outline: none;
          background: #020617;
          color: #f9fafb;
        }

        .gann-input::placeholder { color: #6b7280; }

        .gann-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
          background: #030712;
        }

        .gann-button {
          padding: 0.5rem 0.95rem;
          border-radius: 999px;
          border: none;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #6366f1, #22c55e);
          color: #ffffff;
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.12);
        }

        .gann-button.gann-ghost {
          background: transparent;
          border: 1px solid #374151;
          color: #e5e7eb;
          box-shadow: none;
        }

        .gann-button:hover { transform: translateY(-1px); }

        .gann-error {
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          background: rgba(248, 113, 113, 0.12);
          color: #fecaca;
          font-size: 0.9rem;
          border: 1px solid rgba(248, 113, 113, 0.7);
        }

        .gann-result-section {
          margin-top: 1rem;
        }

        .gann-summary {
          margin-bottom: 0.8rem;
          font-size: 0.95rem;
          color: #e5e7eb;
        }

        .gann-summary p { margin: 0.12rem 0; }

        .gann-note {
          margin-top: 0.4rem;
          font-size: 0.85rem;
          color: #9ca3af;
        }

        .gann-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.75rem;
          font-size: 0.92rem;
          background: #020617;
          border-radius: 10px;
          overflow: hidden;
        }

        .gann-table th, .gann-table td {
          padding: 0.5rem 0.6rem;
          border: 1px solid #0f172a;
          text-align: center;
          vertical-align: middle;
        }

        .gann-table th {
          font-weight: 700;
          color: #e5e7eb;
          background: rgba(255,255,255,0.02);
        }

        .gann-table-row { background: #020617; }

        .base-root-row {
          background: linear-gradient(90deg, rgba(20,83,45,0.06), rgba(2,6,23,0.02));
        }

        .base-level-cell {
          font-weight: 700;
          color: #f97316;
        }

        @media (max-width: 780px) {
          .gann-container { margin: 1rem; padding: 1rem; }
          .gann-input { min-width: 120px; }
          .gann-table th, .gann-table td { font-size: 0.78rem; padding: 0.4rem; }
        }
      `}</style>
    </>
  );
};

export default GannNumber;