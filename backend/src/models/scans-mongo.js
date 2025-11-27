import mongoose from "mongoose";

const scanSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    targetUrl: { 
        type: String, 
        required: true 
    },
    scanType: { 
        type: String, 
        enum: ['quick', 'full'],
        default: 'quick'
    },
    status: { 
        type: String, 
        enum: ['pending','running', 'completed', 'failed'],
        default: 'pending'
    },
    results: {
        nmap: Object,      
        nikto: Object,      
        ssl: Object,       
        directories: Array 
    }
}, { 
    timestamps: true  
});

export const Scan = mongoose.model('Scan', scanSchema);