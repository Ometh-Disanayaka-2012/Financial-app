import { useState } from "react";

// Define the structure of our AI response
interface FinanceResult {
  decision: string;
  reason: string;
  suggestion: string;
}

function App() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [purchase, setPurchase] = useState("");
  const [result, setResult] = useState<FinanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const analyze = async () => {
  if (!income || !expenses || !purchase) {
    alert("Please fill in all fields.");
    return;
  }

  setLoading(true);
  setError(null);
  setResult(null);

  // Use the new Gemini 3 Flash model name
  const API_KEY = "AIzaSyA1S2w9ibZWP38zhQfjbpYThfWfEjhdJwU"; 
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

  const promptText = `
    Income: $${income}, Expenses: $${expenses}, Purchase: $${purchase}.
    Act as a financial advisor. Can I afford this? 
    Respond ONLY in valid JSON: {"decision": "...", "reason": "...", "suggestion": "..."}
  `;

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Check your model name or API key.");
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up potential markdown formatting (```json ... ```)
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    setResult(JSON.parse(cleanJson));

  } catch (err: any) {
    console.error("Debug Error:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ textAlign: "center", color: "#333" }}>🤖 AI Financial Advisor</h1>
        <p style={{ textAlign: "center", color: "#666", fontSize: "0.9rem" }}>
          Check if that purchase fits your budget.
        </p>

        <div style={inputGroup}>
          <label style={labelStyle}>Monthly Income ($)</label>
          <input 
            style={inputStyle} 
            type="number" 
            value={income} 
            onChange={(e) => setIncome(e.target.value)} 
            placeholder="e.g. 5000"
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Monthly Expenses ($)</label>
          <input 
            style={inputStyle} 
            type="number" 
            value={expenses} 
            onChange={(e) => setExpenses(e.target.value)} 
            placeholder="e.g. 3000"
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Purchase Amount ($)</label>
          <input 
            style={inputStyle} 
            type="number" 
            value={purchase} 
            onChange={(e) => setPurchase(e.target.value)} 
            placeholder="e.g. 800"
          />
        </div>

        <button 
          onClick={analyze} 
          disabled={loading} 
          style={{ ...buttonStyle, backgroundColor: loading ? "#ccc" : "#007bff" }}
        >
          {loading ? "Calculating..." : "Analyze Budget"}
        </button>

        {error && <p style={{ color: "red", marginTop: 15 }}>{error}</p>}

        {result && (
          <div style={resultStyle}>
            <h3 style={{ marginTop: 0 }}>
              Decision: <span style={{ color: getDecisionColor(result.decision) }}>{result.decision}</span>
            </h3>
            <p><strong>Reason:</strong> {result.reason}</p>
            <p><strong>Suggestion:</strong> {result.suggestion}</p>
          </div>
        )}
        
        <p style={disclaimerStyle}>
          *Disclaimer: Not professional financial advice.
        </p>
      </div>
    </div>
  );
}

// --- Styles & Helpers ---

const getDecisionColor = (decision: string) => {
  const d = decision.toLowerCase();
  if (d.includes("yes")) return "#28a745";
  if (d.includes("no")) return "#dc3545";
  return "#ff9800";
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#f0f2f5",
  padding: "20px"
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  width: "100%",
  maxWidth: "400px"
};

const inputGroup: React.CSSProperties = {
  marginBottom: "15px"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "5px",
  fontWeight: "bold",
  fontSize: "0.85rem",
  color: "#555"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  boxSizing: "border-box"
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "1rem",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "10px"
};

const resultStyle: React.CSSProperties = {
  marginTop: "25px",
  padding: "15px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  borderLeft: "5px solid #007bff",
  lineHeight: "1.5"
};

const disclaimerStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "#999",
  marginTop: "20px",
  textAlign: "center"
};

export default App;