// Supabase Configuration
const SUPABASE_URL = 'https://bfodgcylqpiymobsxweq.supabase.co';
// WARNING: Do NOT use the sb_publishable key here. You MUST use the anon public key (starts with eyJ)
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2RnY3lscXBpeW1vYnN4d2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMjM0MDAsImV4cCI6MjEwMzg5OTQwMH0.3v4SJWfCZW_H66lUa8KFoksK90r6pR4Ko0sS0mv-NLU';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const songForm = document.getElementById('songForm');
const adminSongsTable = document.getElementById('adminSongsTable');
const songIdInput = document.getElementById('songId');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const albumInput = document.getElementById('album');
const coverUrlInput = document.getElementById('cover_url');
const audioUrlInput = document.getElementById('audio_url');
const formTitle = document.getElementById('formTitle');
const cancelBtn = document.getElementById('cancelBtn');

// State
let isEditing = false;

// Initialize
async function init() {
  await fetchAdminSongs();

  songForm.addEventListener('submit', handleFormSubmit);
  cancelBtn.addEventListener('click', resetForm);
}

// Fetch Songs
async function fetchAdminSongs() {
  try {
    const { data, error } = await supabaseClient
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    renderAdminTable(data || []);
  } catch (error) {
    console.error('Error fetching songs for admin:', error);
    adminSongsTable.innerHTML = '<tr><td colspan="4">Error loading songs</td></tr>';
  }
}

// Render Table
function renderAdminTable(songs) {
  if (songs.length === 0) {
    adminSongsTable.innerHTML = '<tr><td colspan="4">No songs available. Add one above!</td></tr>';
    return;
  }

  adminSongsTable.innerHTML = songs.map(song => `
    <tr>
      <td><img src="${song.cover_url || 'https://via.placeholder.com/40'}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;"></td>
      <td style="font-weight:600;">${song.title}</td>
      <td style="color:#B3B3B3;">${song.artist}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editSong(${song.id})"><i class="fas fa-edit"></i></button>
        <button class="action-btn" onclick="deleteSong(${song.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// Handle Add / Edit
async function handleFormSubmit(e) {
  e.preventDefault();

  const songData = {
    title: titleInput.value,
    artist: artistInput.value,
    album: albumInput.value,
    cover_url: coverUrlInput.value,
    audio_url: audioUrlInput.value
  };

  try {
    if (isEditing) {
      const { error } = await supabaseClient
        .from('songs')
        .update(songData)
        .eq('id', songIdInput.value);

      if (error) throw error;
      alert('Song updated successfully!');
    } else {
      const { error } = await supabaseClient
        .from('songs')
        .insert([songData]);

      if (error) throw error;
      alert('Song added successfully!');
    }

    resetForm();
    fetchAdminSongs();
  } catch (error) {
    console.error('Error saving song:', error);
    alert('Failed to save song. Check console for details.');
  }
}

// Prepare Edit
async function editSong(id) {
  try {
    const { data, error } = await supabaseClient
      .from('songs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    songIdInput.value = data.id;
    titleInput.value = data.title;
    artistInput.value = data.artist;
    albumInput.value = data.album || '';
    coverUrlInput.value = data.cover_url || '';
    audioUrlInput.value = data.audio_url;

    isEditing = true;
    formTitle.textContent = 'Edit Song';
    cancelBtn.style.display = 'inline-block';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Error loading song for edit:', error);
  }
}

// Delete Song
async function deleteSong(id) {
  if (!confirm('Are you sure you want to delete this song?')) return;

  try {
    const { error } = await supabaseClient
      .from('songs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    fetchAdminSongs();
  } catch (error) {
    console.error('Error deleting song:', error);
    alert('Failed to delete song.');
  }
}

// Reset Form
function resetForm() {
  songForm.reset();
  songIdInput.value = '';
  isEditing = false;
  formTitle.textContent = 'Add New Song';
  cancelBtn.style.display = 'none';
}

// Start
init();
