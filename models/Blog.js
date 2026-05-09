const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    publishDate: { 
        type: Date, 
        required: true ,
        default: Date.now
    },
    approveStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' // Hidden by default
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration', // Links to your Registration model
        required: true
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.models.Blog || mongoose.model('Blog', blogSchema);