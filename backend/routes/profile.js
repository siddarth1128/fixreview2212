const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// All profile routes require authentication
router.use(verifyToken);

// Helper function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

// GET /api/profile - Get user profile
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
});

// PUT /api/profile - Update user profile
router.put('/', async (req, res) => {
    try {
        const { name, email, phone, address, experience, skills, bio } = req.body;
        const update = { updatedAt: Date.now() };
        
        if (name) update.name = name;
        
        if (email) {
            if (!validateEmail(email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existing) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            update.email = email;
        }
        
        if (phone) update.phone = phone;
        if (address) update.address = address;
        if (experience) update.experience = experience;
        if (bio) update.bio = bio;
        
        if (skills) {
            update.skills = Array.isArray(skills) 
                ? skills 
                : skills.split(',').map(s => s.trim()).filter(s => s);
        }
        
        const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
        console.log(`✅ Profile updated: ${req.user.id}`);
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
});

// PUT /api/profile/password - Change password
router.put('/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password required' });
        }
        
        if (!validatePassword(newPassword)) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }
        
        const user = await User.findById(req.user.id);
        const isValid = await bcrypt.compare(currentPassword, user.password);
        
        if (!isValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        user.password = await bcrypt.hash(newPassword, 10);
        user.updatedAt = Date.now();
        await user.save();
        
        console.log(`✅ Password changed for user: ${req.user.id}`);
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({ message: 'Error changing password', error: err.message });
    }
});

module.exports = router;
