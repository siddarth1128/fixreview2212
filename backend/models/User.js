const mongoose = require('mongoose');

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
    if (!this.reviews || this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
