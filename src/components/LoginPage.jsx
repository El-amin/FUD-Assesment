import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Sparkles, ChevronRight } from 'lucide-react';
import { isSupabaseConfigured } from '../supabaseClient';

export default function LoginPage({ users, onLogin, onChangePassword, dbError }) {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'lecturer'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password reset flow states
  const [pendingUser, setPendingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeError, setChangeError] = useState('');

  // Form Submission Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    // Locate user in local roster
    const match = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === activeTab
    );

    if (match) {
      const typedPass = password.trim();
      const dbPass = match.password || 'password123';
      
      if (dbPass === typedPass) {
        const isFirst = match.is_first_login !== false && match.isFirstLogin !== false;
        if (isFirst) {
          setPendingUser(match);
          setNewPassword('');
          setConfirmPassword('');
          setChangeError('');
        } else {
          onLogin(match);
        }
      } else {
        setErrorMsg('Incorrect password. Please try again.');
      }
    } else {
      setErrorMsg(`Invalid credentials. Check email or role (Sign In as ${activeTab.toUpperCase()}).`);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangeError('');

    if (newPassword.length < 6) {
      setChangeError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError('Passwords do not match.');
      return;
    }

    try {
      await onChangePassword(pendingUser.id, newPassword);
      
      // Complete login with updated state
      const updatedUser = {
        ...pendingUser,
        password: newPassword,
        is_first_login: false,
        isFirstLogin: false
      };
      onLogin(updatedUser);
    } catch (err) {
      setChangeError(err.message || 'Failed to change password. Try again.');
    }
  };

  // Populate Demo credentials quickly
  const handleQuickFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setActiveTab(demoRole);
    setErrorMsg('');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-app)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background abstract circles for premium style */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(10, 92, 54, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
        top: '-10%',
        left: '-10%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(223, 177, 25, 0.08) 0%, rgba(0, 0, 0, 0) 70%)',
        bottom: '-15%',
        right: '-10%',
        zIndex: 0
      }} />

      {/* Main Login Card */}
      <div className="card login-card">
        
        {/* Left Column: Branding banner */}
        <div className="login-banner">
          {/* Subtle watermark lines */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            opacity: 0.04,
            backgroundImage: 'radial-gradient(circle, white 2px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />

          {/* Top Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--secondary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'black',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              fontFamily: 'var(--font-title)'
            }}>
              F
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', lineHeight: '1.2' }}>FUD Dutse</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Federal University Dutse
              </span>
            </div>
          </div>

          {/* Middle text illustration */}
          <div className="login-banner-middle" style={{ margin: '40px 0' }}>
            <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '12px' }}>
              Academic Portal Gate
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' }}>
              Sign in to manage course lists, continuous assessments, publish timed quizzes, upload group project reports, and review roster spreadsheets.
            </p>
          </div>

          {/* Bottom guidelines footer */}
          <div className="login-banner-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
            © {new Date().getFullYear()} Federal University Dutse. All rights reserved.
          </div>
        </div>

        {/* Right Column: Active sign-in forms */}
        <div className="login-form-container">
          
          <div>
            {/* Header Title */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-title)' }}>Portal Authentication</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Secure access to academic grading resources</p>
            </div>

            {/* DB Error Instruction Alert Banner */}
            {dbError && (
              <div style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid rgba(220, 38, 38, 0.15)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                lineHeight: '1.4',
                marginBottom: '16px',
                fontWeight: '500'
              }}>
                <strong style={{ display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  PostgreSQL Access Denied
                </strong>
                The app successfully connected to your Supabase credentials, but the database rejected API requests:
                <div style={{ fontFamily: 'monospace', margin: '6px 0', padding: '6px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {dbError}
                </div>
                To authorize the app, please go to your **Supabase SQL Editor**, paste this command and run it:
                <div style={{ fontFamily: 'monospace', margin: '6px 0', padding: '6px', backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: '4px', fontSize: '0.75rem', userSelect: 'all', overflowX: 'auto' }}>
                  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated; GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
                </div>
              </div>
            )}

            {/* Role Switcher Tabs */}
            {!pendingUser && (
              <div className="login-tabs">
                <button
                  type="button"
                  onClick={() => { setActiveTab('student'); setErrorMsg(''); }}
                  className={`login-tab-btn ${activeTab === 'student' ? 'active' : ''}`}
                >
                  Student Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('lecturer'); setErrorMsg(''); }}
                  className={`login-tab-btn ${activeTab === 'lecturer' ? 'active' : ''}`}
                >
                  Staff / Lecturer
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('admin'); setErrorMsg(''); }}
                  className={`login-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                >
                  Administrator
                </button>
              </div>
            )}

            {/* Error Message */}
            {!pendingUser && errorMsg && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.15)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                {errorMsg}
              </div>
            )}

            {pendingUser ? (
              /* Change Password Form (Forced on First Login) */
              <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(10, 92, 54, 0.08)',
                  color: 'var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  lineHeight: '1.4',
                  fontWeight: '600'
                }}>
                  🔒 Welcome, {pendingUser.name}! Since this is your first sign-in, you must change your password.
                </div>

                {changeError && (
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    border: '1px solid rgba(220, 38, 38, 0.15)',
                    color: 'var(--color-danger)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {changeError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">New Password (min 6 characters)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => setPendingUser(null)} 
                    style={{ flexGrow: 1, padding: '12px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flexGrow: 2, padding: '12px' }}
                  >
                    Change Password & Enter
                  </button>
                </div>
              </form>
            ) : (
              /* Regular Login Form */
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">
                    {activeTab === 'student' ? 'Registration Number' : 'Academic Email'}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder={
                        activeTab === 'student'
                          ? 'e.g. FUD/CSC/22/1001'
                          : activeTab === 'lecturer'
                            ? 'staff@fud.edu.ng'
                            : 'admin@fud.edu.ng'
                      }
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{ paddingLeft: '40px', paddingRight: '40px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                  Sign In to Portal
                  <ChevronRight size={18} />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
