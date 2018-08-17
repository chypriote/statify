const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	spotify: { type: String, unique: true },
	accessToken: String,
	refreshToken: String,
	stats: Array,

	profile: {
		name: String,
		country: String,
		picture: String,
	},
}, { timestamps: true });

userSchema.methods.saveStats = function saveStats(stats) {
	const user = this;
	const date = new Date();

	stats.date = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
	user.stats.push(stats);
	user.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
