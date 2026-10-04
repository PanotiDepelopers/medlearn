import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getLandingRoute } from '../../utils/authHelpers';

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
      const result = await login(username, password);
      console.log('✅ Login successful!', result);
      
      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Re-check auth to get fresh user data
      await checkAuth();
      
      // Get the user from the login response (has purchases)
      const loggedInUser = {
        studentId: result.studentId,
        username: result.username,
        hasSubscription: result.hasSubscription,
        subscription: result.subscription,
        purchases: result.purchases || []
      };
      
      // Decide where to send them
      const landingRoute = getLandingRoute(loggedInUser);
      console.log('🚀 Redirecting to:', landingRoute);
      
      // Force navigation
      window.location.href = landingRoute;
    } catch (err) {
      console.error('❌ Login error:', err);
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