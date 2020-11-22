const express = require('express')
const passport = require('passport')
const Movie = require('../models/movie')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// INDEX
router.get('/movies', requireToken, (req, res, next) => {
  Movie.find()
    .then(movies => {
      return movies.map(movie => movie.toObject())
    })
    .then(movies => res.status(200).json({ movies: movies }))
    .catch(next)
})

// SHOW
router.get('/movies/:id', requireToken, (req, res, next) => {
  Movie.findById(req.params.id)
    .then(handle404)
    .then(movie => res.status(200).json({ movie: movie.toObject() }))
    .catch(next)
})

// create
router.post('/movies', requireToken, (req, res, next) => {
  req.body.movie.owner = req.user.id
  Movie.create(req.body.movie)
    .then(movie => {
      res.status(201).json({ movie: movie.toObject() })
    })
    .catch(next)
})

// UPDATE
router.patch('/movies/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.movie.owner

  Movie.findById(req.params.id)
    .then(handle404)
    .then(movie => {
      requireOwnership(req, movie)

      return movie.updateOne(req.body.movie)
    })
})

// DELETE
router.delete('/movies/:id', requireToken, (req, res, next) => {
  Movie.findById(req.params.id)
    .then(handle404)
    .then(movie => {
      requireOwnership(req, movie)
      movie.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
