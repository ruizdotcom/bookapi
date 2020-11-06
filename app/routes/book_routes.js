const express = require('express')
const passport = require('passport')
const Book = require('../models/book')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_feilds')

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// INDEX
// GET /examples
router.get('/books', requireToken, (req, res, next) => {
  Book.find()
    .then(books => {
      return books.map(book => book.toObject())
    })
    .then(books => res.status(200).json({ books: books }))
    .catch(next)
})

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.get('/books/:id', requireToken, (req, res, next) => {
  Book.findById(req.params.id)
    .then(handle404)
    .then(book => res.status(200).json({ book: book.toObject() }))
    .catch(next)
})

// CREATE
// POST /examples
router.post('/books', requireToken, (req, res, next) => {
  req.body.book.owner = req.user.id
  Book.create(req.body.book)
    .then(book => {
      res.status(201).json({ book: book.toObject() })
    })
    .catch(next)
})

module.exports = router