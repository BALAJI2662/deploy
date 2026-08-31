const dns = require('dns');
const mongoose = require('mongoose');
require('dotenv').config();

// Ensure SRV DNS records resolve properly on Windows/all ISPs
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // ignore if not permitted
}

let isConnected = false;

const db = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log('MongoDB connected');
    } 
    catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};
module.exports = db;