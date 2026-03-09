// PATH: app/not-found.tsx
// Custom 404 page — place at app/not-found.tsx

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 · Olympeaks</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root {
            --bg: #F4F2EE; --surface: #FAFAF8; --border: #E2DFD8;
            --text: #0F0F0D; --text-muted: #5A574F; --text-subtle: #888480;
            --gold: #B8953D; --gold-dim: #B8953D14; --terra: #B86840; --olive: #5C7040;
            --font-display: 'Cormorant Garamond', Georgia, serif;
            --font-body: 'DM Sans', system-ui, sans-serif;
            --font-mono: 'DM Mono', 'Courier New', monospace;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0A0A08; --surface: #141412; --border: #383832;
              --text: #F2F0EB; --text-muted: #B8B4AA; --text-subtle: #8A867E;
              --gold: #C8A84E; --terra: #C47848; --olive: #748A52;
            }
          }
          body {
            background: var(--bg); color: var(--text);
            font-family: var(--font-body);
            min-height: 100dvh;
            display: flex; flex-direction: column;
          }

          /* Greek key border pattern */
          .greek-border {
            height: 3px;
            background: linear-gradient(90deg,
              transparent 0%, var(--gold) 15%,
              var(--gold) 20%, transparent 20%,
              transparent 25%, var(--gold) 25%,
              var(--gold) 30%, transparent 30%,
              transparent 70%, var(--gold) 70%,
              var(--gold) 75%, transparent 75%,
              transparent 80%, var(--gold) 80%,
              var(--gold) 85%, transparent 100%
            );
            opacity: 0.5;
          }

          .container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 24px;
            position: relative;
            overflow: hidden;
          }

          /* Grid background */
          .container::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image:
              linear-gradient(var(--border) 1px, transparent 1px),
              linear-gradient(90deg, var(--border) 1px, transparent 1px);
            background-size: 52px 52px;
            opacity: 0.3;
          }

          /* Gold glow */
          .container::after {
            content: '';
            position: absolute;
            top: 20%; left: 50%;
            transform: translateX(-50%);
            width: 500px; height: 300px;
            background: radial-gradient(ellipse, var(--gold-dim) 0%, transparent 70%);
            pointer-events: none;
          }

          .content {
            position: relative;
            z-index: 1;
            text-align: center;
            max-width: 480px;
          }

          .logo-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 52px;
          }
          .logo-name {
            font-family: var(--font-display);
            font-size: 15px;
            font-weight: 600;
            color: var(--text);
            letter-spacing: 0.02em;
          }

          .code {
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--gold);
            letter-spacing: 0.2em;
            text-transform: uppercase;
            margin-bottom: 16px;
          }

          h1 {
            font-family: var(--font-display);
            font-size: clamp(48px, 10vw, 80px);
            font-weight: 300;
            font-style: italic;
            letter-spacing: -0.03em;
            line-height: 1;
            color: var(--text);
            margin-bottom: 20px;
          }

          h1 span { color: var(--gold); }

          .subtitle {
            font-size: 15px;
            color: var(--text-muted);
            line-height: 1.7;
            margin-bottom: 40px;
          }

          .divider {
            width: 120px;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--border), var(--gold), var(--border), transparent);
            margin: 0 auto 40px;
            opacity: 0.6;
          }

          .actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--gold);
            color: #0A0A08;
            border: none;
            border-radius: 8px;
            font-family: var(--font-body);
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.02em;
            cursor: pointer;
            text-decoration: none;
            transition: opacity 0.15s;
          }
          .btn-primary:hover { opacity: 0.88; }

          .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: transparent;
            color: var(--text-muted);
            border: 1px solid var(--border);
            border-radius: 8px;
            font-family: var(--font-body);
            font-size: 13px;
            font-weight: 400;
            cursor: pointer;
            text-decoration: none;
            transition: border-color 0.15s, color 0.15s;
          }
          .btn-secondary:hover { border-color: var(--gold); color: var(--text); }

          .footer-text {
            margin-top: 64px;
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--text-subtle);
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }
        `}</style>
      </head>
      <body>
        <div className="greek-border" />

        <div className="container">
          <div className="content">

            {/* Logo */}
            <div className="logo-row">
              <svg width="22" height="20" viewBox="0 0 28 26" fill="none">
                <polygon points="14,1 27,25 1,25" fill="none" stroke="#B8953D" strokeWidth="1.2" strokeLinejoin="round"/>
                <polygon points="14,8 21,25 7,25" fill="#B8953D" opacity="0.15"/>
                <line x1="14" y1="1" x2="14" y2="25" stroke="#B8953D" strokeWidth="0.8" opacity="0.4"/>
              </svg>
              <span className="logo-name">Olympeaks</span>
            </div>

            <p className="code">Error 404</p>

            <h1>Off <span>Course</span></h1>

            <p className="subtitle">
              This route doesn't exist — even the best athletes<br />
              take a wrong turn sometimes.
            </p>

            <div className="divider" />

            <div className="actions">
              <a href="/" className="btn-primary">
                ← Back to dashboard
              </a>
              <a href="/login" className="btn-secondary">
                Sign in
              </a>
            </div>

            <p className="footer-text">Data · Discipline · Peak Performance</p>
          </div>
        </div>

        <div className="greek-border" />
      </body>
    </html>
  );
}