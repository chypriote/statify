const axios = require('axios');

exports.index = (req, res) => {
  if (req.user) {
    if (!req.user.accessToken) {
      req.flash('errors', { msg: 'You have been disconnected from Spotify' });
      return res.redirect('/logout');
    }

    const spotifyApi = axios.create({
      headers: { Authorization: `Bearer ${req.user.accessToken}` },
    });

    spotifyApi.get('https://api.spotify.com/v1/me/top/artists')
      .then((resp) => {
        console.log(resp);
        res.render('home', { title: 'Home' });
      })
      .catch((error) => {
        const msg = error.response ? `Error ${error.response.status}: ${error.response.data.error.message}` : 'Une erreur inconnue s\'est produite';
        req.flash('errors', { msg });

        return res.render('home', { title: 'Home' });
      });
  } else {
    res.render('home', { title: 'Home' });
  }
};
