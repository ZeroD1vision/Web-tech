const express = require('express');

const bodyParserMiddleware = [
    express.urlencoded({ extended: true }),
    express.json()
];

module.exports = bodyParserMiddleware;