// Constants for Spotify API credentials and playlist ID
const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "6QYQQWUQ14VxtOyju93Hn6";

// DOM elements
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
const progressBar = document.getElementById("progress-bar");
const currentTimeElem = document.getElementById("current-time");
const durationElem = document.getElementById("duration");
const navbar = document.getElementById("navbar");
const playlistTitle = document.getElementById("title");
let isPlaylistTitleFixed = false;

// Event listener for scrolling to fix playlist title at the top
window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY;

  if (scrollPosition > player.offsetTop && !isPlaylistTitleFixed) {
    navbar.style.height = navbar.offsetHeight + "px";
    playlistTitle.style.position = "fixed";
    playlistTitle.style.top = "0";
    playlistTitle.style.left = "50%";
    playlistTitle.style.transform = "translateX(-50%)";
    isPlaylistTitleFixed = true;
  } else if (scrollPosition <= player.offsetTop && isPlaylistTitleFixed) {
    navbar.style.height = "";
    playlistTitle.style.position = "";
    playlistTitle.style.top = "";
    playlistTitle.style.left = "";
    playlistTitle.style.transform = "";
    isPlaylistTitleFixed = false;
  }
});

// Variables for current playing track and UI elements
let currentPlayingTrack = null;
let currentPlayButton = null;
let currentTrackIndex = -1;
let tracks = [];
let trackElements = [];
let trackNumbers = []; // Store track numbers to revert back later

// Fetch playlist data from Spotify API
function fetchPlaylist(token, playlistId) {
  fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Update playlist UI elements with fetched data
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
        setFirstAvailableTrack();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Add tracks to the page as a list
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

// Format duration from milliseconds to minutes:seconds
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// Set the first available track with a preview URL to play
function setFirstAvailableTrack() {
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].track.preview_url) {
      playTrack(i, trackElements[i].querySelector("button"), trackElements[i]);
      break;
    }
  }
}

// Play or pause the selected track
function playTrack(index, playButton, trackElement) {
  const track = tracks[index].track;
  if (!track.preview_url) {
    skipToNextTrack(index);
    return;
  }

  if (currentPlayingTrack === track.preview_url) {
    if (!audioPlayer.paused) {
      audioPlayer.pause();
      playButton.querySelector("img").src = "img/play.svg";
      trackNumbers[currentTrackIndex].textContent = currentTrackIndex + 1;
      playPauseButton.querySelector("img").src = "img/play.svg";
    } else {
      audioPlayer.play();
      playButton.querySelector("img").src = "img/pause.svg";
      trackNumbers[
        currentTrackIndex
      ].innerHTML = `<img src="img/Waving.gif" alt="Playing" class="playing-gif">`;
      playPauseButton.querySelector("img").src = "img/pause.svg";
    }
  } else {
    audioPlayer.src = track.preview_url;
    audioPlayer.play();
    playButton.querySelector("img").src = "img/pause.svg";
    albumArt.src = track.album.images[0].url;
    trackNameElem.textContent = track.name;
    artistNameElem.textContent = track.artists[0].name;
    if (currentPlayButton) {
      currentPlayButton.querySelector("img").src = "img/play.svg";
    }
    if (currentTrackIndex !== -1) {
      trackNumbers[currentTrackIndex].textContent = currentTrackIndex + 1;
    }
    trackNumbers[
      index
    ].innerHTML = `<img src="img/Waving.gif" alt="Playing" class="playing-gif">`;
    currentPlayButton = playButton;
    currentPlayingTrack = track.preview_url;
    currentTrackIndex = index;

    trackElements.forEach((elem) => elem.classList.remove("active-track"));
    trackElement.classList.add("active-track");

    playPauseButton.querySelector("img").src = "img/pause.svg";

    durationElem.textContent = "0:30";
    currentTimeElem.textContent = "0:00";
    progressBar.value = 0;
  }
}

// Play/Pause button functionality
const playPauseButton = document.getElementById("play-pause-btn");
playPauseButton.addEventListener("click", () => {
  if (audioPlayer.paused) {
    if (currentPlayingTrack) {
      audioPlayer.play();
      playPauseButton.querySelector("img").src = "img/pause.svg";
      trackNumbers[
        currentTrackIndex
      ].innerHTML = `<img src="img/Waving.gif" alt="Playing" class="playing-gif">`;
      currentPlayButton.querySelector("img").src = "img/pause.svg";
    }
  } else {
    audioPlayer.pause();
    playPauseButton.querySelector("img").src = "img/play.svg";
    trackNumbers[currentTrackIndex].textContent = currentTrackIndex + 1;
    currentPlayButton.querySelector("img").src = "img/play.svg";
  }
});

// Update progress bar and time display as the track plays
audioPlayer.addEventListener("timeupdate", () => {
  const currentTime = audioPlayer.currentTime;
  const progressPercent = (currentTime / audioPlayer.duration) * 100;
  progressBar.value = progressPercent;
  progressBar.style.background = `linear-gradient(to right, purple ${progressPercent}%, #d3d3d3 ${progressPercent}% 100%)`;

  currentTimeElem.textContent = formatCurrentTime(currentTime);
});

// Play the next track when the current one ends
audioPlayer.addEventListener("ended", () => {
  skipToNextTrack(currentTrackIndex);
});

// Format the current time from seconds to minutes:seconds
function formatCurrentTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${minutes}:${sec < 10 ? "0" : ""}${sec}`;
}

// Skip to the previous track
function skipToPrevTrack() {
  let prevIndex = currentTrackIndex - 1;
  while (prevIndex >= 0 && !tracks[prevIndex].track.preview_url) {
    prevIndex--;
  }
  if (prevIndex >= 0) {
    playTrack(
      prevIndex,
      trackElements[prevIndex].querySelector("button"),
      trackElements[prevIndex]
    );
  }
}

// Skip to the next track
function skipToNextTrack(index) {
  let nextIndex = index !== undefined ? index + 1 : currentTrackIndex + 1;
  while (nextIndex < tracks.length && !tracks[nextIndex].track.preview_url) {
    nextIndex++;
  }
  if (nextIndex < tracks.length) {
    playTrack(
      nextIndex,
      trackElements[nextIndex].querySelector("button"),
      trackElements[nextIndex]
    );
  } else {
    audioPlayer.pause();
    playPauseButton.querySelector("img").src = "img/play.svg";
    if (currentPlayButton) {
      currentPlayButton.querySelector("img").src = "img/play.svg";
    }
  }
}

// Event listeners for previous and next buttons
const prevButton = document.getElementById("prev-btn");
prevButton.addEventListener("click", skipToPrevTrack);

const nextButton = document.getElementById("next-btn");
nextButton.addEventListener("click", () => skipToNextTrack(currentTrackIndex));

// Fetch Spotify API token and then fetch playlist data
fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " + btoa(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET),
  },
  body: "grant_type=client_credentials",
})
  .then((response) => response.json())
  .then((data) => {
    const token = data.access_token;
    fetchPlaylist(token, PLAYLIST_ID);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
