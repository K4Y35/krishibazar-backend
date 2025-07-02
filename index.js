const express = require("express");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const path = require('path');
require("dotenv").config();
const db = require("./db");

// Import routes
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Add database middleware
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to KrishiBazar API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Something went wrong!'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 KrishiBazar API running on http://localhost:${PORT}`);
});

module.exports = app;
