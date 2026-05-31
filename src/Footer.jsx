export default function Footer() {
  const cols = [
    {
      heading: "Data sources",
      links: [
        "ONS Beta API",
        "NOMIS Labour Data",
        "data.gov.uk",
        "Environment Agency",
      ],
    },
    {
      heading: "Topics",
      links: ["Economy", "Labour market", "Population", "Health"],
    },
    {
      heading: "About",
      links: [
        "Methodology",
        "GitHub repository",
        "Report an issue",
        "Changelog",
      ],
    },
  ];

  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "#071530",
        borderTop: "4px solid #1d4ed8",
        marginTop: 64,
        boxSizing: "border-box",
      }}
    >
      {/* Main footer content */}
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "3rem 2rem 2rem",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 40,
        }}
      >
        {/* Brand column */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: "#1d4ed8",
                borderRadius: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="12"
                  width="4"
                  height="9"
                  fill="white"
                  opacity="0.9"
                />
                <rect
                  x="10"
                  y="7"
                  width="4"
                  height="14"
                  fill="white"
                  opacity="0.9"
                />
                <rect
                  x="17"
                  y="3"
                  width="4"
                  height="18"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </div>

            <span
              style={{
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              UK Public Data
            </span>
          </div>

          <p
            style={{
              color: "#64748b",
              fontSize: 12,
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            An open-source dashboard built on publicly available UK government
            data. Not affiliated with ONS or any government body.
          </p>
        </div>

        {/* Link columns */}
        {cols.map((col) => (
          <div key={col.heading}>
            <div
              style={{
                color: "#94a3b8",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              {col.heading}
            </div>

            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              {col.links.map((link) => (
                <li
                  key={link}
                  style={{
                    marginBottom: 8,
                  }}
                >
                  <a
                    href="#"
                    style={{
                      color: "#64748b",
                      fontSize: 13,
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#93c5fd";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#64748b";
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid #0f2847",
          padding: "1rem 2rem",
          maxWidth: 1400,
          margin: "0 auto",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span
          style={{
            color: "#334155",
            fontSize: 12,
          }}
        >
          © {new Date().getFullYear()} UK Public Data Dashboard. Built with
          React + ONS Beta API.
        </span>

        <span
          style={{
            color: "#334155",
            fontSize: 12,
          }}
        >
          Data © Office for National Statistics — Open Government Licence
        </span>
      </div>
    </footer>
  );
}
