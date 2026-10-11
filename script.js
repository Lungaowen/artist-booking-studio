const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const cards = $$('.artist-card');
const searchInput = $('#searchInput');
const categorySelect = $('#categorySelect');
const locationSelect = $('#locationSelect');
const resultsCount = $('#resultsCount');
const emptyState = $('#emptyState');
let activeFilter = 'all';
let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}
function filterArtists() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value !== 'all' ? categorySelect.value : activeFilter;
  const location = locationSelect.value;
  let visible = 0;
  cards.forEach(card => {
    const matchesQuery = (card.dataset.name + ' ' + card.dataset.vibe + ' ' + card.dataset.category + ' ' + card.dataset.location).toLowerCase().includes(query);
    const matchesCategory = category === 'all' || card.dataset.category === category;
    const matchesLocation = location === 'all' || card.dataset.location === location;
    const show = matchesQuery && matchesCategory && matchesLocation;
    card.hidden = !show;
    if (show) visible++;
  });
  resultsCount.textContent = String(visible).padStart(2, '0') + (visible === 1 ? ' artist' : ' artists');
  emptyState.hidden = visible !== 0;
}
searchInput.addEventListener('input', filterArtists);
categorySelect.addEventListener('change', () => {
  activeFilter = categorySelect.value;
  $$('.filter-chip').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === activeFilter));
  filterArtists();
});
locationSelect.addEventListener('change', filterArtists);
$('#searchBtn').addEventListener('click', () => {
  filterArtists();
  $('#artists').scrollIntoView({ behavior: 'smooth' });
});
$$('.filter-chip').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  categorySelect.value = activeFilter;
  $$('.filter-chip').forEach(btn => btn.classList.toggle('active', btn === button));
  filterArtists();
}));
function resetFilters() {
  searchInput.value = '';
  categorySelect.value = 'all';
  locationSelect.value = 'all';
  activeFilter = 'all';
  $$('.filter-chip').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === 'all'));
  filterArtists();
}
$('#clearFilters').addEventListener('click', event => { event.preventDefault(); resetFilters(); });
$('#resetSearch').addEventListener('click', resetFilters);
$$('.save-btn').forEach(button => button.addEventListener('click', () => {
  button.classList.toggle('saved');
  button.textContent = button.classList.contains('saved') ? '♥' : '♡';
  const artist = button.closest('.artist-card').dataset.name;
  showToast(button.classList.contains('saved') ? artist + ' saved to your shortlist.' : artist + ' removed from your shortlist.');
}));
const dialog = $('#bookingDialog');
function openBooking(artist) {
  $('#bookingArtist').textContent = artist + '.';
  $('#artistInput').value = artist;
  dialog.showModal();
}
$$('[data-book]').forEach(button => button.addEventListener('click', () => openBooking(button.dataset.book)));
$('#closeDialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
$('#bookingForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const date = new Date(form.get('date') + 'T12:00:00');
  const dateLabel = Number.isNaN(date.getTime()) ? form.get('date') : date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  const subject = encodeURIComponent('Artist booking request: ' + form.get('artist'));
  const body = encodeURIComponent(
    'Hi Encore,\n\nI would like to enquire about booking ' + form.get('artist') + '.\n\n' +
    'Name: ' + form.get('name') + '\nEmail: ' + form.get('email') + '\nEvent date: ' + dateLabel +
    '\nEvent type: ' + form.get('eventType') + '\nEvent details: ' + (form.get('details') || 'Not provided') +
    '\n\nPlease let me know about availability and next steps.'
  );
  showToast('Your booking request is ready in your email app.');
  dialog.close();
  window.location.href = 'mailto:hello@encore.example?subject=' + subject + '&body=' + body;
  event.currentTarget.reset();
});
$('#newsletterForm').addEventListener('submit', event => {
  event.preventDefault();
  const email = $('#emailInput').value.trim();
  showToast('You’re on the demo list, ' + email + '. Newsletter signup is a preview.');
  event.currentTarget.reset();
});
$('#signInBtn').addEventListener('click', () => showToast('Sign-in is a preview feature. No account is required to explore.'));
$('#menuToggle').addEventListener('click', () => {
  const nav = $('.desktop-nav');
  nav.classList.toggle('open');
  $('#menuToggle').setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
});
$$('.desktop-nav a').forEach(link => link.addEventListener('click', () => $('.desktop-nav').classList.remove('open')));
filterArtists();