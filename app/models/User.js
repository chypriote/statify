const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	spotify: String,
	accessToken: String,
	refreshToken: String,

	profile: {
		name: String,
		country: String,
		picture: String,
	},
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
