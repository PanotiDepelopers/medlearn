import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getLandingRoute } from '../../utils/authHelpers';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, checkAuth, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const landingRoute = getLandingRoute(user);
      navigate(landingRoute, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(username, password);

      await new Promise(resolve => setTimeout(resolve, 300));
      await checkAuth();

      const loggedInUser = {
        studentId: result.studentId,
        username: result.username,
        hasSubscription: result.hasSubscription,
        subscription: result.subscription,
        purchases: result.purchases || []
      };

      const landingRoute = getLandingRoute(loggedInUser);
      window.location.href = landingRoute;
    } catch (err) {
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