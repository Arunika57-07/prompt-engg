// Supabase Configuration
const SUPABASE_URL = 'https://bfodgcylqpiymobsxweq.supabase.co';
// WARNING: Do NOT use the sb_publishable key here. You MUST use the anon public key (starts with eyJ)
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2RnY3lscXBpeW1vYnN4d2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMjM0MDAsImV4cCI6MjEwMzg5OTQwMH0.3v4SJWfCZW_H66lUa8KFoksK90r6pR4Ko0sS0mv-NLU';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const songsGrid = document.getElementById('songsGrid');
const searchInput = document.getElementById('searchInput');

// Player Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeSlider = document.getElementById('volumeSlider');
const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');

// State
let allSongs = [];
let currentSongIndex = -1;
let isPlaying = false;

// Initialize
async function init() {
  await fetchSongs();
  setupEventListeners();
}

// Fetch songs from Supabase
async function fetchSongs() {
  try {
    const { data, error } = await supabaseClient
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    allSongs = data || [];
    renderSongs(allSongs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    songsGrid.innerHTML = '<p>Error loading songs. Check your Supabase connection.</p>';
  }
}

// Render songs to DOM
function renderSongs(songs) {
  if (songs.length === 0) {
    songsGrid.innerHTML = '<p>No songs found.</p>';
    return;
  }

  songsGrid.innerHTML = songs.map((song, index) => `
    <div class="song-card" onclick="playSongAtIndex(${allSongs.findIndex(s => s.id === song.id)})">
      <img src="${song.cover_url || 'https://via.placeholder.com/200'}" alt="${song.title}" class="song-cover">
      <div class="song-title">${song.title}</div>
      <div class="song-artist">${song.artist}</div>
      <div class="play-overlay">
        <i class="fas fa-play"></i>
      </div>
    </div>
  `).join('');
}

// Player Functions
function playSongAtIndex(index) {
  if (index < 0 || index >= allSongs.length) return;

  currentSongIndex = index;
  const song = allSongs[index];
  
  if (!song.audio_url || song.audio_url.trim() === '') {
    alert("This song does not have a valid audio URL!");
    return;
  }

  audioPlayer.src = song.audio_url;
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  
  // Use placeholder if cover_url is empty string or null
  playerCover.src = (song.cover_url && song.cover_url.trim() !== '') ? song.cover_url : 'https://via.placeholder.com/56';

  playAudio();
}

function playAudio() {
  const playPromise = audioPlayer.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      isPlaying = true;
      playIcon.classList.remove('fa-play');
      playIcon.classList.add('fa-pause');
    }).catch(error => {
      console.error("Playback error:", error);
      alert("Cannot play audio. Make sure you entered a valid audio URL (e.g. ending in .mp3).");
    });
  }
}

function pauseAudio() {
  audioPlayer.pause();
  isPlaying = false;
  playIcon.classList.remove('fa-pause');
  playIcon.classList.add('fa-play');
}

function togglePlay() {
  if (currentSongIndex === -1 && allSongs.length > 0) {
    playSongAtIndex(0);
    return;
  }

  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function playNext() {
  let nextIndex = currentSongIndex + 1;
  if (nextIndex >= allSongs.length) nextIndex = 0; // Loop back
  playSongAtIndex(nextIndex);
}

function playPrev() {
  let prevIndex = currentSongIndex - 1;
  if (prevIndex < 0) prevIndex = allSongs.length - 1;
  playSongAtIndex(prevIndex);
}

// Update Progress
function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  if (isNaN(duration)) return;

  const progressPercent = (currentTime / duration) * 100;
  progressBar.style.width = `${progressPercent}%`;

  currentTimeEl.textContent = formatTime(currentTime);
  totalTimeEl.textContent = formatTime(duration);
}

// Set Progress on Click
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audioPlayer.duration;

  if (isNaN(duration)) return;

  audioPlayer.currentTime = (clickX / width) * duration;
}

// Format time in minutes and seconds
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Event Listeners
function setupEventListeners() {
  playPauseBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', playNext);
  prevBtn.addEventListener('click', playPrev);

  audioPlayer.addEventListener('timeupdate', updateProgress);
  audioPlayer.addEventListener('ended', playNext);

  progressContainer.addEventListener('click', setProgress);

  volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value;
  });

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allSongs.filter(song =>
      song.title.toLowerCase().includes(term) ||
      song.artist.toLowerCase().includes(term) ||
      (song.album && song.album.toLowerCase().includes(term))
    );
    renderSongs(filtered);
  });
}

// Start
init();
