const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "32RwzxhOTD3kLBZMSs3rqh";
const container = document.querySelector('div[data-js="tracks"]');
const albumArt = document.getElementById("album-art");
const trackNameElem = document.getElementById("track-name");
const artistNameElem = document.getElementById("artist-name");
const playlistArt = document.getElementById("playlist-art");
const player = document.getElementById("player");
const playlistNameElem = document.getElementById("playlist-name");
const playlistOwnerElem = document.getElementById("playlist-owner");
const playlistDescriptionElem = document.getElementById("playlist-description");
const audioPlayer = document.getElementById("audio-player");
const navbar = document.getElementById("navbar");
const playlistTitle = document.getElementById("title");
const playlistInfo = document.querySelector(".playlist-info");
let isPlaylistTitleFixed = false;

window.addEventListener("scroll", () => {
  const playlistArtBottom = playlistArt.getBoundingClientRect().bottom;
  const navbarHeight = navbar.offsetHeight;

  if (playlistArtBottom <= navbarHeight) {
    playlistInfo.style.position = "fixed";
    playlistInfo.style.top = `${navbarHeight}px`;
    playlistInfo.style.width = "calc(100% - 40px)"; // Adjust width to match padding/margin
  } else {
    playlistInfo.style.position = "";
    playlistInfo.style.top = "";
    playlistInfo.style.width = "";
  }
});

let currentPlayingTrack = null;
let currentPlayButton = null;
let currentTrackIndex = -1;
let tracks = [];
let trackElements = [];
let trackNumbers = []; // Store track numbers to revert back later

function fetchPlaylist(token, playlistId) {
  fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.name) {
        playlistNameElem.textContent = data.name;
      }
      if (data.owner.display_name) {
        playlistOwnerElem.textContent = "by " + data.owner.display_name;
      }
      if (data.description) {
        playlistDescriptionElem.textContent = data.description;
      }
      if (data.images && data.images[0]) {
        playlistArt.src = data.images[0].url;
      }
      if (data.tracks && data.tracks.items) {
        tracks = data.tracks.items;
        addTracksToPage(data.tracks.items);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function addTracksToPage(tracks) {
  const ul = document.createElement("ul");

  tracks.forEach((item, index) => {
    const track = item.track;
    const li = document.createElement("li");

    const trackNumber = document.createElement("span");
    trackNumber.textContent = index + 1;
    trackNumber.classList.add("track-number");

    const trackImage = document.createElement("img");
    trackImage.src = track.album.images[0].url;
    trackImage.alt = "Album Art";
    trackImage.classList.add("track-image");

    const trackDetails = document.createElement("div");
    trackDetails.classList.add("track-details");

    const trackSpan = document.createElement("span");
    trackSpan.textContent = track.name;
    trackSpan.classList.add("track");
    trackDetails.appendChild(trackSpan);

    const artistSpan = document.createElement("span");
    artistSpan.textContent = track.artists[0].name;
    artistSpan.classList.add("artist");
    trackDetails.appendChild(artistSpan);

    const durationSpan = document.createElement("span");
    const duration = formatDuration(track.duration_ms);
    durationSpan.textContent = duration;
    durationSpan.classList.add("duration");

    const playButton = document.createElement("button");
    const playIcon = document.createElement("img");
    playIcon.src = "img/play.svg";
    playButton.appendChild(playIcon);
    playButton.onclick = () => playTrack(index, playButton, li);

    li.appendChild(trackNumber);
    li.appendChild(trackImage);
    li.appendChild(trackDetails);
    li.appendChild(durationSpan);
    li.appendChild(playButton);

    ul.appendChild(li);
    trackElements.push(li); // Store reference to the track element
    trackNumbers.push(trackNumber); // Store reference to the track number element
  });
  container.appendChild(ul);
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function playTrack(index, playButton, trackElement) {
  if (currentPlayingTrack === tracks[index].track.preview_url) {
    if (!audioPlayer.paused) {
      audioPlayer.pause();
      playButton.querySelector("img").src = "img/play.svg";
      trackNumbers[currentTrackIndex].textContent = currentTrackIndex + 1; // Revert back to track number
    } else {
      audioPlayer.play();
      playButton.querySelector("img").src = "img/pause.svg";
      trackNumbers[
        currentTrackIndex
      ].innerHTML = `<img src="img/WaveForm.gif" alt="Playing" class="playing-gif">`; // Display GIF
    }
  } else {
    if (currentPlayButton) {
      currentPlayButton.querySelector("img").src = "img/play.svg";
    }
    if (currentTrackIndex !== -1) {
      trackElements[currentTrackIndex].classList.remove("active-track");
      trackNumbers[currentTrackIndex].textContent = currentTrackIndex + 1; // Revert back to track number
    }

    const track = tracks[index].track;
    albumArt.src = track.album.images[0].url;
    trackNameElem.textContent = track.name;
    artistNameElem.textContent = track.artists[0].name;

    if (track.preview_url) {
      audioPlayer.src = track.preview_url;
      audioPlayer.style.display = "block";
      audioPlayer.play();
      playButton.querySelector("img").src = "img/pause.svg";
      currentPlayingTrack = track.preview_url;
      currentPlayButton = playButton;
      currentTrackIndex = index;
      trackElement.classList.add("active-track");
      trackNumbers[
        currentTrackIndex
      ].innerHTML = `<img src="img/Waving.gif" alt="Playing" class="playing-gif">`; // Display GIF
    } else {
      audioPlayer.style.display = "none";
      console.log("Preview not available for this track");
    }

    player.style.display = "flex";
  }

  audioPlayer.onended = () => {
    playButton.querySelector("img").src = "img/play.svg";
    trackElement.classList.remove("active-track");
    trackNumbers[currentTrackIndex].textContent = currentTrackIndex + 1; // Revert back to track number
    currentPlayingTrack = null;
    currentPlayButton = null;
    audioPlayer.src = "";
    playNextTrack();
  };
}

function playNextTrack() {
  const nextTrackIndex = currentTrackIndex + 1;
  if (nextTrackIndex < tracks.length) {
    const nextTrackButton =
      container.querySelectorAll("button")[nextTrackIndex];
    playTrack(nextTrackIndex, nextTrackButton, trackElements[nextTrackIndex]);
  }
}

function fetchAccessToken() {
  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.access_token) {
        fetchPlaylist(data.access_token, PLAYLIST_ID);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

fetchAccessToken();
