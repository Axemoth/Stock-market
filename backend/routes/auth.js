const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes'
});

const kotakLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 Kotak login attempts per hour
  message: 'Too many Kotak login attempts, please try again after an hour'
});

// Utility function to validate Kotak token
const isKotakTokenValid = async (token) => {
  try {
    const response = await axios.get('https://developers.kotaksecurities.com/apim/validate', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': process.env.KOTAK_API_KEY
      }
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};


// User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName,
        lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    
    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.user_metadata?.first_name,
        lastName: data.user.user_metadata?.last_name
      },
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User logout
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});
// Kotak API login
router.post('/kotak-login', authenticateUser, kotakLimiter, async (req, res) => {
  try {
    const { clientId, password } = req.body;

    if (!clientId || !password) {
      return res.status(400).json({ error: 'Client ID and password are required' });
    }

    // Hit Kotak Login API
    const response = await axios.post(
      'https://developers.kotaksecurities.com/apim/login',
      { clientId, password },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.KOTAK_API_KEY
        }
      }
    );

    const { data } = response;
    const kotakToken = data?.token;

    if (!kotakToken) {
      throw new Error('Invalid response from Kotak API');
    }

    // Validate the token
    const isValid = await isKotakTokenValid(kotakToken);
    if (!isValid) {
      throw new Error('Invalid Kotak token received');
    }

    // Store token in both session and Supabase user metadata
    req.session.kotakToken = kotakToken;

    // Update user metadata in Supabase with Kotak token
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        kotak_token: kotakToken,
        kotak_client_id: clientId,
        kotak_last_login: new Date().toISOString()
      }
    });

    if (updateError) {
      console.error('Error updating user metadata:', updateError);
    }

    res.json({
      message: 'Kotak login successful',
      token: kotakToken
    });
  } catch (error) {
    console.error('Kotak login error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Kotak login failed', 
      message: error.response?.data?.message || error.message 
    });
  }
});


// Get current user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    const { data, error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName
      }
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName,
        lastName
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Check Kotak token validity
router.get('/kotak-status', authenticateUser, async (req, res) => {
  try {
    // Check token in session first
    let kotakToken = req.session.kotakToken;

    // If not in session, try to get from Supabase metadata
    if (!kotakToken) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error) {
        kotakToken = user.user_metadata?.kotak_token;
      }
    }

    if (!kotakToken) {
      return res.status(401).json({ error: 'No Kotak token found' });
    }

    const isValid = await isKotakTokenValid(kotakToken);
    res.json({ 
      isValid,
      lastLogin: user.user_metadata?.kotak_last_login
    });
  } catch (error) {
    console.error('Kotak status check error:', error);
    res.status(500).json({ error: 'Failed to check Kotak token status' });
  }
});

// Refresh Kotak token
router.post('/kotak-refresh', authenticateUser, async (req, res) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const clientId = user.user_metadata?.kotak_client_id;

    if (!clientId) {
      return res.status(400).json({ error: 'No Kotak client ID found' });
    }

    // Call Kotak refresh token API
    const response = await axios.post(
      'https://developers.kotaksecurities.com/apim/refresh',
      { clientId },
      {
        headers: {
          'Authorization': `Bearer ${req.session.kotakToken || user.user_metadata?.kotak_token}`,
          'x-api-key': process.env.KOTAK_API_KEY
        }
      }
    );

    const newToken = response.data?.token;

    // Update token in both session and Supabase
    req.session.kotakToken = newToken;
    await supabase.auth.updateUser({
      data: {
        kotak_token: newToken,
        kotak_last_login: new Date().toISOString()
      }
    });

    res.json({ 
      message: 'Kotak token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Kotak token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh Kotak token' });
  }
});

module.exports = router;