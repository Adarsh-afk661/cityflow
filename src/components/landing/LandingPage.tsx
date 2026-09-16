import React, { useState } from 'react';
import { DemoModal } from './DemoModal';
import { PageName, useCityFlow } from '../../context/CityFlowContext';
import './LandingPage.css';

interface LandingPageProps {
  onNavigatePlatform: (page: PageName) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigatePlatform }) => {
  const { setLoginModalOpen } = useCityFlow();
  const [demoOpen, setDemoOpen] = useState(false);

  const handleLaunchPlatform = (targetPage: PageName = 'dashboard') => {
    onNavigatePlatform(targetPage);
  };

  return (
    <div className="city-landing">

      {/* ===== Nav ===== */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-mark">C</div>CityFlow
          </div>
          <div className="nav-links">
            <button onClick={() => handleLaunchPlatform('routeshield')}>Platform</button>
            <button onClick={() => handleLaunchPlatform('routeshield')}>RouteShield</button>
            <button onClick={() => handleLaunchPlatform('analytics')}>Results</button>
            <button onClick={() => handleLaunchPlatform('fleet')}>Fleet Ops</button>
          </div>
          <div className="nav-cta">
            <button className="btn ghost" onClick={() => handleLaunchPlatform('login')}>Sign In</button>
            <button className="btn ghost" onClick={() => handleLaunchPlatform('dashboard')}>Console (Live)</button>
            <button className="btn primary" onClick={() => handleLaunchPlatform('routeshield')}>Open RouteShield</button>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow">
              <span className="dot"></span> AI-powered route intelligence for commercial fleets
            </div>
            <h1>Route every truck like you know exactly what won't fit.</h1>
            <p className="lead">
              CityFlow cross-references vehicle dimensions against bridge heights, tunnel limits, and live delay data before a route ever reaches a driver.
            </p>
            <div className="hero-ctas">
              <button className="btn primary" onClick={() => handleLaunchPlatform('routeshield')}>
                Launch RouteShield
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </button>
              <button className="btn" onClick={() => handleLaunchPlatform('dashboard')}>
                Open Command Center
              </button>
            </div>
            <div className="hero-stats">
              <div className="hstat"><b className="mono">99.8%</b><span>Clearance accuracy</span></div>
              <div className="hstat"><b className="mono">18 min</b><span>Dispatch time saved</span></div>
              <div className="hstat"><b className="mono">2,400+</b><span>Vehicles routed daily</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="decor-blob"></div>
            <div className="sim-card">
              <div className="sim-head">
                <div className="sim-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--city-green)" strokeWidth="2">
                    <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/>
                  </svg>
                  <span style={{ fontWeight: 700 }}>Delhi ➔ Greater Noida Logistics Corridor</span>
                </div>
                <div className="live-badge"><span className="dot"></span>Live GIS</div>
              </div>

              {/* Hybrid Spatial-Graph Telemetry Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 12px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: '12px',
                color: '#334155'
              }}>
                <span style={{ fontWeight: 700, color: 'var(--city-green)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>🌐</span> HYBRID SPATIAL-GRAPH
                </span>
                <span>Direct: <b>34.1 km</b> · Road: <b>42.2 km</b> · Circuity: <b style={{ color: 'var(--city-teal)' }}>1.24x</b></span>
              </div>

              <div className="veh-strip">
                <div>
                  <div className="name">Heavy Freight Commercial Carrier</div>
                  <div className="type">Diesel · 4.2m Height Class · 28t GVW</div>
                </div>
                <div className="veh-specs">
                  <span className="mono">4.2m H</span>
                  <span className="mono">2.5m W</span>
                  <span className="mono">28t GVW</span>
                </div>
              </div>

              <div className="route-mini barred">
                <span>Route A · Direct Urban Arterial (3.8m Metro Arch)</span>
                <div className="meta">
                  <span className="mono">42 min</span>
                  <span className="pill-xs barred">Barred</span>
                </div>
              </div>

              <div className="route-mini selected">
                <span>Route B · Noida-Gr. Noida Expressway &amp; Viaduct</span>
                <div className="meta">
                  <span className="mono">34 min</span>
                  <span className="pill-xs selected">Recommended</span>
                </div>
              </div>

              <div className="route-mini" style={{ opacity: 0.75 }}>
                <span>Route C · Regional Ring Viaduct Bypass (5.2m Clear)</span>
                <div className="meta">
                  <span className="mono">38 min</span>
                  <span className="pill-xs" style={{ background: 'var(--city-amber-tint)', color: 'var(--city-amber)', fontSize: '9px' }}>Eco-Flow</span>
                </div>
              </div>

              <div className="sim-map">
                <svg viewBox="0 0 420 120" width="100%">
                  {/* Subtle grid reference lines */}
                  <line x1="20" y1="95" x2="400" y2="95" stroke="#f1f5f9" strokeWidth="1.5" />
                  <line x1="20" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="3 3" />
                  {/* Recommended path in vibrant emerald */}
                  <path d="M20 95 C 100 95, 130 30, 210 30 S 320 80, 400 20" fill="none" stroke="var(--city-green)" strokeWidth="3" strokeLinecap="round"/>
                  {/* Barred path in muted rose dashed */}
                  <path d="M20 95 C 70 75, 110 85, 150 85" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" opacity="0.7"/>
                  {/* Origin pin (Delhi) */}
                  <circle cx="20" cy="95" r="5.5" fill="var(--city-teal)" stroke="#ffffff" strokeWidth="2"/>
                  <text x="20" y="112" fontSize="9.5" fontWeight="700" fill="#475569" textAnchor="middle">Delhi (Origin)</text>
                  {/* Destination pin (Greater Noida) */}
                  <circle cx="400" cy="20" r="5.5" fill="var(--city-green)" stroke="#ffffff" strokeWidth="2"/>
                  <text x="395" y="12" fontSize="9.5" fontWeight="700" fill="#166534" textAnchor="end">Greater Noida (Dest)</text>
                  {/* Animated vehicle dot moving along the expressway */}
                  <circle r="4.5" fill="#ffffff" stroke="var(--city-green)" strokeWidth="2.5">
                    <animateMotion dur="4.5s" repeatCount="indefinite" path="M20 95 C 100 95, 130 30, 210 30 S 320 80, 400 20"/>
                  </circle>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Logos ===== */}
      <div className="logos">
        <div className="wrap">
          <p>Trusted by dispatch teams at</p>
          <div className="logo-row">
            <span>Delhi-NCR Express Logistics</span>
            <span>Harrow Freight India</span>
            <span>Ashford Cold Chain</span>
            <span>Deacon Intermodal</span>
            <span>Northline Fleet Carriers</span>
          </div>
        </div>
      </div>

      {/* ===== Features ===== */}
      <section id="features">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Platform</p>
            <h2>Built around the truck, not just the map.</h2>
            <p className="desc">
              Most routing tools optimize for time. CityFlow starts with what the vehicle physically can and can't do, then layers in traffic, weather, and cost.
            </p>
          </div>
          <div className="feature-grid">
            <div className="feature" onClick={() => handleLaunchPlatform('routeshield')}>
              <div className="feature-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--city-green)" strokeWidth="1.8">
                  <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/>
                </svg>
              </div>
              <h3>Physical clearance checks</h3>
              <p>Height, width, length, and gross weight are checked against every bridge and load limit before a route is offered.</p>
            </div>
            <div className="feature" onClick={() => handleLaunchPlatform('routeshield')}>
              <div className="feature-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--city-green)" strokeWidth="1.8">
                  <path d="M3 12h4l2-7 4 14 2-7h6"/>
                </svg>
              </div>
              <h3>Predictive delay scoring</h3>
              <p>Congestion, incident patterns, and weather are combined into a single delay-risk score, updated as conditions change.</p>
            </div>
            <div className="feature" onClick={() => handleLaunchPlatform('routeshield')}>
              <div className="feature-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--city-green)" strokeWidth="1.8">
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.7 21a2 2 0 01-3.4 0"/>
                </svg>
              </div>
              <h3>Automatic barring</h3>
              <p>Corridors that violate a vehicle's physical limits are removed automatically — never shown to a driver by mistake.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="stats" id="stats">
        <div className="wrap">
          <div className="section-head center">
            <p className="kicker">Results</p>
            <h2>What changes for a dispatch team</h2>
          </div>
          <div className="stats-grid">
            <div className="stat"><b className="mono">31%</b><span>Fewer missed clearances</span></div>
            <div className="stat"><b className="mono">18 min</b><span>Time saved per route plan</span></div>
            <div className="stat"><b className="mono">2,400+</b><span>Vehicles routed daily</span></div>
            <div className="stat"><b className="mono">99.2%</b><span>Clearance accuracy</span></div>
          </div>
        </div>
      </section>

      {/* ===== Quote ===== */}
      <section className="quote">
        <div className="wrap">
          <blockquote>
            "We used to find out a route didn't clear when a driver called from under a bridge. Now RouteShield catches it before the truck leaves the yard."
          </blockquote>
          <div className="quote-person">
            <div className="quote-avatar">RK</div>
            <div>
              <b>Reema Kapoor</b>
              <span>Chief Dispatcher, Delhi-NCR Freight Logistics</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section>
        <div className="cta">
          <h2>See it on your own corridors.</h2>
          <p>We'll load your vehicle classes and a real route from your network before the call.</p>
          <div className="cta-btns">
            <button className="btn primary" onClick={() => setDemoOpen(true)}>Get a demo</button>
            <button className="btn outline" onClick={() => handleLaunchPlatform('routeshield')}>Launch RouteShield</button>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer id="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="brand">
                <div className="brand-mark">C</div>CityFlow
              </div>
              <p>Vehicle-aware routing for fleet operators who can't afford a route that doesn't clear.</p>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <button onClick={() => handleLaunchPlatform('login')}>Operator Sign In</button>
              <button onClick={() => handleLaunchPlatform('routeshield')}>RouteShield</button>
              <button onClick={() => handleLaunchPlatform('fleet')}>Fleet ops</button>
              <button onClick={() => handleLaunchPlatform('analytics')}>Analytics</button>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <button onClick={() => setDemoOpen(true)}>About</button>
              <button onClick={() => handleLaunchPlatform('settings')}>Careers</button>
              <button onClick={() => setDemoOpen(true)}>Contact</button>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <button onClick={() => handleLaunchPlatform('settings')}>Docs</button>
              <button onClick={() => handleLaunchPlatform('settings')}>Status</button>
              <button onClick={() => setDemoOpen(true)}>Support</button>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 CityFlow Technologies</span>
            <span>Delhi-NCR Metropolitan Network</span>
          </div>
        </div>
      </footer>

      {/* Interactive Demo Modal */}
      <DemoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
      />
    </div>
  );
};
