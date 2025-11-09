import React, { useState } from 'react';
//import { supabase } from './lib/supabase';


const Signup = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    company: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Import ParkBest API
      const { parkbestAPI } = await import('../services/parkbestAPI');
      
      const result = await parkbestAPI.register(formData.fullName, formData.password);
      
      if (result.success) {
        const userData = {
          id: result.data.admin.id,
          name: formData.fullName,
          username: result.data.admin.username,
          role: result.data.admin.role
        };
        
        onSignup(userData);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    }

    setIsLoading(false);
  };  


 {/*
 function Signup() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');

    // Step 1: Sign up the user using Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, phone_number: phone }, // store in user metadata
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Signup successful! Please check your email to verify your account.');
    }
  };
  */}

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    },
    card: {
      background: 'white',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      width: '100%',
      maxWidth: '450px',
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
      background: '#10b981',
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
      color: '#10b981',
      cursor: 'pointer',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>PARKBEST ADMIN REGISTRATION</h1>
        <p style={{textAlign: 'center', color: '#6b7280', marginBottom: '30px', fontWeight: 'bold'}}>
          Create your ParkBest admin account
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
             onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.fullName ? styles.inputError : {})
              }}
              placeholder="Choose a username"
            />
            {errors.fullName && <div style={styles.errorText}>{errors.fullName}</div>}
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
              placeholder="Create a password"
            />
            {errors.password && <div style={styles.errorText}>{errors.password}</div>}
          </div> 

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.confirmPassword ? styles.inputError : {})
              }}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <div style={styles.errorText}>{errors.confirmPassword}</div>}
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.switchText}>
          Already have an account?{' '}
          <span 
            style={styles.switchLink}
            onClick={onSwitchToLogin}
          >
            Sign in here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;