export default function ResultCard({ price, min, max, confidence }) {
  return (
    <div
      style={{
        marginTop: "24px",
        padding: "24px",
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        maxWidth: "600px",
      }}
    >
      <h3>Estimated Price</h3>
      <h1 style={{ color: "#2563eb", marginBottom: "8px" }}>₹ {price} Lakhs</h1>

      {min && max && (
        <p style={{ color: "#6b7280", margin: "0 0 16px 0" }}>
          Range: ₹{min} - ₹{max} Lakhs
        </p>
      )}

      {confidence && (
        <div style={{ background: "#f0fdf4", color: "#166534", padding: "8px", borderRadius: "4px", display: "inline-block", fontSize: "0.9rem", marginBottom: "16px" }}>
          Confidence: {confidence * 100}%
        </div>
      )}

      <hr style={{ borderColor: "#ececec" }} />

      <h4 style={{ marginTop: "16px" }}>Interested in this property?</h4>
      <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
        Connect with a verified real estate agent for more details.
      </p>

      <button style={{
        marginTop: "12px",
        background: "#111827",
        color: "white",
        padding: "10px 20px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer"
      }}>Contact Agent</button>
    </div>
  );
}
