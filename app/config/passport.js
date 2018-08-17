const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const chalk = require('chalk');
const User = require('../models/User');

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

passport.use(new SpotifyStrategy({
	clientID: process.env.SPOTIFY_ID,
	clientSecret: process.env.SPOTIFY_SECRET,
	callbackURL: 'http://localhost:8080/auth/spotify/callback',
}, (accessToken, refreshToken, profile, done) => {
	console.log(chalk.blue(accessToken));
	console.log(chalk.cyan(refreshToken));

	User.findOne({ spotify: profile.id }, (err, existingUser) => {
		if (err) { return done(err); }
		if (existingUser) {
			existingUser.accessToken = accessToken;
			existingUser.refreshToken = refreshToken;
			existingUser.save((err) => {
				done(err, existingUser);
			});
		}

		const user = new User();
		user.spotify = profile.id;
		user.accessToken = accessToken;
		user.refreshToken = refreshToken;
		user.profile.name = profile.displayName;
		const [picture] = profile.photos;
		user.profile.picture = picture;
		user.profile.country = profile.country;
		user.save((err) => {
			done(err, user);
		});
	});
}));

exports.isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
};

exports.isAuthorized = (req, res, next) => {
	const provider = req.path.split('/').slice(-1)[0];
	const token = req.user.tokens.find(token => token.kind === provider);
	if (token) {
		next();
	} else {
		res.redirect(`/auth/${provider}`);
	}
};
