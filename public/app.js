const API_URL = 'https://rodolfos-spotify-songs-bqatu66fa-rodolfo-cristovaos-projects.vercel.app';

// DOM Elements
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const songsContainer = document.getElementById('songs-container');

async function fetchLikedSongs() {
    try {
        // Show loading state
        loadingElement.classList.remove('hidden');
        errorElement.classList.add('hidden');
        songsContainer.classList.add('hidden');

        const response = await fetch(`${API_URL}/api/liked-songs`);
        if (!response.ok) {
            throw new Error('Failed to fetch liked songs');
        }
        const songs = await response.json();
        displaySongs(songs);
    } catch (error) {
        console.error('Error fetching liked songs:', error);
        showError();
    } finally {
        // Hide loading state
        loadingElement.classList.add('hidden');
    }
}

function displaySongs(songs) {
    songsContainer.innerHTML = '';
    songsContainer.classList.remove('hidden');

    songs.forEach(song => {
        const songCard = createSongCard(song);
        songsContainer.appendChild(songCard);
    });
}

function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'song-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'song-image';
    
    const img = document.createElement('img');
    img.src = song.albumArt;
    img.alt = `${song.title} album art`;
    img.loading = 'lazy'; // Enable lazy loading for images
    
    imageContainer.appendChild(img);

    const songInfo = document.createElement('div');
    songInfo.className = 'song-info';
    
    songInfo.innerHTML = `
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
        <div class="song-album">${song.album}</div>
    `;

    card.appendChild(imageContainer);
    card.appendChild(songInfo);

    // Add click event to show song details or play preview
    card.addEventListener('click', () => {
        console.log('Song clicked:', song);
        // You can add functionality here to play song preview or show more details
    });

    return card;
}

function showError() {
    errorElement.classList.remove('hidden');
    songsContainer.classList.add('hidden');
}

// Load songs when the page loads
document.addEventListener('DOMContentLoaded', fetchLikedSongs); 