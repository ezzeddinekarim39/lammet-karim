import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://lammet-api.onrender.com/api/login', { username, password });
      if(res.data.success) {
        localStorage.setItem('isAdmin', 'true');
        navigate('/dashboard');
      }
    } catch (err) {
      setError("Incorrect Username or Password");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-icon">
          <FaLock />
        </div>
        <h2>Admin Portal</h2>
        <p>Please log in to manage your store.</p>

        {error && <div style={{background:'#ffeaea', color:'red', padding:'10px', borderRadius:'5px', marginBottom:'15px', fontSize:'0.9rem'}}>{error}</div>}

        <div style={{textAlign: 'left', marginBottom: '15px'}}>
          <label style={{fontWeight:'600', fontSize:'0.9rem', color:'#555'}}>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{marginTop: '5px'}}
            placeholder="Enter username"
          />
        </div>

        <div style={{textAlign: 'left', marginBottom: '25px'}}>
          <label style={{fontWeight:'600', fontSize:'0.9rem', color:'#555'}}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{marginTop: '5px'}}
            placeholder="Enter password"
          />
        </div>

        <button onClick={handleLogin} className="btn-login">
          Login to Dashboard
        </button>

        <p style={{marginTop: '30px', fontSize: '0.8rem'}}>
          <a href="/" style={{color: '#999', textDecoration:'none'}}>← Back to Lammet Karim Store</a>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;