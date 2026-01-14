const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Experience = require('../models/Experience');
const User = require('../models/User');

// Create experience (Alumni only)
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only alumni can create experiences
    if (user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can create experience posts' });
    }

    const exp = new Experience({ ...req.body, author: req.user.id });
    await exp.save();
    
    // Populate author details before returning
    await exp.populate('author', 'name department batch role');
    
    res.status(201).json(exp);
  } catch (err) {
    console.error('Create experience error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get experiences (with filters)
router.get('/', async (req, res) => {
  try {
    const { company, role, department } = req.query;
    const filter = {};
    
    if (company) filter.company = new RegExp(company, 'i');
    if (role) filter.role = new RegExp(role, 'i');

    let exps = await Experience.find(filter)
      .populate('author', 'name department batch role')
      .sort({ createdAt: -1 })
      .lean();

    // Filter by department if provided
    if (department) {
      exps = exps.filter(exp => 
        exp.author && exp.author.department && 
        exp.author.department.toLowerCase().includes(department.toLowerCase())
      );
    }

    res.json(exps);
  } catch (err) {
    console.error('Get experiences error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single experience by ID
router.get('/:id', async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id)
      .populate('author', 'name department batch role');
    
    if (!exp) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    res.json(exp);
  } catch (err) {
    console.error('Get experience error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update experience (Owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);
    
    if (!exp) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    // Check if user is the owner
    if (exp.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    // Update fields
    const { company, role, description, interviewQuestions, tips } = req.body;
    
    if (company) exp.company = company;
    if (role) exp.role = role;
    if (description) exp.description = description;
    if (interviewQuestions) exp.interviewQuestions = interviewQuestions;
    if (tips) exp.tips = tips;

    await exp.save();
    
    // Populate author details before returning
    await exp.populate('author', 'name department batch role');
    
    res.json(exp);
  } catch (err) {
    console.error('Update experience error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete experience (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const exp = await Experience.findById(req.params.id);
    
    if (!exp) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    // Check if user is the owner
    if (exp.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Experience.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Experience deleted successfully' });
  } catch (err) {
    console.error('Delete experience error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
