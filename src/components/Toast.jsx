export default function Toast({ msg, color }) {
  if (!msg) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        left: 20,
        maxWidth: 340,
        marginLeft: "auto",
        background: color || "#238636",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: 8,
        fontSize: 15,
        fontWeight: 600,
        zIndex: 200,
        animation: "slideUp 0.3s ease",
      }}
    >
      {msg}
    </div>
  );
}
