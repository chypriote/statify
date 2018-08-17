const axios = require('axios');
const chalk = require('chalk');
const User = require('../models/User');

const BASE_URL = 'https://api.spotify.com/v1/me/top';

exports.index = (req, res) => {
	if (req.user) {
		return res.redirect('/stats');
	}

	res.render('home');
};

exports.stats = (req, res) => {
	if (!req.user.accessToken) {
		req.flash('errors', { msg: 'You have been disconnected from Spotify' });
		return res.redirect('/logout');
	}

	const date = new Date();
	const prevStats = req.user.stats.find(stat => stat.date === `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);

	if (prevStats) {
		console.log(chalk.yellow(`Using saved stats for ${prevStats.date}`));

		return res.render('stats', {
			month: prevStats.month,
			semester: prevStats.semester,
			alltime: prevStats.alltime,
		});
	}

	console.log(chalk.red('Gathering new stats for user'));
	const spotifyApi = axios.create({
		headers: { Authorization: `Bearer ${req.user.accessToken}` },
	});

	const artistsMonth = spotifyApi.get(`${BASE_URL}/artists`, { params: { limit: 50, time_range: 'short_term' } });
	const artistsSemester = spotifyApi.get(`${BASE_URL}/artists`, { params: { limit: 50, time_range: 'medium_term' } });
	const artistsAll = spotifyApi.get(`${BASE_URL}/artists`, { params: { limit: 50, time_range: 'long_term' } });
	const tracksMonth = spotifyApi.get(`${BASE_URL}/tracks`, { params: { limit: 50, time_range: 'short_term' } });
	const tracksSemester = spotifyApi.get(`${BASE_URL}/tracks`, { params: { limit: 50, time_range: 'medium_term' } });
	const tracksAll = spotifyApi.get(`${BASE_URL}/tracks`, { params: { limit: 50, time_range: 'long_term' } });

	axios.all([
		artistsMonth, artistsSemester, artistsAll,
		tracksMonth, tracksSemester, tracksAll,
	]).then(axios.spread((aM, aS, aA, tM, tS, tA) => {
		const stats = {
			month: { artists: aM.data.items, tracks: tM.data.items },
			semester: { artists: aS.data.items, tracks: tS.data.items },
			alltime: { artists: aA.data.items, tracks: tA.data.items },
		};
		req.user.saveStats(stats);

		res.render('stats', {
			month: stats.month,
			semester: stats.semester,
			alltime: stats.alltime,
		});
	})).catch((error) => {
		const msg = error.response ? `Error ${error.response.status}: ${error.response.data.error.message}` : 'Une erreur inconnue s\'est produite';
		req.flash('errors', { msg });

		res.redirect('/logout');
	});
};

exports.users = (req, res) => {
	User.find({}, (err, users) => {
		if (err) {
			console.log(chalk.red(err), err);
			res.redirect('/logout');
		}

		const date = new Date();

		return res.render('users', {
			users,
			date: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
		});
	});
};
