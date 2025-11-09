import React, { useState } from 'react';

const Login = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clearing errors when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('🔄 Attempting login with:', formData.email, formData.password);
      
      // Import ParkBest API
      const { parkbestAPI } = await import('../services/parkbestAPI');
      
      const result = await parkbestAPI.login(formData.email, formData.password);
      console.log('📋 Login result:', result);

      if (result.success) {
        console.log('✅ Login successful, token:', result.data.token);
        console.log('✅ Admin data:', result.data.admin);
        
        localStorage.setItem('adminToken', result.data.token);
        
        // Ensure admin data has required fields
        const adminData = {
          id: result.data.admin.id,
          username: result.data.admin.username,
          name: result.data.admin.username, // Use username as name
          role: result.data.admin.role
        };
        
        console.log('✅ Calling onLogin with:', adminData);
        onLogin(adminData);
      } else {
        console.error('❌ Login failed:', result.message);
        setErrors({ general: result.message || 'Login failed' });
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    }

    setIsLoading(false);
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    },
    card: {
      background: 'white',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      width: '100%',
      maxWidth: '400px'
    },
    title: {
      textAlign: 'center',
      color: '#1f2937',
      marginBottom: '30px',
      fontSize: '28px',
      fontWeight: 'bold'
    },
    inputGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#374151',
      //fontWeight: '500'
      fontWeight: 'bold'
      
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s, box-shadow 0.3s'
    },
    inputError: {
      borderColor: '#ef4444',
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '14px',
      marginTop: '5px'
    },
    button: {
      width: '100%',
      padding: '14px',
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.3s'
    },
    buttonLoading: {
      background: '#9ca3af',
      cursor: 'not-allowed'
    },
    switchText: {
      textAlign: 'center',
      marginTop: '20px',
      color: '#6b7280'
    },
    switchLink: {
      color: '#3b82f6',
      cursor: 'pointer',
      fontWeight: '500'
    },
    demoAccounts: {
      background: '#f3f4f6',
      padding: '15px',
      borderRadius: '8px',
      marginTop: '20px',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏢 ParkBest Admin</h1>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {})
              }}
              placeholder="Enter your username"
            />
            {errors.email && <div style={styles.errorText}>{errors.email}</div>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {})
              }}
              placeholder="Enter your password"
            />
            {errors.password && <div style={styles.errorText}>{errors.password}</div>}
          </div>

          {errors.general && (
            <div style={{...styles.errorText, textAlign: 'center', marginBottom: '15px'}}>
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonLoading : {})
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.demoAccounts}>
          <strong>Demo Account:</strong>
          <p>Username: admin</p>
          <p>Password: admin123</p>
          <p style={{fontSize: '12px', color: '#6b7280', marginTop: '8px'}}>Or create a new admin account</p>
        </div>

        <div style={styles.switchText}>
          Don't have an account?{' '}
          <span 
            style={styles.switchLink}
            onClick={onSwitchToSignup}
          >
            Sign up here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;