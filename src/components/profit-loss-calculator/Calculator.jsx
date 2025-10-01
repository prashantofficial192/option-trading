import React, { useState, useMemo } from "react";

export default function Calculator() {
    // inputs with defaults
    const [premium, setPremium] = useState(100);
    const [lotSize, setLotSize] = useState(20);
    const [slPercent, setSlPercent] = useState(2);
    const [tpMultiplier, setTpMultiplier] = useState(5);

    // derived values (useMemo to avoid unnecessary recalcs)
    const results = useMemo(() => {
        const P = Number(premium) || 0;
        const L = Number(lotSize) || 0;
        const SLpct = Number(slPercent) || 0;
        const M = Number(tpMultiplier) || 0;

        // Stop Loss Price
        const slAmount = (SLpct / 100) * P; // absolute amount lost per qty
        const SL_Price = P - slAmount;

        // Target Price
        const TP_Price = P + slAmount * M;

        // Loss per qty (absolute)
        const Loss_Per_Qty = P - SL_Price; // same as slAmount

        // Total Loss if trade fails (for lot)
        const Total_Loss = Loss_Per_Qty * L;

        // Profit per qty
        const Profit_Per_Qty = TP_Price - P;

        // Total profit if trade succeeds (for lot)
        const Total_Profit = Profit_Per_Qty * L;

        // helpful sanity: percent values
        const Loss_Percent = (Loss_Per_Qty / P) * 100 || 0;
        const Profit_Percent = (Profit_Per_Qty / P) * 100 || 0;

        function f(n) {
            // format number: show up to 2 decimals, remove trailing zeros
            return Number.isFinite(n) ? Number(Math.round(n * 100) / 100).toFixed(2) : "0.00";
        }

        return {
            SL_Price: f(SL_Price),
            TP_Price: f(TP_Price),
            Loss_Per_Qty: f(Loss_Per_Qty),
            Total_Loss: f(Total_Loss),
            Profit_Per_Qty: f(Profit_Per_Qty),
            Total_Profit: f(Total_Profit),
            Loss_Percent: f(Loss_Percent),
            Profit_Percent: f(Profit_Percent),
        };
    }, [premium, lotSize, slPercent, tpMultiplier]);

    const reset = () => {
        setPremium(100);
        setLotSize(20);
        setSlPercent(2);
        setTpMultiplier(5);
    };

    return (
        <div className="calc-page">
            <h2>Option Profit / Loss Calculator</h2>

            <section className="panel inputs">
                <label>
                    Premium Price (₹)
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={premium}
                        onChange={(e) => setPremium(e.target.value)}
                    />
                </label>

                <label>
                    Lot Size (qty)
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={lotSize}
                        onChange={(e) => setLotSize(e.target.value)}
                    />
                </label>

                <label>
                    Stop Loss % (SL%)
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={slPercent}
                        onChange={(e) => setSlPercent(e.target.value)}
                    />
                </label>

                <label>
                    Target Multiplier (M)
                    <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={tpMultiplier}
                        onChange={(e) => setTpMultiplier(e.target.value)}
                    />
                </label>

                <div className="buttons">
                    <button type="button" onClick={reset} className="btn secondary">
                        Reset
                    </button>
                </div>
            </section>

            <section className="panel results">
                <h3>Results</h3>

                <div className="grid">
                    <div className="card">
                        <div className="label">Stop Loss Price</div>
                        <div className="value" style={{color: '#ff7b7b'}}>₹ {results.SL_Price}</div>
                        <div className="sub">Loss per qty: ₹ {results.Loss_Per_Qty} ({results.Loss_Percent}%)</div>
                    </div>

                    <div className="card">
                        <div className="label">Target Price (TP)</div>
                        <div className="value" style={{color: '#26c1e8'}}>₹ {results.TP_Price}</div>
                        <div className="sub">Profit per qty: ₹ {results.Profit_Per_Qty} ({results.Profit_Percent}%)</div>
                    </div>

                    <div className="card">
                        <div className="label">Total Loss (if trade fails)</div>
                        <div className="value" style={{color: '#ff2c2c'}}>₹ {results.Total_Loss}</div>
                        <div className="sub">For {lotSize} qty</div>
                    </div>

                    <div className="card">
                        <div className="label">Total Profit (if trade succeeds)</div>
                        <div className="value" style={{color: '#5cb85c'}}>₹ {results.Total_Profit}</div>
                        <div className="sub">For {lotSize} qty</div>
                    </div>
                </div>

                <div className="notes">
                    <strong>Formulas used:</strong>
                    <ul>
                        <li>SL Price = Premium - (SL% of Premium)</li>
                        <li>TP Price = Premium + (SL% of Premium × Multiplier)</li>
                        <li>Loss per qty = Premium - SL Price</li>
                        <li>Total Loss = Loss per qty × Lot Size</li>
                        <li>Profit per qty = TP Price - Premium</li>
                        <li>Total Profit = Profit per qty × Lot Size</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}