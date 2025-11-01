const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { verifyToken, verifyRole } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(verifyRole('admin'));

// GET /api/admin/pending-technicians
router.get('/pending-technicians', async (req, res) => {
    try {
        const pending = await User.find({ role: 'technician', approved: false });
        res.json(pending);
    } catch (err) {
        console.error('Error fetching pending technicians:', err);
        res.status(500).json({ message: 'Error fetching pending technicians', error: err.message });
    }
});

// PUT /api/admin/approve/:id
router.put('/approve/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.role !== 'technician') {
            return res.status(400).json({ message: 'Not a technician' });
        }
        
        user.approved = true;
        user.updatedAt = Date.now();
        await user.save();
        
        console.log(`✅ Technician approved: ${user.email}`);
        res.json({ message: 'Technician approved successfully', user });
    } catch (err) {
        console.error('Error approving technician:', err);
        res.status(500).json({ message: 'Error approving technician', error: err.message });
    }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};
        
        if (role) {
            query.role = role;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};
        
        if (status) {
            query.status = status;
        }
        
        const bookings = await Booking.find(query)
            .populate('customer', 'name email phone')
            .populate('tech', 'name email phone skills')
            .sort({ createdAt: -1 });
        
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ message: 'Error fetching bookings', error: err.message });
    }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        // Get counts
        const totalUsers = await User.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalTechnicians = await User.countDocuments({ role: 'technician' });
        const approvedTechnicians = await User.countDocuments({ role: 'technician', approved: true });
        const pendingTechnicians = await User.countDocuments({ role: 'technician', approved: false });
        
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const inProgressBookings = await Booking.countDocuments({ status: 'in-progress' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
        
        // Calculate revenue
        const revenueData = await Booking.aggregate([
            { $match: { status: 'completed', price: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
        
        // Get today's bookings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayBookings = await Booking.countDocuments({
            createdAt: { $gte: today }
        });
        
        res.json({
            users: {
                total: totalUsers,
                customers: totalCustomers,
                technicians: totalTechnicians,
                approvedTechnicians,
                pendingTechnicians
            },
            bookings: {
                total: totalBookings,
                pending: pendingBookings,
                inProgress: inProgressBookings,
                completed: completedBookings,
                cancelled: cancelledBookings,
                today: todayBookings
            },
            revenue: {
                total: totalRevenue,
                average: completedBookings > 0 ? (totalRevenue / completedBookings).toFixed(2) : 0
            }
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ message: 'Error fetching statistics', error: err.message });
    }
});

// DELETE /api/admin/user/:id
router.delete('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Don't allow deleting admins
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin users' });
        }
        
        await User.findByIdAndDelete(req.params.id);
        
        console.log(`✅ User deleted: ${user.email}`);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
});

module.exports = router;
