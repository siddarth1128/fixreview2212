const mongoose = require('mongoose');

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
    images: [{ 
        data: String, // base64 encoded image
        contentType: String, // image/jpeg, image/png, etc.
        uploadedAt: { type: Date, default: Date.now }
    }],
    scheduledDate: Date,
    startedAt: Date,
    completedDate: Date,
    receipt: {
        laborCost: Number,
        materialCost: Number,
        additionalCharges: Number,
        totalAmount: Number,
        timeSpent: String,
        notes: String,
        sentAt: { type: Date, default: Date.now }
    },
    messages: [{
        sender: { type: String, enum: ['customer', 'technician'], required: true },
        senderName: String,
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
