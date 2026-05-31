{
  /* Nav links */
}
<nav
  style={{
    display: "flex",
    gap: 4,
    flexWrap: "wrap",
  }}
>
  {["Overview", "Economy", "Labour", "About"].map((item) => (
    <a
      key={item}
      href="#"
      style={{
        color: "#cbd5e1",
        fontSize: 13,
        textDecoration: "none",
        padding: "6px 14px",
        borderRadius: 4,
        transition: "background 0.15s, color 0.15s",
        letterSpacing: "0.01em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#1e3a6e";
        e.currentTarget.style.color = "#ffffff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#cbd5e1";
      }}
    >
      {item}
    </a>
  ))}
</nav>;
