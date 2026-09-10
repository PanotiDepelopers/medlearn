import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📤 Submitting login form...');
      await login(username, password);
      console.log('✅ Login successful!');
      
      // Force a fresh auth check
      console.log('🔄 Re-checking auth...');
      await checkAuth();
      
      // Navigate to home
      console.log('🚀 Navigating to home...');
      navigate('/');
      // Force reload to ensure app state is fresh
      window.location.href = '/';
    } catch (err) {
      console.error('❌ Login error in form:', err);
      setError(err.message || 'Invalid username or password.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <i className="fas fa-heartbeat"></i>
          <h1>MedLearn</h1>
          <p>Secure Medical Education Platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username"><i className="fas fa-user"></i> Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password"><i className="fas fa-lock"></i> Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        {error && <div className="login-error show">{error}</div>}
      </div>
    </div>
  );
};

export default Login;