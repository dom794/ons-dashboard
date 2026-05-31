export default function Header() {
  return (
    <header style={{
      width: '100%',
      backgroundColor: '#0b1f4b',
      borderBottom: '4px solid #1d4ed8',
      boxSizing: 'border-box',
    }}>

      {/* Top bar */}
      <div style={{
        backgroundColor: '#071530',
        padding: '6px 2rem',
        fontSize: 11,
        color: '#94a3b8',
        letterSpacing: '0.04em',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#22c55e',
        }} />
        OFFICIAL — PUBLIC BETA
      </div>

      {/* Main header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        maxWidth: 1400,
        margin: '0 auto',
        boxSizing: 'border-box',
        flexWrap: 'wrap',
        gap: 12,
      }}>

        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40,
            height: 40,
            backgroundColor: '#1d4ed8',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="12" width="4" height="9" fill="white" opacity="0.9"/>
              <rect x="10" y="7" width="4" height="14" fill="white" opacity="0.9"/>
              <rect x="17" y="3" width="4" height="18" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <div>
            <div style={{
              color: '#ffffff',
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}>
              UK Public Data
            </div>
            <div style={{
              color: '#93c5fd',
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}>
              Dashboard
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
        }}>
          {['Overview', 'Economy', 'Labour', 'About'].map(item => (
            
              key={item}
              href="#"
              style={{
                color: '#cbd5e1',
                fontSize: 13,
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 4,
                transition: 'background 0.15s, color 0.15s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                e.target.style.background = '#1e3a6e'
                e.target.style.color = '#ffffff'
              }}
              onMouseLeave={e => {
                e.target.style.background = 'transparent'
                e.target.style.color = '#cbd5e1'
              }}
            >
              {item}
            </a>
          ))}
        </nav>

      </div>

      {/* Page title bar */}
      <div style={{
        borderTop: '1px solid #1e3a6e',
        padding: '10px 2rem',
        maxWidth: 1400,
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        <span style={{
          color: '#93c5fd',
          fontSize: 12,
          letterSpacing: '0.03em',
        }}>
          Home &rsaquo; Economy &rsaquo; Consumer Price Inflation
        </span>
      </div>

    </header>
  )
}