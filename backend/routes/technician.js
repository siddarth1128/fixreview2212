const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { verifyToken, verifyRole } = require('../middleware/auth');

// All technician routes require authentication and technician role
router.use(verifyToken);
router.use(verifyRole('technician'));

// GET /api/technician/status - Check approval status
router.get('/status', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error('Error fetching status:', err);
        res.status(500).json({ message: 'Error fetching status', error: err.message });
    }
});

// GET /api/technician/jobs - Get all technician's jobs
router.get('/jobs', async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = { tech: req.user.id };
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (search) {
            query.description = { $regex: search, $options: 'i' };
        }
        
        console.log(`🔍 Fetching jobs for technician: ${req.user.id}`);
        console.log('Query:', JSON.stringify(query));
        
        const jobs = await Booking.find(query)
            .populate('customer', 'name email phone address')
            .sort({ createdAt: -1 })
            .lean();
        
        console.log(`✅ Found ${jobs.length} jobs for technician ${req.user.id}`);
        res.json(jobs);
    } catch (err) {
        console.error('Error fetching jobs:', err);
        console.error('Stack:', err.stack);
        res.status(500).json({ message: 'Error fetching jobs', error: err.message });
    }
});

// PUT /api/technician/start/:id - Start a job
router.put('/start/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        if (booking.tech.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized for this booking' });
        }
        
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Job already started or completed' });
        }
        
        booking.status = 'in-progress';
        booking.startedAt = Date.now();
        booking.updatedAt = Date.now();
        await booking.save();
        
        console.log(`✅ Job ${req.params.id} started`);
        res.json({ message: 'Job started successfully', booking });
    } catch (err) {
        console.error('Error starting job:', err);
        res.status(500).json({ message: 'Error starting job', error: err.message });
    }
});

// PUT /api/technician/complete/:id - Complete a job
router.put('/complete/:id', async (req, res) => {
    try {
        const { price, notes } = req.body;
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        if (booking.tech.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized for this booking' });
        }
        
        if (booking.status === 'completed') {
            return res.status(400).json({ message: 'Job already completed' });
        }
        
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot complete cancelled job' });
        }
        
        booking.status = 'completed';
        booking.payment = 'completed';
        booking.price = price || 0;
        booking.notes = notes || '';
        booking.completedDate = Date.now();
        booking.updatedAt = Date.now();
        await booking.save();
        
        console.log(`✅ Job ${req.params.id} completed with price $${price}`);
        res.json({ message: 'Job completed successfully', booking });
    } catch (err) {
        console.error('Error completing job:', err);
        res.status(500).json({ message: 'Error completing job', error: err.message });
    }
});

// POST /api/technician/job/:id/receipt - Send receipt to customer
router.post('/job/:id/receipt', async (req, res) => {
    try {
        const { laborCost, materialCost, additionalCharges, totalAmount, timeSpent, notes } = req.body;
        const booking = await Booking.findById(req.params.id).populate('customer', 'name email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        if (booking.tech.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized for this booking' });
        }
        
        if (booking.status !== 'in-progress' && booking.status !== 'completed') {
            return res.status(400).json({ message: 'Job must be in-progress or completed to send receipt' });
        }
        
        // Update booking with receipt and complete it
        booking.receipt = {
            laborCost,
            materialCost: materialCost || 0,
            additionalCharges: additionalCharges || 0,
            totalAmount,
            timeSpent: timeSpent || '',
            notes: notes || '',
            sentAt: Date.now()
        };
        booking.status = 'completed';
        booking.price = totalAmount;
        booking.payment = 'pending'; // Customer needs to pay
        booking.completedDate = Date.now();
        booking.updatedAt = Date.now();
        await booking.save();
        
        console.log(`✅ Receipt sent for job ${req.params.id} - Amount: ₹${totalAmount}`);
        console.log(`   Customer: ${booking.customer.name} (${booking.customer.email})`);
        
        res.json({ 
            message: 'Receipt sent to customer successfully', 
            booking,
            receipt: booking.receipt
        });
    } catch (err) {
        console.error('Error sending receipt:', err);
        res.status(500).json({ message: 'Error sending receipt', error: err.message });
    }
});

