require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Debug: Log environment variables (without sensitive data)
console.log('Environment check:', {
    hasClientId: !!process.env.SPOTIFY_CLIENT_ID,
    hasClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
    hasAccessToken: !!process.env.SPOTIFY_USER_ACCESS_TOKEN,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Initialize with your access token
spotifyApi.setAccessToken(process.env.SPOTIFY_USER_ACCESS_TOKEN);

// Authorization endpoint
app.get('/login', (req, res) => {
    const scopes = ['user-library-read'];
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    res.redirect(authorizeURL);
});

// Callback endpoint
app.get('/callback', async (req, res) => {
    const error = req.query.error;
    const code = req.query.code;

    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const accessToken = data.body['access_token'];
        const refreshToken = data.body['refresh_token'];

        // Set the access token
        spotifyApi.setAccessToken(accessToken);
        spotifyApi.setRefreshToken(refreshToken);

        // Display tokens (in production, you'd want to save these securely)
        res.send(`
            <h1>Authorization successful!</h1>
            <p>Copy these tokens to your .env file:</p>
            <pre>
SPOTIFY_USER_ACCESS_TOKEN=${accessToken}
SPOTIFY_REFRESH_TOKEN=${refreshToken}
            </pre>
        `);
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.send(`Error getting tokens: ${error}`);
    }
});

app.get('/api/liked-songs', async (req, res) => {
    try {
        console.log('Fetching liked songs...');
        const data = await spotifyApi.getMySavedTracks({
            limit: 50
        });

        const songs = data.body.items.map(item => ({
            title: item.track.name,
            artist: item.track.artists[0].name,
            album: item.track.album.name,
            albumArt: item.track.album.images[0].url
        }));

        console.log(`Successfully fetched ${songs.length} songs`);
        res.json(songs);
    } catch (error) {
        console.error('Error fetching liked songs:', error.message);
        if (error.body) {
            console.error('Error details:', error.body);
        }
        res.status(500).json({ error: 'Failed to fetch liked songs' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 