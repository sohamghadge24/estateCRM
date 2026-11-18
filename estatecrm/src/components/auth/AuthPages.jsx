import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../common/Icons';

export const AuthPages = () => {
  const { login, register } = useAuth();
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset' | 'verify'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [loginEmail, setLoginEmail] = useState('admin@estatecrm.com');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAgency, setRegAgency] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!loginEmail || !loginPassword) {
        throw new Error('Please enter both email and password');
      }
      const success = await login(loginEmail, loginPassword);
      if (!success) throw new Error('Invalid credentials');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!regFullName || !regEmail || !regPassword) {
        throw new Error('Please fill in all mandatory fields');
      }
      if (regPassword !== regConfirmPassword) {
        throw new Error('Passwords do not match');
      }
      await register({
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        agencyName: regAgency || `${regFullName}'s Agency`,
        password: regPassword,
      });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your registered email address');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(`If an account exists for ${forgotEmail}, a secure password reset link has been dispatched.`);
    }, 600);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Your password has been securely updated. You can now log in.');
      setView('login');
    }, 600);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--color-background)' }}>
      {/* ── Left Side: Brand Visual & Product Introduction ── */}
      <div style={{
        flex: '1 1 48%',
        background: 'linear-gradient(145deg, #161A1D 0%, #0B090A 100%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '52px 64px',
        position: 'relative',
        overflow: 'hidden',
      }} className="auth-hero-banner">
        {/* Subtle architectural background accents */}
        <div style={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(235,94,40,0.14) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--color-primary)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: 18,
              color: '#FFFFFF'
            }}>E</div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', display: 'block' }}>EstateCRM</span>
              <span style={{ fontSize: 11, color: '#A4A099', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Enterprise Operating System</span>
            </div>
          </div>

          <div style={{ maxWidth: 440 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              color: '#EB5E28',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EB5E28' }} />
              GovTrack360 Design Architecture
            </span>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'var(--font-weight-semibold, 600)',
              lineHeight: 1.18,
              letterSpacing: '-0.025em',
              marginBottom: 20,
              fontFamily: 'var(--font-sans)'
            }}>
              Workforce Intelligence & Real Estate CRM.
            </h1>
            <p style={{ color: '#CCC5B9', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 32 }}>
              Unified property inventory, verified client relationships, sales pipelines, and multi-tenant agency administration built with uncompromising security.
            </p>
          </div>
        </div>

        {/* Feature Highlights Card */}
        <div style={{
          zIndex: 1,
          background: 'rgba(37, 36, 34, 0.65)',
          border: '1px solid rgba(204, 197, 185, 0.15)',
          borderRadius: 14,
          padding: '20px 24px',
          backdropFilter: 'blur(10px)',
          maxWidth: 460,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(235, 94, 40, 0.15)',
              color: '#EB5E28',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}>
              <Icon name="shield" size={22} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', marginBottom: 2 }}>
                Row-Level Tenant Isolation & RERA Compliance
              </p>
              <p style={{ fontSize: 11, color: '#A4A099', margin: 0, lineHeight: 1.4 }}>
                Multi-tenant encryption, strict role-based scopes, and continuous audit trails for every transaction.
              </p>
            </div>
          </div>
        </div>

        <div style={{ zIndex: 1, fontSize: 11, color: '#777168', display: 'flex', justifyContent: 'space-between' }}>
          <span>© 2026 EstateCRM Inc. All rights reserved.</span>
          <span>v1.0 Blueprint Edition</span>
        </div>
      </div>

      {/* ── Right Side: Interactive Authentication Form ── */}
      <div style={{
        flex: '1 1 52%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        background: 'var(--color-background)',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Header Switcher */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="eyebrow" style={{ color: 'var(--color-primary)' }}>SECURE GATEWAY</span>
              {view !== 'login' && (
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                  style={{ background: 'none', color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  ← Back to Login
                </button>
              )}
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              {view === 'login' && 'Sign in to EstateCRM'}
              {view === 'register' && 'Create Agency Account'}
              {view === 'forgot' && 'Reset your password'}
              {view === 'reset' && 'Set new password'}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
              {view === 'login' && 'Enter your verified credentials to access your agency workspace.'}
              {view === 'register' && 'Onboard your brokerage or property consultancy in minutes.'}
              {view === 'forgot' && 'Enter your registered work email to receive single-use reset instructions.'}
              {view === 'reset' && 'Create a strong, unique password for your account.'}
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 8,
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 20,
              border: '1px solid rgba(186, 24, 27, 0.2)',
            }}>
              <Icon name="alertCircle" size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 8,
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 20,
              border: '1px solid rgba(36, 112, 68, 0.2)',
            }}>
              <Icon name="checkCircle" size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── View 1: Login ── */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Work Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@agency.com"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 14px 0 38px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      fontSize: 13,
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <div style={{ position: 'absolute', left: 12, top: 13, color: 'var(--color-muted)' }}>
                    <Icon name="mail" size={16} />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError(''); }}
                    style={{ background: 'none', color: 'var(--color-primary)', fontSize: 11, fontWeight: 600 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 40px 0 38px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      fontSize: 13,
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <div style={{ position: 'absolute', left: 12, top: 13, color: 'var(--color-muted)' }}>
                    <Icon name="lock" size={16} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{ position: 'absolute', right: 12, top: 13, background: 'none', color: 'var(--color-muted)' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  Remember session for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 44,
                  borderRadius: 8,
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 6,
                  transition: 'background 150ms ease',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Authenticating...' : 'Sign in to Workspace'}
                {!loading && <Icon name="arrowRight" size={16} />}
              </button>

              <div style={{
                marginTop: 20,
                padding: '14px',
                borderRadius: 8,
                background: '#F5F3F4',
                border: '1px solid var(--color-border)',
                fontSize: 11,
                color: 'var(--color-text-secondary)',
              }}>
                <span style={{ fontWeight: 700, display: 'block', marginBottom: 4, color: 'var(--color-text-primary)' }}>
                  Demo Access Credentials:
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', marginBottom: 2 }}>
                  <span>Agency Admin:</span>
                  <strong>admin@estatecrm.com</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
                  <span>Platform Super Admin:</span>
                  <strong>superadmin@estatecrm.com</strong>
                </div>
              </div>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8 }}>
                Don't have an agency workspace yet?{' '}
                <button
                  type="button"
                  onClick={() => { setView('register'); setError(''); setSuccessMsg(''); }}
                  style={{ background: 'none', color: 'var(--color-primary)', fontWeight: 700 }}
                >
                  Create one now
                </button>
              </p>
            </form>
          )}

          {/* ── View 2: Register ── */}
          {view === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Alexander Wright"
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="alex@agency.com"
                    style={{
                      width: '100%',
                      height: 40,
                      padding: '0 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    style={{
                      width: '100%',
                      height: 40,
                      padding: '0 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                  Agency / Brokerage Name *
                </label>
                <input
                  type="text"
                  required
                  value={regAgency}
                  onChange={(e) => setRegAgency(e.target.value)}
                  placeholder="e.g. Apex Horizon Capital"
                  style={{
                    width: '100%',
                    height: 40,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    style={{
                      width: '100%',
                      height: 40,
                      padding: '0 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    style={{
                      width: '100%',
                      height: 40,
                      padding: '0 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 44,
                  borderRadius: 8,
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 13,
                  marginTop: 8,
                }}
              >
                {loading ? 'Creating Workspace...' : 'Provision Agency Workspace'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); }}
                  style={{ background: 'none', color: 'var(--color-primary)', fontWeight: 700 }}
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}

          {/* ── View 3: Forgot Password ── */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@agency.com"
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    fontSize: 13,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 44,
                  borderRadius: 8,
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {loading ? 'Dispatching Instructions...' : 'Send Recovery Link'}
              </button>

              <button
                type="button"
                onClick={() => { setView('reset'); }}
                style={{ background: 'none', color: 'var(--color-text-secondary)', fontSize: 12, textAlign: 'center' }}
              >
                Have a reset token? Enter it here →
              </button>
            </form>
          )}

          {/* ── View 4: Reset Password ── */}
          {view === 'reset' && (
            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Single-Use Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="e.g. rst_92810481"
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    fontSize: 13,
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters with numbers & symbols"
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 8,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    fontSize: 13,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 44,
                  borderRadius: 8,
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

