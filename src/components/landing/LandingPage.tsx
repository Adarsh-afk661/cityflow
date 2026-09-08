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
            <button className="btn ghost" onClick={() => setLoginModalOpen(true)}>Log in</button>
            <button className="btn primary" onClick={() => setDemoOpen(true)}>Get a demo</button>
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--city-green)" strokeWidth="1.8">
                    <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/>
                  </svg>
                  Noida Sec 62 → Connaught Place
                </div>
                <div className="live-badge"><span className="dot"></span>Live</div>
              </div>
              <div className="veh-strip">
                <div>
                  <div className="name">Heavy delivery truck</div>
                  <div className="type">Diesel · 4.2m height class</div>
                </div>
                <div className="veh-specs">
                  <span className="mono">4.2m H</span>
                  <span className="mono">2.5m W</span>
                  <span className="mono">16t GVW</span>
                </div>
              </div>
              <div className="route-mini barred">
                <span>Route A · Vikas Marg Underpass (3.8m)</span>
                <div className="meta">
                  <span className="mono">40 min</span>
                  <span className="pill-xs barred">Barred</span>
                </div>
              </div>
              <div className="route-mini selected">
                <span>Route B · Outer Ring Beltway &amp; Flyover</span>
                <div className="meta">
                  <span className="mono">28 min</span>
                  <span className="pill-xs selected">Selected</span>
                </div>
              </div>
              <div className="route-mini" style={{ opacity: 0.65 }}>
                <span>Route C · Eco-Flow Parkway</span>
                <div className="meta">
                  <span className="mono">31 min</span>
                  <span className="pill-xs" style={{ background: 'var(--city-amber-tint)', color: 'var(--city-amber)', fontSize: '9px' }}>Eco</span>
                </div>
              </div>
              <div className="sim-map">
                <svg viewBox="0 0 400 110" width="100%">
                  <path d="M20 90 C 90 90, 110 20, 180 20 S 300 70, 340 40 S 370 15, 385 15" fill="none" stroke="var(--city-green)" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="20" cy="90" r="4" fill="var(--city-teal)"/>
                  <circle cx="385" cy="15" r="4" fill="var(--city-green)"/>
                  <circle r="4" fill="#fff" stroke="var(--city-green)" strokeWidth="2">
                    <animateMotion dur="5s" repeatCount="indefinite" path="M20 90 C 90 90, 110 20, 180 20 S 300 70, 340 40 S 370 15, 385 15"/>
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
            <span>Metroflow Logistics</span>
            <span>Harrow Freight</span>
            <span>Ashford Cold Chain</span>
            <span>Deacon Distribution</span>
            <span>Northline Carriers</span>
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
              <span>Chief dispatcher, Metroflow Logistics</span>
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
              <button onClick={() => handleLaunchPlatform('routeshield')}>RouteShield</button>
              <button onClick={() => handleLaunchPlatform('fleet')}>Fleet ops</button>
              <button onClick={() => handleLaunchPlatform('analytics')}>Analytics</button>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <button onClick={() => setDemoOpen(true)}>About</button>
              <button onClick={() => setLoginModalOpen(true)}>Careers</button>
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
