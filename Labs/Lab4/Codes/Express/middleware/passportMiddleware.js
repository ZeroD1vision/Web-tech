const passport = require('passport');

module.exports = [
    passport.initialize(),
    passport.session()
];