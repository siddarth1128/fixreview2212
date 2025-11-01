const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { verifyToken, verifyRole } = require('../middleware/auth');

// All customer routes require authentication and customer role
router.use(verifyToken);
router.use(verifyRole('customer'));

// GET /api/customer/technicians - Get all approved technicians
router.get('/technicians', async (req, res) => {
    try {
        const { search, category, available } = req.query;
        let query = { role: 'technician', approved: true };
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        if (category) {
            query.skills = { $in: [category] };
        }
        
        if (available === 'true') {
            query.available = true;
        }
        
        const technicians = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json(technicians);
    } catch (err) {
        console.error('Error fetching technicians:', err);
        res.status(500).json({ message: 'Error fetching technicians', error: err.message });
    }
});

// GET /api/customer/technician/:id - Get specific technician profile
router.get('/technician/:id', async (req, res) => {
    try {
        const tech = await User.findById(req.params.id)
            .select('-password')
            .populate('reviews.from', 'name');
        
        if (!tech || tech.role !== 'technician' || !tech.approved) {
            return res.status(404).json({ message: 'Technician not found' });
        }
        
        res.json(tech);
    } catch (err) {
        console.error('Error fetching technician:', err);
        res.status(500).json({ message: 'Error fetching technician', error: err.message });
    }
});

// POST /api/customer/book - Create new booking
router.post('/book', async (req, res) => {
    try {
        const { techId, description, scheduledDate, address, images } = req.body;
        
        if (!techId || !description) {
            return res.status(400).json({ message: 'Technician and description are required' });
        }
        
        // Verify technician exists and is approved
        const tech = await User.findById(techId);
        if (!tech || tech.role !== 'technician' || !tech.approved) {
            return res.status(400).json({ message: 'Invalid or unapproved technician' });
        }
        
        const booking = new Booking({ 
            customer: req.user.id, 
            tech: techId, 
            description,
            scheduledDate: scheduledDate || Date.now(),
            address: address || '',
            images: images || []
        });
        await booking.save();
        
        console.log(`✅ New booking created:`);
        console.log(`   Customer: ${req.user.id}`);
        console.log(`   Technician: ${techId}`);
        console.log(`   Booking ID: ${booking._id}`);
        console.log(`   Description: ${description}`);
        console.log(`   Images: ${images ? images.length : 0} uploaded`);
        
        res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).json({ message: 'Error creating booking', error: err.message });
    }
});

// GET /api/customer/bookings - Get customer's bookings
router.get('/bookings', async (req, res) => {
    try {
        const { filter } = req.query;
        let query = { customer: req.user.id };
        
        if (filter && filter !== 'all') {
            query.status = filter;
        }
        
        const bookings = await Booking.find(query)
            .populate('tech', 'name email phone skills')
            .populate('customer', 'name email')
            .sort({ createdAt: -1 })
            .lean();
        
        console.log(`✅ Fetched ${bookings.length} bookings for customer ${req.user.id}`);
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        console.error('Stack:', err.stack);
        res.status(500).json({ message: 'Error fetching bookings', error: err.message });
    }
});

// PUT /api/customer/cancel/:id - Cancel booking
router.put('/cancel/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized for this booking' });
        }
        
        if (booking.status === 'completed') {
            return res.status(400).json({ message: 'Cannot cancel a completed booking' });
        }
        
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking already cancelled' });
        }
        
        booking.status = 'cancelled';
        booking.updatedAt = Date.now();
        await booking.save();
        
        console.log(`✅ Booking ${req.params.id} cancelled`);
        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        console.error('Cancel booking error:', err);
        res.status(500).json({ message: 'Error cancelling booking', error: err.message });
    }
});

// POST /api/customer/review/:id - Submit review for completed booking
router.post('/review/:id', async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const booking = await Booking.findById(req.params.id).populate('tech');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
        }
        
        // Check if already reviewed (review object exists AND has a rating)
        if (booking.review && booking.review.rating) {
            return res.status(400).json({ message: 'Already reviewed' });
        }
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }
        
        // Add review to booking
        booking.review = { rating, comment: comment || '', createdAt: Date.now() };
        await booking.save();
        
        // Also add review to technician's profile
        const technician = await User.findById(booking.tech._id);
        if (technician) {
            technician.reviews.push({
                rating,
                comment: comment || '',
                from: req.user.id,
                createdAt: Date.now()
            });
            technician.updatedAt = Date.now();
            await technician.save();
            console.log(`✅ Review added to technician ${technician.name}'s profile`);
        }
        
        console.log(`✅ Review submitted for booking ${req.params.id}`);
        res.json({ message: 'Review submitted successfully' });
    } catch (err) {
        console.error('Review error:', err);
        res.status(500).json({ message: 'Error submitting review', error: err.message });
    }
});

// DELETE /api/customer/bookings/clear - Clear all customer's booking history
router.delete('/bookings/clear', async (req, res) => {
    try {
        const result = await Booking.deleteMany({ customer: req.user.id });
        
        console.log(`✅ Cleared ${result.deletedCount} bookings for customer ${req.user.id}`);
        res.json({ 
            message: 'All booking history cleared successfully', 
            deletedCount: result.deletedCount 
        });
    } catch (err) {
        console.error('Clear history error:', err);
        res.status(500).json({ message: 'Error clearing booking history', error: err.message });
    }
});

// POST /api/customer/booking/:id/pay - Process payment for a booking
router.post('/booking/:id/pay', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        if (booking.payment === 'completed') {
            return res.status(400).json({ message: 'Payment already completed' });
        }
        
        // Update payment status
        booking.payment = 'completed';
        booking.updatedAt = Date.now();
        await booking.save();
        
        console.log(`✅ Payment completed for booking ${req.params.id}`);
        res.json({ message: 'Payment successful', booking });
    } catch (err) {
        console.error('Error processing payment:', err);
        res.status(500).json({ message: 'Error processing payment', error: err.message });
    }
});

// GET /api/customer/booking/:id - Get single booking details
router.get('/booking/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('tech', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        if (booking.customer._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }
        
        res.json(booking);
    } catch (err) {
        console.error('Error fetching booking:', err);
        res.status(500).json({ message: 'Error fetching booking', error: err.message });
    }
});

// GET /api/customer/booking/:id/messages - Get chat messages for a booking
router.get('/booking/:id/messages', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        res.json(booking.messages || []);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ message: 'Error fetching messages', error: err.message });
    }
});

// POST /api/customer/booking/:id/message - Send a message
router.post('/booking/:id/message', async (req, res) => {
    try {
        const { message } = req.body;
        const booking = await Booking.findById(req.params.id).populate('customer', 'name');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        if (booking.customer._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }
        
        booking.messages.push({
            sender: 'customer',
            senderName: booking.customer.name,
            message: message.trim(),
            timestamp: Date.now()
        });
        
        booking.updatedAt = Date.now();
        await booking.save();
        
        console.log(`💬 Message sent by customer in booking ${req.params.id}`);
        res.json({ message: 'Message sent successfully', messages: booking.messages });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ message: 'Error sending message', error: err.message });
    }
});

module.exports = router;
