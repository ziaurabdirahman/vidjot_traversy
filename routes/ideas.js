const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { ensureAuthenticated } = require('../helpers/auth')
// load Idea model
require('../models/Idea')
const Idea = mongoose.model('ideas')

// load ideas
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({ user: req.user.id })
    .sort({ date: 'desc' })
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas
      })
    })
})

// Add idea form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('ideas/add')
})

// Process Form
router.post('/', (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: 'Please add a title' });
  }
  if (!req.body.details) {
    errors.push({ text: 'Please add some details' });
  }

  if (errors.length > 0) {
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    // send data to database
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    }
    new Idea(newUser).save()
      .then(idea => {
        req.flash('success_msg', 'Video idea added')
        res.redirect('/ideas')
      })
  }
});

// edit form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
    .then(idea => {
      if (idea.user != req.user.id) {
        req.flash('error_msg', 'Not Authorized')
        res.redirect('/ideas')
      } else {
        res.render('ideas/edit', {
          idea: idea
        })
      }

    })

})

// edit from process
router.put('/:id', ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
    .then(idea => {
      idea.title = req.body.title
      idea.details = req.body.details

      idea.save()
        // after save than redirect
        .then(idea => {
          req.flash('success_msg', 'Video idea updated')

          res.redirect('/ideas')
        })
    })
})

// Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Idea.remove({
    _id: req.params.id
  })
    .then(() => {
      req.flash('success_msg', 'Video idea removed')
      res.redirect('/ideas')
    })
})

module.exports = router