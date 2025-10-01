import { useState, useEffect } from "react";

// ✅ Simple inline SVGs for icons
const DoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="green" viewBox="0 0 24 24">
        <path d="M20.285 6.709l-11.285 11.293-5.285-5.292 1.415-1.415 3.87 3.877 9.87-9.878z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" viewBox="0 0 24 24">
        <path d="M18.364 5.636l-1.414-1.414-5.95 5.95-5.95-5.95-1.414 1.414 5.95 5.95-5.95 5.95 1.414 1.414 5.95-5.95 5.95 5.95 1.414-1.414-5.95-5.95z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="gray" viewBox="0 0 24 24">
        <path d="M3 6l3 18h12l3-18h-18zm17-4v2h-16v-2h5.5l1-2h3l1 2h5.5z" />
    </svg>
);

export default function PaperTradeList() {
    const [trades, setTrades] = useState([]);
    const [form, setForm] = useState({
        optionType: "",
        strikePrice: "",
        premiumPrice: "",
        lotSize: 20,
    });

    // Load trades from localStorage
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("paperTrades")) || [];
        setTrades(saved);
    }, []);

    // Save trades to localStorage whenever updated
    useEffect(() => {
        localStorage.setItem("paperTrades", JSON.stringify(trades));
    }, [trades]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const addTrade = (e) => {
        e.preventDefault();

        const premium = parseFloat(form.premiumPrice);
        const lot = parseInt(form.lotSize);
        const lotSizeAmount = lot * premium;

        // Stop loss per qty (2% rule)
        const stopLossPerQty = premium - (premium * 0.02);

        // Stop loss whole
        const stopLossWhole = (premium - stopLossPerQty) * lot;

        // Target per qty = premium + (stopLossDistance * 5)
        const stopLossDistance = premium - stopLossPerQty;
        const targetPerQty = premium + (stopLossDistance * 5);

        // Profit
        const profitPerQty = targetPerQty - premium;
        const profitWhole = profitPerQty * lot;

        const newTrade = {
            id: Date.now(),
            optionType: form.optionType,
            strikePrice: form.strikePrice,
            lotSize: lotSizeAmount,
            lotSizeAmount,
            premiumPrice: premium,
            stopLossPerQty: stopLossPerQty.toFixed(2),
            targetPerQty: targetPerQty.toFixed(2),
            stopLossWhole: stopLossWhole.toFixed(2),
            profitPerQty: profitPerQty.toFixed(2),
            profitWhole: profitWhole.toFixed(2),
            status: "pending",
        };

        setTrades([...trades, newTrade]);
        setForm({ optionType: "", strikePrice: "", premiumPrice: "", lotSize: 20 });
    };


    const markStatus = (id, status) => {
        setTrades(trades.map((t) => (t.id === id ? { ...t, status } : t)));
    };

    const deleteTrade = (id) => {
        setTrades(trades.filter((t) => t.id !== id));
    };

    // 📊 Calculations
    const totalInvested = trades.reduce((acc, t) => acc + (t.lotSizeAmount || 0), 0);

    const totalProfit = trades.reduce(
        (acc, t) => acc + (t.status === "done" ? parseFloat(t.profitWhole) : 0),
        0
    );
    const totalLoss = trades.reduce(
        (acc, t) => acc + (t.status === "close" ? parseFloat(t.stopLossWhole) : 0),
        0
    );
    const finalAdjusted = totalProfit - totalLoss;

    return (
        <div style={{ padding: "2rem", margin: "0 2%" }}>
            <h1>📊 Paper Trade List</h1>

            {/* Trade Form */}
            <form onSubmit={addTrade} style={{ marginBottom: "2rem" }}>
                <input
                    type="text"
                    name="optionType"
                    placeholder="Option Type (CE/PE)"
                    value={form.optionType}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="strikePrice"
                    placeholder="Strike Price"
                    value={form.strikePrice}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="premiumPrice"
                    placeholder="Premium Price"
                    value={form.premiumPrice}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="lotSize"
                    placeholder="Lot Size"
                    value={form.lotSize}
                    onChange={handleChange}
                />
                <button type="submit">Add Trade</button>
            </form>

            {/* Trade Table */}
            <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Option Type</th>
                        <th>Strike Price</th>
                        <th>Amount</th>
                        <th>Premium Price</th>
                        <th>Stop Loss / qty</th>
                        <th>Target / qty</th>
                        <th>Stop Loss (whole)</th>
                        <th>Profit / qty</th>
                        <th>Profit (whole)</th>
                        <th>Status</th>
                        <th>Delete</th>
                    </tr>
                </thead>

                <tbody>
                    {trades.map((trade, index) => (
                        <tr key={trade.id}>
                            <td>{index + 1}</td>
                            <td>{trade.optionType}</td>
                            <td>{trade.strikePrice}</td>
                            <td>{trade.lotSize}</td>
                            <td>{trade.premiumPrice}</td>
                            <td>{trade.stopLossPerQty}</td>
                            <td>{trade.targetPerQty}</td>
                            <td>{trade.stopLossWhole}</td>
                            <td>{trade.profitPerQty}</td>
                            <td>{trade.profitWhole}</td>

                            <td>
                                {trade.status === "done" ? (
                                    <DoneIcon />
                                ) : trade.status === "close" ? (
                                    <CloseIcon />
                                ) : (
                                    <>
                                        <button onClick={() => markStatus(trade.id, "done")}>
                                            <DoneIcon />
                                        </button>
                                        <button onClick={() => markStatus(trade.id, "close")}>
                                            <CloseIcon />
                                        </button>
                                    </>
                                )}
                            </td>
                            <td>
                                <button onClick={() => deleteTrade(trade.id)}>
                                    <DeleteIcon />
                                </button>
                            </td>
                        </tr>
                    ))}

                    <tr style={{ background: "#222", color: "#fff" }}>
                        <td colSpan="4"><strong>Total Invested</strong></td>
                        <td colSpan="9"><strong>{totalInvested.toFixed(2)}</strong></td>
                    </tr>
                    <tr style={{ background: "#153", color: "#fff" }}>
                        <td colSpan="4"><strong>Total Profit (Done)</strong></td>
                        <td colSpan="9"><strong>{totalProfit.toFixed(2)}</strong></td>
                    </tr>
                    <tr style={{ background: "#511", color: "#fff" }}>
                        <td colSpan="4"><strong>Total Loss (Closed)</strong></td>
                        <td colSpan="9"><strong>{totalLoss.toFixed(2)}</strong></td>
                    </tr>
                    <tr style={{ background: "#444", color: "#fff" }}>
                        <td colSpan="4"><strong>Final Adjusted Profit</strong></td>
                        <td colSpan="9"><strong>{finalAdjusted.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}