const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SECRET } = require('../middleware/auth');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password, role, secret, skills = [] } = req.body;
        
        // Input validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        
        if (!validatePassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        
        if (!['customer', 'technician', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        
        // Admin secret verification
        if (role === 'admin' && secret !== ADMIN_SECRET) {
            return res.status(403).json({ message: 'Invalid admin secret' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        
        // Hash password
        const hashed = await bcrypt.hash(password, 10);
        const approved = role !== 'technician';
        
        // Create user
        const user = new User({ 
            name, 
            email,
            phone: phone || '',
            password: hashed, 
            role, 
            approved, 
            skills: role === 'technician' ? skills : [] 
        });
        await user.save();
        
        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '7d' });
        
        console.log(`✅ New user registered: ${email} (${role}) - Phone: ${phone || 'Not provided'}`);
        res.status(201).json({ 
            token, 
            user: {
                id: user._id,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'customer',
                approved: user.approved !== undefined ? user.approved : true,
                skills: user.skills || [],
                createdAt: user.createdAt
            },
            message: role === 'technician' ? 'Account created. Awaiting admin approval.' : 'Account created successfully!'
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error during signup', error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Check if technician is approved
        if (user.role === 'technician' && !user.approved) {
            return res.status(403).json({ message: 'Your account is pending admin approval' });
        }
        
        // Generate toke
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '7d' });
        
        console.log(`✅ User logged in: ${email}`);
        res.json({ 
            token, 
            user: {
                id: user._id,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'customer',
                approved: user.approved !== undefined ? user.approved : true,
                skills: user.skills || [],
                createdAt: user.createdAt
            },
            message: 'Login successful'
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login', error: err.message });
    }
});

module.exports = router;
