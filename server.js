const express = require('express'),
    chalk = require('chalk'),
    expressStaticGzip = require('express-static-gzip'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express(),
    port = 8106;

app.use(
    morgan('dev'),
    bodyParser.urlencoded({ 'extended': 'true' }),
    bodyParser.json(),
    cors(),
    expressStaticGzip('www', {
        enableBrotli: true,
        orderPreference: ['br', 'gz']
    }))
    .set('port', process.env.PORT || port)
    .listen(app.get('port'), () => console.log(chalk.blue.bold(`Express server listening on port ${app.get('port')}`)));
