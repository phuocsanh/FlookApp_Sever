const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const Users = require("./auth/user")

const model = {
  users: mongoose.model('users', Users),
  roles: mongoose.model('roles', require('./auth/roles')),
  casts: mongoose.model('casts', require('./movie/cast')),
  movies: mongoose.model('movies', require('./movie/movie')),
  genres: mongoose.model('genres', require('./storybook/genre')),
  ebooks: mongoose.model('ebooks', require('./storybook/ebooks')),
  authors: mongoose.model('authors', require('./storybook/author')),
  chapters: mongoose.model('chapters', require('./storybook/chapter')),
  reviews: mongoose.model('reviews', require('./review/reviews')),
  comments: mongoose.model('comments', require('./review/comment')),
  features: mongoose.model('features', require('./auth/feature')),
  featuresGroups: mongoose.model('featuresGroups', require('./auth/featureGroup')),
}


module.exports = model