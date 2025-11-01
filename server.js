// server.js - Enhanced backend with improved error handling and features

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Configuration
const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixall';

// Database connection with better error handling
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
    console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Models
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'technician', 'admin'], required: true },
    approved: { type: Boolean, default: true },
    available: { type: Boolean, default: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    experience: { type: Number, default: 0 },
    bio: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    reviews: [{ 
        rating: { type: Number, min: 1, max: 5 }, 
        comment: String, 
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.virtual('averageRating').get(function() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

const bookingSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tech: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true, trim: true },
    status: { 
        type: String, 
        enum: ['pending', 'in-progress', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    payment: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    price: { type: Number, default: 0 },
    address: { type: String, trim: true },
    notes: { type: String, trim: true },
    scheduledDate: Date,
    completedDate: Date,
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Authentication Middleware
function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header provided' });
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        jwt.verify(token, SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        return res.status(500).json({ message: 'Authentication error', error: error.message });
    }
}

function verifyRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: 'Access denied - insufficient permissions' });
        }
        next();
    };
}

// Input validation helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

// Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, role, secret, skills = [] } = req.body;
        
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
            password: hashed, 
            role, 
            approved, 
            skills: role === 'technician' ? skills : [] 
        });
        await user.save();
        
        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '7d' });
        
        console.log(`✅ New user registered: ${email} (${role})`);
        res.status(201).json({ 
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                approved: user.approved
            },
            message: role === 'technician' ? 'Account created. Awaiting admin approval.' : 'Account created successfully!'
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error during signup', error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
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
        
        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '7d' });
        
        console.log(`✅ User logged in: ${email}`);
        res.json({ 
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                approved: user.approved,
                skills: user.skills
            },
            message: 'Login successful'
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login', error: err.message });
    }
});

app.get('/api/profile', verifyToken, async (req, res) => {
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

app.put('/api/profile', verifyToken, async (req, res) => {
    try {
        const { name, email, password, skills } = req.body;
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
        
        if (password) {
            if (!validatePassword(password)) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' });
            }
            update.password = await bcrypt.hash(password, 10);
        }
        
        if (skills && req.user.role === 'technician') {
            update.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
        }
        
        await User.findByIdAndUpdate(req.user.id, update);
        console.log(`✅ Profile updated: ${req.user.id}`);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
});

app.get('/api/technicians', verifyToken, verifyRole('customer'), async (req, res) => {
    const { search = '', category = '' } = req.query;
    const query = { role: 'technician', approved: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.skills = { $in: [category] };
    const technicians = await User.find(query, null, { toObject: { virtuals: true } });
    res.json(technicians);
});

app.get('/api/technician/:id', verifyToken, verifyRole('customer'), async (req, res) => {
    const tech = await User.findById(req.params.id).populate('reviews.from');
    if (!tech || tech.role !== 'technician' || !tech.approved) return res.status(404).json({ message: 'Not found' });
    res.json(tech);
});

app.post('/api/book', verifyToken, verifyRole('customer'), async (req, res) => {
    try {
        const { techId, description, scheduledDate, address } = req.body;
        
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
            address: address || ''
        });
        await booking.save();
        
        console.log(`✅ New booking created by customer ${req.user.id}`);
        res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).json({ message: 'Error creating booking', error: err.message });
    }
});

app.post('/api/reviews', verifyToken, verifyRole('customer'), async (req, res) => {
    try {
        const { techId, rating, comment } = req.body;
        
        if (!techId || !rating) {
            return res.status(400).json({ message: 'Technician ID and rating are required' });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }
        
        const tech = await User.findById(techId);
        if (!tech || tech.role !== 'technician') {
            return res.status(404).json({ message: 'Technician not found' });
        }
        
        // Check if customer has a completed booking with this technician
        const hasBooking = await Booking.findOne({
            customer: req.user.id,
            tech: techId,
            status: 'completed'
        });
        
        if (!hasBooking) {
            return res.status(403).json({ message: 'You can only review technicians you have booked' });
        }
        
        tech.reviews.push({ rating, comment: comment || '', from: req.user.id });
        await tech.save();
        
        console.log(`✅ Review added for technician ${techId}`);
        res.json({ message: 'Review added successfully' });
    } catch (err) {
        console.error('Review error:', err);
        res.status(500).json({ message: 'Error adding review', error: err.message });
    }
});

