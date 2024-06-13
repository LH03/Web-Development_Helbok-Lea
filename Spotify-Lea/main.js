const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "6QYQQWUQ14VxtOyju93Hn6";
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
let isPlaylistTitleFixed = false;

window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY;

  if (scrollPosition > player.offsetTop && !isPlaylistTitleFixed) {
    navbar.style.height = navbar.offsetHeight + "px"; // Maintain navbar height
    playlistTitle.style.position = "fixed";
    playlistTitle.style.top = "0";
    playlistTitle.style.left = "50%";
    playlistTitle.style.transform = "translateX(-50%)";
    isPlaylistTitleFixed = true;
  } else if (scrollPosition <= player.offsetTop && isPlaylistTitleFixed) {
    navbar.style.height = ""; // Reset navbar height
    playlistTitle.style.position = "";
    playlistTitle.style.top = "";
    playlistTitle.style.left = "";
    playlistTitle.style.transform = "";
    isPlaylistTitleFixed = false;
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

        // Set the player to the first track's details
        const firstTrack = tracks[0].track;
        if (firstTrack) {
          albumArt.src = firstTrack.album.images[0].url;
          trackNameElem.textContent = firstTrack.name;
          artistNameElem.textContent = firstTrack.artists[0].name;
          audioPlayer.src = firstTrack.preview_url;
          audioPlayer.style.display = firstTrack.preview_url ? "block" : "none";
          if (firstTrack.preview_url) {
            audioPlayer.play();
            currentPlayingTrack = firstTrack.preview_url;
            currentTrackIndex = 0;
            trackElements[0].classList.add("active-track");
            trackNumbers[0].innerHTML = `<img src="img/Waving.gif" alt="Playing" class="playing-gif">`;
          } else {
            skipToNextTrack();
          }
        }
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
      ].innerHTML = `<img src="img/Waving.gif" alt="Playing" class="playing-gif">`; // Display GIF
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
      skipToNextTrack();
    }
  }
}

function skipToNextTrack() {
  let nextIndex = currentTrackIndex + 1;
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
    console.log("No more tracks available.");
  }
}

audioPlayer.addEventListener("ended", skipToNextTrack);

function fetchSpotifyToken() {
  const url = "https://accounts.spotify.com/api/token";
  const body = "grant_type=client_credentials";
  const headers = {
    Authorization: `Basic ${btoa(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
    )}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  fetch(url, {
    method: "POST",
    headers: headers,
    body: body,
  })
    .then((response) => response.json())
    .then((data) => {
      const token = data.access_token;
      fetchPlaylist(token, PLAYLIST_ID);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

fetchSpotifyToken();

document.addEventListener("DOMContentLoaded", function () {
  const audioPlayer = document.getElementById("audio-player");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const playPauseIcon = document.getElementById("play-pause-icon");
  const progressBar = document.getElementById("progress-bar");
  const currentTimeDisplay = document.getElementById("current-time");
  const durationDisplay = document.getElementById("duration");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const randomBtn = document.getElementById("random-btn");
  let tracks = [];
  let currentTrackIndex = 0;

  function loadTrack(trackUrl) {
    audioPlayer.src = trackUrl;
    audioPlayer.load();
  }

  function playTrack() {
    audioPlayer.play();
    playPauseIcon.src = "img/pause.svg";
  }

  function pauseTrack() {
    audioPlayer.pause();
    playPauseIcon.src = "img/play.svg";
  }

  playPauseBtn.addEventListener("click", function () {
    if (audioPlayer.paused) {
      playTrack();
    } else {
      pauseTrack();
    }
  });

  audioPlayer.addEventListener("timeupdate", function () {
    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration;

    currentTimeDisplay.textContent = formatTime(currentTime);
    durationDisplay.textContent = formatTime(duration);

    if (duration > 0) {
      progressBar.value = (currentTime / duration) * 100;
    }
  });

  progressBar.addEventListener("input", function () {
    const progress = progressBar.value;
    const duration = audioPlayer.duration;

    audioPlayer.currentTime = (progress / 100) * duration;
  });

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }

  function loadNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(tracks[currentTrackIndex].track.preview_url);
    playTrack();
    updateTrackInfo();
  }

  function loadPreviousTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(tracks[currentTrackIndex].track.preview_url);
    playTrack();
    updateTrackInfo();
  }

  function loadRandomTrack() {
    currentTrackIndex = Math.floor(Math.random() * tracks.length);
    loadTrack(tracks[currentTrackIndex].track.preview_url);
    playTrack();
    updateTrackInfo();
  }

  prevBtn.addEventListener("click", loadPreviousTrack);
  nextBtn.addEventListener("click", loadNextTrack);
  randomBtn.addEventListener("click", loadRandomTrack);

  function updateTrackInfo() {
    const currentTrack = tracks[currentTrackIndex].track;
    document.getElementById("album-art").src = currentTrack.album.images[0].url;
    document.getElementById("track-name").textContent = currentTrack.name;
    document.getElementById("artist-name").textContent =
      currentTrack.artists[0].name;
  }

  fetch("https://api.spotify.com/v1/playlists/YOUR_PLAYLIST_ID", {
    headers: {
      Authorization: "Bearer YOUR_ACCESS_TOKEN",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const playlist = data;
      const tracksElement = document.querySelector('[data-js="tracks"]');
      const playlistArt = document.getElementById("playlist-art");
      const playlistName = document.getElementById("playlist-name");
      const playlistOwner = document.getElementById("playlist-owner");
      const playlistDescription = document.getElementById(
        "playlist-description"
      );

      playlistArt.src = playlist.images[0].url;
      playlistName.textContent = playlist.name;
      playlistOwner.textContent = `By ${playlist.owner.display_name}`;
      playlistDescription.textContent = playlist.description;

      tracks = playlist.tracks.items;
      tracks.forEach((trackItem, index) => {
        const track = trackItem.track;
        const trackElement = document.createElement("li");
        trackElement.innerHTML = `
              <span class="track-number">${index + 1}</span>
              <img src="${
                track.album.images[2].url
              }" alt="Track Art" class="track-image">
              <div class="track-details">
                  <span class="track">${track.name}</span>
                  <span class="artist">${track.artists[0].name}</span>
              </div>
              <span class="duration">${formatTime(
                track.duration_ms / 1000
              )}</span>
              <button class="play-btn" data-index="${index}"><img src="img/play.svg" alt="Play"></button>
          `;
        tracksElement.appendChild(trackElement);
      });

      document.querySelectorAll(".play-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const index = parseInt(this.getAttribute("data-index"));
          currentTrackIndex = index;
          loadTrack(tracks[index].track.preview_url);
          playTrack();
          updateTrackInfo();
        });
      });
    })
    .catch((error) => console.error("Error fetching playlist data:", error));
});
