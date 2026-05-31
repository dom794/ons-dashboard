export default function Header() {
  const navItems = ["Test1", "Test2", "Test3", "Test4"];

  return (
    <header
      style={{
        width: "100%",
        backgroundColor: "#0b1f4b",
        borderBottom: "4px solid #1d4ed8",
        boxSizing: "border-box",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          backgroundColor: "#071530",
          padding: "6px 2rem",
          fontSize: 11,
          color: "#94a3b8",
          letterSpacing: "0.04em",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#22c55e",
          }}
        />
        OFFICIAL — PUBLIC BETA
      </div>

      {/* Main header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 2rem",
          maxWidth: 1400,
          margin: "0 auto",
          boxSizing: "border-box",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Title */}
        <div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            UK Public Data
          </div>
          <div
            style={{
              color: "#93c5fd",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Dashboard
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              style={{
                color: "#cbd5e1",
                fontSize: 13,
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 6,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1e3a6e";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#cbd5e1";
              }}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
