import React, {useState} from 'react';
import {useNavigate, Link} from 'react-router';
import {useAuth} from '../hooks/useAuth';
const Register = () => {
  const navigate = useNavigate ();
  const {loading, register} = useAuth ();
  const [formData, setFormData] = useState ({
    username: '',
    email: '',
    password: '',
  });
  const handleSubmit = async e => {
    e.preventDefault ();
    try {
      await register (formData);
      setFormData ({
        username: '',
        email: '',
        password: '',
      });
      navigate ('/login');
    } catch (error) {
      console.error ('Registration failed:', error);
    }
  };
  if (loading) {
    return <main><h1>Loading...</h1></main>;
  }
  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              name="username"
              onChange={e =>
                setFormData ({...formData, username: e.target.value})}
              value={formData.username}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              name="email"
              onChange={e => setFormData ({...formData, email: e.target.value})}
              value={formData.email}
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
              onChange={e =>
                setFormData ({...formData, password: e.target.value})}
              value={formData.password}
              required
            />
          </div>

          <button type="submit" className="button primary-button">
            Register
          </button>

        </form>
        <p>
          Already have an account?
          {' '}
          <Link to="/login" className="link">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
