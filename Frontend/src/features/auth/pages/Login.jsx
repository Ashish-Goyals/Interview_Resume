import React, {useState} from 'react';
import './auth.form.scss';
import {useNavigate, Link} from 'react-router';
import {useAuth} from '../hooks/useAuth';
const Login = () => {
  const navigate = useNavigate ();
  const {loading, login} = useAuth ();
  const [email, setEmail] = useState ('');
  const [password, setPassword] = useState ('');

  const handleSubmit = async e => {
    e.preventDefault ();
    await login ({email, password});
    setEmail ('');
    setPassword ('');
    navigate ('/');
  };
  if (loading) {
    return <main><h1>Loading...</h1></main>;
  }
  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              name="email"
              onChange={e => setEmail (e.target.value)}
              value={email}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              onChange={e => setPassword (e.target.value)}
              value={password}
              required
            />
          </div>

          <button type="submit" className="button primary-button">Login</button>

        </form>

        <p>
          Don't have an account?
          {' '}
          <Link to="/register" className="link">Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