app.get('/api/history', verifyToken, verifyRole('customer'), async (req, res) => {
    const { filter = 'all' } = req.query;
    let query = { customer: req.user.id };
    if (filter !== 'all') query.status = filter;
    const history = await Booking.find(query).populate('tech');
    res.json(history);
});

app.put('/api/cancel/:id', verifyToken, verifyRole('customer'), async (req, res) => {
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
        await booking.save();
        
        console.log(`✅ Booking ${req.params.id} cancelled`);
        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        console.error('Cancel booking error:', err);
        res.status(500).json({ message: 'Error cancelling booking', error: err.message });
    }
});

app.get('/api/my-status', verifyToken, verifyRole('technician'), async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user);
});

app.get('/api/jobs', verifyToken, verifyRole('technician'), async (req, res) => {
    const jobs = await Booking.find({ tech: req.user.id }).populate('customer');
    res.json(jobs);
});

app.put('/api/complete/:id', verifyToken, verifyRole('technician'), async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        if (booking.tech.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized for this booking' });
        }
        
        if (booking.status === 'completed') {
            return res.status(400).json({ message: 'Booking already completed' });
        }
        
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot complete a cancelled booking' });
        }
        
        booking.status = 'completed';
        booking.payment = 'completed';
        booking.completedDate = Date.now();
        booking.updatedAt = Date.now();
        await booking.save();
        
        console.log(`✅ Booking ${req.params.id} marked as completed`);
        res.json({ message: 'Booking completed successfully', booking });
    } catch (err) {
        console.error('Complete booking error:', err);
        res.status(500).json({ message: 'Error completing booking', error: err.message });
    }
});

app.get('/api/pending-technicians', verifyToken, verifyRole('admin'), async (req, res) => {
    const pending = await User.find({ role: 'technician', approved: false });
    res.json(pending);
});

app.put('/api/approve/:id', verifyToken, verifyRole('admin'), async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user.role !== 'technician') return res.status(400).json({ message: 'Not a technician' });
    user.approved = true;
    await user.save();
    res.json({ message: 'Approved' });
});

app.get('/api/all-users', verifyToken, verifyRole('admin'), async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

app.get('/api/all-bookings', verifyToken, verifyRole('admin'), async (req, res) => {
    const bookings = await Booking.find({}).populate('customer tech');
    res.json(bookings);
});

// Customer endpoints
app.get('/api/my-bookings', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ customer: req.user.id }).populate('tech').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching bookings', error: err.message });
    }
});

app.put('/api/cancel-booking/:id', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot cancel this booking' });
        }
        booking.status = 'cancelled';
        booking.updatedAt = Date.now();
        await booking.save();
        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error cancelling booking', error: err.message });
    }
});

app.post('/api/review/:id', verifyToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
        }
        if (booking.review) {
            return res.status(400).json({ message: 'Already reviewed' });
        }
        
        booking.review = { rating, comment, createdAt: Date.now() };
        await booking.save();
        
        res.json({ message: 'Review submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error submitting review', error: err.message });
    }
});

// Technician endpoints
app.get('/api/approved-technicians', verifyToken, async (req, res) => {
    try {
        const technicians = await User.find({ role: 'technician', approved: true }).select('-password');
        res.json(technicians);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching technicians', error: err.message });
    }
});

app.get('/api/my-tech-bookings', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ tech: req.user.id }).populate('customer').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching bookings', error: err.message });
    }
});

app.put('/api/start-job/:id', verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.tech.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Job already started or completed' });
        }
        
        booking.status = 'in-progress';
        booking.updatedAt = Date.now();
        await booking.save();
        
        res.json({ message: 'Job started successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error starting job', error: err.message });
    }
});

app.put('/api/complete-job/:id', verifyToken, async (req, res) => {
    try {
        const { price, notes } = req.body;
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.tech.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
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
        res.status(500).json({ message: 'Error completing job', error: err.message });
    }
});

// Profile update endpoints
app.put('/api/update-profile', verifyToken, async (req, res) => {
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
            update.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(s => s);
        }
        
        const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
        console.log(`✅ Profile updated: ${req.user.id}`);
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
});

app.put('/api/change-password', verifyToken, async (req, res) => {
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

// Availability toggle
app.put('/api/availability', verifyToken, async (req, res) => {
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

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 FixAll Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`\nPress Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏳ Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
});