// GET /api/technician/job/:id - Get single job details
router.get('/job/:id', async (req, res) => {
    try {
        console.log('📋 Fetching job details for ID:', req.params.id);
        console.log('👤 Requested by technician:', req.user.id);
        
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('tech', 'name email');
        
        if (!booking) {
            console.log('❌ Job not found');
            return res.status(404).json({ message: 'Job not found' });
        }
        
        console.log('✅ Job found');
        console.log('   Tech field type:', typeof booking.tech);
        console.log('   Tech field value:', booking.tech);
        console.log('   Has _id?', booking.tech?._id);
        
        // Check authorization - tech can be either ObjectId or populated object
        let techId;
        try {
            if (booking.tech && typeof booking.tech === 'object' && booking.tech._id) {
                // Tech is populated
                techId = booking.tech._id.toString();
            } else if (booking.tech) {
                // Tech is just an ObjectId
                techId = booking.tech.toString();
            } else {
                console.log('❌ Tech field is null or undefined');
                return res.status(500).json({ message: 'Invalid booking data - tech is missing' });
            }
        } catch (techError) {
            console.error('❌ Error processing tech ID:', techError);
            return res.status(500).json({ message: 'Error processing technician data', error: techError.message });
        }
        
        console.log('🔐 Checking authorization - techId:', techId, 'userId:', req.user.id);
        
        if (techId !== req.user.id) {
            console.log('⛔ Authorization failed');
            return res.status(403).json({ message: 'Not authorized to view this job' });
        }
        
        console.log('✅ Authorization successful, sending job data');
        res.json(booking);
    } catch (err) {
        console.error('❌ Error fetching job:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ message: 'Error fetching job', error: err.message });
    }
});

// GET /api/technician/job/:id/messages - Get chat messages for a job
router.get('/job/:id/messages', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        const techId = booking.tech._id ? booking.tech._id.toString() : booking.tech.toString();
        if (techId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        res.json(booking.messages || []);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ message: 'Error fetching messages', error: err.message });
    }
});

// POST /api/technician/job/:id/message - Send a message
router.post('/job/:id/message', async (req, res) => {
    try {
        const { message } = req.body;
        const booking = await Booking.findById(req.params.id);
        const techUser = await User.findById(req.user.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        const techId = booking.tech._id ? booking.tech._id.toString() : booking.tech.toString();
        if (techId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }
        
        booking.messages.push({
            sender: 'technician',
            senderName: techUser.name,
            message: message.trim(),
            timestamp: Date.now()
        });
        
        booking.updatedAt = Date.now();
        await booking.save();
        
        console.log(`💬 Message sent by technician in job ${req.params.id}`);
        res.json({ message: 'Message sent successfully', messages: booking.messages });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ message: 'Error sending message', error: err.message });
    }
});

// GET /api/technician/earnings - Get earnings summary
router.get('/earnings', async (req, res) => {
    try {
        const jobs = await Booking.find({ 
            tech: req.user.id, 
            status: 'completed',
            price: { $gt: 0 }
        }).sort({ completedDate: -1 });
        
        // Calculate total earnings
        const totalEarnings = jobs.reduce((sum, job) => sum + (job.price || 0), 0);
        
        // Calculate this month's earnings
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEarnings = jobs
            .filter(j => new Date(j.completedDate) >= monthStart)
            .reduce((sum, j) => sum + (j.price || 0), 0);
        
        // Calculate average
        const avgEarning = jobs.length > 0 ? (totalEarnings / jobs.length).toFixed(2) : 0;
        
        // Group by month for breakdown
        const monthlyBreakdown = {};
        jobs.forEach(job => {
            if (job.completedDate) {
                const date = new Date(job.completedDate);
                const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                
                if (!monthlyBreakdown[monthKey]) {
                    monthlyBreakdown[monthKey] = { name: monthName, total: 0, count: 0 };
                }
                monthlyBreakdown[monthKey].total += job.price || 0;
                monthlyBreakdown[monthKey].count++;
            }
        });
        
        res.json({
            total: totalEarnings,
            thisMonth: monthEarnings,
            average: avgEarning,
            jobCount: jobs.length,
            monthlyBreakdown: Object.values(monthlyBreakdown).slice(0, 6),
            recentJobs: jobs.slice(0, 10)
        });
    } catch (err) {
        console.error('Error fetching earnings:', err);
        res.status(500).json({ message: 'Error fetching earnings', error: err.message });
    }
});

// PUT /api/technician/availability - Toggle availability
router.put('/availability', async (req, res) => {
    try {
        const { available } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { available: available, updatedAt: Date.now() },
            { new: true }
        ).select('-password');
        
        console.log(`✅ Availability updated for user: ${req.user.id} - ${available ? 'Available' : 'Unavailable'}`);
        res.json({ message: 'Availability updated successfully', user });
    } catch (err) {
        console.error('Availability update error:', err);
        res.status(500).json({ message: 'Error updating availability', error: err.message });
    }
});

// GET /api/technician/reviews - Get technician's reviews
router.get('/reviews', async (req, res) => {
    try {
        const jobs = await Booking.find({ 
            tech: req.user.id, 
            status: 'completed',
            'review.rating': { $exists: true }
        })
        .populate('customer', 'name email')
        .sort({ completedDate: -1 });
        
        const reviews = jobs.map(job => ({
            ...job.review.toObject(),
            customer: job.customer,
            jobId: job._id,
            jobDescription: job.description,
            completedDate: job.completedDate
        }));
        
        // Calculate stats
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
            : 0;
        const fiveStars = reviews.filter(r => r.rating === 5).length;
        
        res.json({
            reviews,
            stats: {
                total: totalReviews,
                average: avgRating,
                fiveStars
            }
        });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ message: 'Error fetching reviews', error: err.message });
    }
});

module.exports = router;
