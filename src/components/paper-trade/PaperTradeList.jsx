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

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year
        return `${day}-${month}-${year}`;
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

        // Loss per qty
        const lossPerQty = premium - stopLossPerQty;

        const newTrade = {
            id: Date.now(),
            optionType: form.optionType,
            strikePrice: form.strikePrice,
            lotSize: lot,
            lotSizeAmount: lotSizeAmount,
            premiumPrice: premium,
            stopLossPerQty: stopLossPerQty.toFixed(2),
            targetPerQty: targetPerQty.toFixed(2),
            stopLossWhole: stopLossWhole.toFixed(2),
            profitPerQty: profitPerQty.toFixed(2),
            profitWhole: profitWhole.toFixed(2),
            lossPerQty: lossPerQty.toFixed(2),
            status: "pending",
            date: formatDate(new Date()),
        };

        console.log("New Trade:", newTrade);

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
            <form onSubmit={addTrade} style={{ marginBottom: "2rem", display: "flex", gap: '1rem' }}>

                <select
                    name="optionType"
                    value={form.optionType}
                    onChange={handleChange}
                    required
                    style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        fontSize: "16px",
                        backgroundColor: "#f9f9f9",
                        marginBottom: "10px",
                        boxSizing: "border-box",
                    }}
                >
                    <option value="" disabled>Select Option Type</option>
                    <option value="CE">CE</option>
                    <option value="PE">PE</option>
                </select>


                <input
                    type="number"
                    name="strikePrice"
                    placeholder="Strike Price"
                    value={form.strikePrice}
                    onChange={handleChange}
                    required
                    style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        fontSize: "16px",
                        backgroundColor: "#f9f9f9",
                        marginBottom: "10px",
                        // width: "100%",
                        boxSizing: "border-box",
                    }}
                />

                <input
                    type="number"
                    name="premiumPrice"
                    placeholder="Premium Price"
                    value={form.premiumPrice}
                    onChange={handleChange}
                    required
                    style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        fontSize: "16px",
                        backgroundColor: "#f9f9f9",
                        marginBottom: "10px",
                        // width: "100%",
                        boxSizing: "border-box",
                    }}
                />

                <input
                    type="number"
                    name="lotSize"
                    placeholder="Lot Size"
                    value={form.lotSize}
                    onChange={handleChange}
                    style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        fontSize: "16px",
                        backgroundColor: "#f9f9f9",
                        marginBottom: "10px",
                        // width: "100%",
                        boxSizing: "border-box",
                    }}
                />

                <button
                    type="submit"
                    style={{
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "5px",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        fontSize: "16px",
                        cursor: "pointer",
                        marginBottom: "10px",
                    }}
                >
                    Add Trade
                </button>
            </form>

            {/* Trade Table */}
            <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Date</th>
                        <th>Option</th>
                        <th>Strike Price</th>
                        <th>Amount</th>
                        <th>Premium Price</th>
                        <th>Lot Qty</th>
                        <th>Target</th>
                        <th>Stop Loss</th>
                        <th>Total Profit</th>
                        <th>Total Loss</th>
                        <th>Profit / Qty</th>
                        <th>Loss / Qty</th>
                        <th>Status</th>
                        <th>Delete</th>
                    </tr>
                </thead>

                <tbody>
                    {trades.map((trade, index) => (
                        <tr key={trade.id}>
                            <td>{index + 1}</td>
                            <td>{trade.date}</td>
                            <td>{trade.optionType}</td>
                            <td>{trade.strikePrice}</td>
                            <td>{trade.lotSizeAmount}</td>
                            <td>{trade.premiumPrice}</td>
                            <td>{trade.lotSize}</td>
                            <td>{trade.targetPerQty}</td>
                            <td>{trade.stopLossPerQty}</td>
                            <td>{trade.profitWhole}</td>
                            <td>{trade.stopLossWhole}</td>
                            <td>{trade.profitPerQty}</td>
                            <td>{trade.lossPerQty}</td>

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
                        <td colSpan="11"><strong>{totalInvested.toFixed(2)}</strong></td>
                    </tr>
                    <tr style={{ background: "#153", color: "#fff" }}>
                        <td colSpan="4"><strong>Total Profit (Done)</strong></td>
                        <td colSpan="11"><strong>{totalProfit.toFixed(2)}</strong></td>
                    </tr>
                    <tr style={{ background: "#511", color: "#fff" }}>
                        <td colSpan="4"><strong>Total Loss (Closed)</strong></td>
                        <td colSpan="11"><strong>{totalLoss.toFixed(2)}</strong></td>
                    </tr>
                    <tr style={{ background: "#444", color: "#fff" }}>
                        <td colSpan="4"><strong>Final Adjusted Profit</strong></td>
                        <td colSpan="11"><strong>{finalAdjusted.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}