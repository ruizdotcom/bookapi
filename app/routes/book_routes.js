const express = require('express')
const passport = require('passport')
const Book = require('../models/book')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')

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
router.get('/books/:id', requireToken, (req, res, next) => {
  Book.findById(req.params.id)
    .then(handle404)
    .then(book => res.status(200).json({ book: book.toObject() }))
    .catch(next)
})

// CREATE
router.post('/books', requireToken, (req, res, next) => {
  req.body.book.owner = req.user.id
  Book.create(req.body.book)
    .then(book => {
      res.status(201).json({ book: book.toObject() })
    })
    .catch(next)
})

// UPDATE
router.patch('/books/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.book.owner

  Book.findById(req.params.id)
    .then(handle404)
    .then(book => {
      requireOwnership(req, book)

      return book.updateOne(req.body.book)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DESTROY
router.delete('/books/:id', requireToken, (req, res, next) => {
  Book.findById(req.params.id)
    .then(handle404)
    .then(book => {
      requireOwnership(req, book)
      book.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})
module.exports = router
