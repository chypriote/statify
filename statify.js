const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const errorHandler = require('errorhandler');

dotenv.config();
const passportConfig = require('./app/config/passport');
const homeController = require('./app/controllers/home');
const userController = require('./app/controllers/user');

const app = express();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on('error', (err) => {
	console.error(err);
	console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
	process.exit();
});

app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: process.env.SESSION_SECRET,
	cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
	store: new MongoStore({
		url: process.env.MONGODB_URI,
		autoReconnect: true,
	}),
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
	lusca.csrf()(req, res, next);
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});
app.use((req, res, next) => {
	if (!req.user && !req.path.match(/^\/auth/) && !req.path.match(/\./)) {
		req.session.returnTo = req.originalUrl;
	} else if (req.user) {
		req.session.returnTo = req.originalUrl;
	}
	next();
});
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

app.get('/', homeController.index);
app.get('/stats', passportConfig.isAuthenticated, homeController.stats);
app.get('/users', passportConfig.isAuthenticated, homeController.users);
app.get('/logout', userController.logout);

app.get('/auth/spotify', passport.authenticate('spotify', {
	scope: ['user-library-read', 'user-top-read', 'user-read-recently-played'],
}));
app.get('/auth/spotify/callback', passport.authenticate('spotify', { failureRedirect: '/login' }), (req, res) => {
	res.redirect(req.session.returnTo || '/stats');
});

if (process.env.NODE_ENV === 'development') {
	console.log(`Running server in ${chalk.magenta('development')} mode`);
	app.use(errorHandler());
}

app.listen(app.get('port'), () => {
	console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
	console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
