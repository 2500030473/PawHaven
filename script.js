
'use strict';

/* =========================================
   PAWHAVEN - MAIN JAVASCRIPT
========================================= */

const STORAGE = {
  pets: 'pawhaven_pets_v2',
  users: 'pawhaven_users_v2',
  session: 'pawhaven_session_v2',
  chats: 'pawhaven_chats_v2',
  offers: 'pawhaven_offers_v2',
  applications: 'pawhaven_applications_v1'
};

/* =========================================
   SAMPLE PETS
========================================= */

const seedPets = [
  {
    id: 'seed-1',
    name: 'Barnaby',
    species: 'Dogs',
    breed: 'Golden Retriever',
    price: 1500,
    age: '1 year 2 months',
    gender: 'Male',
    location: 'Vijayawada',
    character: ['Playful', 'Affectionate', 'Child-Friendly'],
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    description: 'A sunshine boy who loves fetch, outdoor walks and cuddles.',
    health: {
      vaccinated: true,
      dewormed: true,
      checkup: true,
      groomed: true,
      sterilized: false
    },
    status: 'available',
    ownerId: 'pawhaven-demo',
    ownerName: 'PawHaven Team'
  },
  {
    id: 'seed-2',
    name: 'Mochi',
    species: 'Cats',
    breed: 'Domestic Shorthair Mix',
    price: 1000,
    age: '8 months',
    gender: 'Female',
    location: 'Vijayawada',
    character: ['Gentle', 'Calm', 'Lap Cat'],
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    description: 'A sweet purring friend who adores window perches.',
    health: {
      vaccinated: true,
      dewormed: true,
      checkup: true,
      groomed: false,
      sterilized: false
    },
    status: 'available',
    ownerId: 'pawhaven-demo',
    ownerName: 'PawHaven Team'
  },
  {
    id: 'seed-3',
    name: 'Rio & Sky',
    species: 'Birds',
    breed: 'Budgerigar Pair',
    price: 800,
    age: '6 months',
    gender: 'Unknown',
    location: 'Vijayawada',
    character: ['Chirpy', 'Social'],
    image: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=600&q=80',
    description: 'A bonded pair of musical budgies looking for a sunny home.',
    health: {},
    status: 'available',
    ownerId: 'pawhaven-demo',
    ownerName: 'PawHaven Team'
  },
  {
    id: 'seed-4',
    name: 'Clover',
    species: 'Rabbits',
    breed: 'Dwarf Lop Mix',
    price: 1200,
    age: '10 months',
    gender: 'Female',
    location: 'Vijayawada',
    character: ['Curious', 'Gentle'],
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80',
    description: 'Clover enjoys fresh greens and delightful happy binkies.',
    health: {},
    status: 'available',
    ownerId: 'pawhaven-demo',
    ownerName: 'PawHaven Team'
  },
  {
    id: 'seed-5',
    name: 'Peanut',
    species: 'Hamsters',
    breed: 'Syrian Hamster',
    price: 600,
    age: '5 months',
    gender: 'Male',
    location: 'Vijayawada',
    character: ['Active', 'Hand-Tamed'],
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
    description: 'A curious little builder who enjoys burrowing and running on his wheel.',
    health: {},
    status: 'available',
    ownerId: 'pawhaven-demo',
    ownerName: 'PawHaven Team'
  }
];

/* =========================================
   LOAD AND SAVE DATA
========================================= */

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    alert('Browser storage is full. Please upload a smaller image.');
    return false;
  }
}

let pets = read(STORAGE.pets, seedPets);
let users = read(STORAGE.users, []);
let chats = read(STORAGE.chats, []);
let offers = read(STORAGE.offers, []);
let applications = read(STORAGE.applications, []);

if (!localStorage.getItem(STORAGE.pets)) {
  save(STORAGE.pets, pets);
}

let currentUser = read(STORAGE.session, null);
let activeConversationId = null;
let accountMode = 'login';
let selectedImageData = '';
let editingPetId = null;

function persistAll() {
  save(STORAGE.pets, pets);
  save(STORAGE.users, users);
  save(STORAGE.chats, chats);
  save(STORAGE.offers, offers);
  save(STORAGE.applications, applications);
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
}

function money(value) {
  return '₹' + Number(value || 0).toLocaleString('en-IN');
}

function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.remove('hidden');

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    el.classList.add('hidden');
  }, 3200);
}

function ownerOf(pet) {
  if (!pet) return 'Pet Owner';

  return pet.ownerId === 'pawhaven-demo'
    ? 'PawHaven Team'
    : (users.find(u => u.id === pet.ownerId)?.name ||
       pet.ownerName || 'Pet Owner');
}

function getPetHealth(pet) {
  const h = pet.health || {};

  return [
    ['vaccinated', 'Vaccinated'],
    ['dewormed', 'Dewormed'],
    ['checkup', 'Health Checked'],
    ['groomed', 'Groomed'],
    ['sterilized', 'Sterilized']
  ].filter(([key]) => h[key]).map(([, label]) => label);
}

/* =========================================
   BROWSE PETS
========================================= */

function renderPets() {
  const term = document.getElementById('petSearchInput')
    .value.trim().toLowerCase();

  const species = document.getElementById('speciesFilter').value;

  const filtered = pets.filter(p =>
    p.status !== 'adopted' &&
    (species === 'All' || p.species === species) &&
    [
      p.name,
      p.breed,
      p.species,
      p.location || '',
      ...(p.character || [])
    ].join(' ').toLowerCase().includes(term)
  );

  document.getElementById('petCount').textContent =
    `${filtered.length} pets available`;

  document.getElementById('noResults')
    .classList.toggle('hidden', filtered.length > 0);

  document.getElementById('petsGrid').innerHTML =
    filtered.map(p => `
      <article class="pet-card">

        <img src="${escapeHTML(p.image)}"
             alt="${escapeHTML(p.name)}"
             loading="lazy">

        <div class="card-body">

          <div>
            <span class="tag">${escapeHTML(p.species)}</span>
            <span class="tag">${escapeHTML(p.age)}</span>
          </div>

          <h3>${escapeHTML(p.name)}</h3>

          <p class="muted small">
            ${escapeHTML(p.breed)}
          </p>

          <p class="muted small">
            📍 ${escapeHTML(p.location || 'Location not specified')}
          </p>

          <p class="muted small">
            Listed by ${escapeHTML(ownerOf(p))}
          </p>

          <p>${escapeHTML(p.description)}</p>

          <p class="price">Fee: ${money(p.price)}</p>

          <div>
            ${(p.character || []).map(t =>
              `<span class="tag">${escapeHTML(t)}</span>`
            ).join('')}
          </div>

          <div class="health-tags">
            ${getPetHealth(p).map(h =>
              `<span>✓ ${escapeHTML(h)}</span>`
            ).join('')}
          </div>

          <div class="card-actions">
            <button class="btn btn-primary"
              onclick="startChat('${p.id}')">
              Chat with owner
            </button>

            <button class="btn btn-secondary"
              onclick="prefillAdoption('${p.id}')">
              Apply
            </button>
          </div>

        </div>
      </article>
    `).join('');
}

/* =========================================
   ACCOUNT SYSTEM
========================================= */

function updateAccountUI() {
  const signed = !!currentUser;
  const isOwner = signed && currentUser.role === 'owner';

  document.getElementById('signedInLabel').textContent =
    signed
      ? `${currentUser.name} · ${currentUser.role}`
      : 'Guest';

  document.getElementById('accountButton')
    .classList.toggle('hidden', signed);

  document.getElementById('logoutButton')
    .classList.toggle('hidden', !signed);

  document.getElementById('ownerLocked')
    .classList.toggle('hidden', isOwner);

  document.getElementById('ownerDashboard')
    .classList.toggle('hidden', !isOwner);

  document.getElementById('ownerStatus').textContent =
    isOwner ? 'Owner account active' :
    signed ? 'Adopter account' : 'Not signed in';

  document.getElementById('chatLocked')
    .classList.toggle('hidden', signed);

  document.getElementById('chatPanel')
    .classList.toggle('hidden', !signed);

  if (!signed) {
    activeConversationId = null;
  }

  renderOwnerDashboard();
  renderConversationList();
}

function openAccount(mode = 'login') {
  accountMode = mode;
  setAccountMode();

  document.getElementById('accountMessage').textContent = '';

  document.getElementById('accountModal')
    .classList.add('active');
}

function setAccountMode() {
  const signup = accountMode === 'signup';

  document.getElementById('nameField')
    .classList.toggle('hidden', !signup);

  document.getElementById('roleField')
    .classList.toggle('hidden', !signup);

  document.getElementById('accountName').required = signup;

  document.getElementById('loginTab')
    .classList.toggle('active', !signup);

  document.getElementById('signupTab')
    .classList.toggle('active', signup);

  document.getElementById('accountSubmit').textContent =
    signup ? 'Create account' : 'Login';
}

document.getElementById('accountButton')
  .addEventListener('click', () => openAccount('login'));

document.getElementById('loginTab')
  .addEventListener('click', () => {
    accountMode = 'login';
    setAccountMode();
  });

document.getElementById('signupTab')
  .addEventListener('click', () => {
    accountMode = 'signup';
    setAccountMode();
  });

document.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.close)
      .classList.remove('active');
  });
});

document.getElementById('accountModal')
  .addEventListener('click', e => {
    if (e.target.id === 'accountModal') {
      e.currentTarget.classList.remove('active');
    }
  });

/* =========================================
   LOGIN AND SIGNUP
========================================= */

document.getElementById('accountForm')
  .addEventListener('submit', e => {

    e.preventDefault();

    const email = document.getElementById('accountEmail')
      .value.trim().toLowerCase();

    const password = document.getElementById('accountPassword').value;

    const message = document.getElementById('accountMessage');

    if (accountMode === 'signup') {

      const name = document.getElementById('accountName')
        .value.trim();

      if (!name) {
        message.textContent = 'Please enter your name.';
        return;
      }

      if (users.some(u => u.email === email)) {
        message.textContent = 'This email is already registered.';
        return;
      }

      const user = {
        id: 'user-' + Date.now(),
        name,
        email,
        password,
        role: document.getElementById('accountRole').value
      };

      users.push(user);

      currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

    } else {

      const user = users.find(u =>
        u.email === email && u.password === password
      );

      if (!user) {
        message.textContent = 'Incorrect email or password.';
        return;
      }

      currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    }

    if (!save(STORAGE.users, users) ||
        !save(STORAGE.session, currentUser)) {
      currentUser = null;
      return;
    }

    document.getElementById('accountModal')
      .classList.remove('active');

    e.target.reset();

    updateAccountUI();

    toast('Welcome to PawHaven, ' + currentUser.name + '!');
  });

/* =========================================
   LOGOUT
========================================= */

document.getElementById('logoutButton')
  .addEventListener('click', () => {

    currentUser = null;
    activeConversationId = null;

    localStorage.removeItem(STORAGE.session);

    updateAccountUI();

    toast('You have logged out.');
  });

/* =========================================
   SEARCH AND FILTER
========================================= */

document.getElementById('petSearchInput')
  .addEventListener('input', renderPets);

document.getElementById('speciesFilter')
  .addEventListener('change', renderPets);

/* =========================================
   PET IMAGE UPLOAD AND PREVIEW
========================================= */

document.getElementById('petImage')
  .addEventListener('change', e => {

    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');

    selectedImageData = '';

    if (!file) {
      preview.classList.add('hidden');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast('Please select an image file.');
      e.target.value = '';
      return;
    }

    if (file.size > 700 * 1024) {
      toast('Image must be smaller than 700 KB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      selectedImageData = reader.result;
      preview.src = selectedImageData;
      preview.classList.remove('hidden');
    };

    reader.onerror = () => toast('Unable to read this image.');

    reader.readAsDataURL(file);
  });

/* =========================================
   RESET PET FORM
========================================= */

function resetPetForm() {
  document.getElementById('petUploadForm').reset();

  selectedImageData = '';
  editingPetId = null;

  document.getElementById('imagePreview')
    .classList.add('hidden');

  document.getElementById('petUploadForm')
    .querySelector('h3').textContent = '➕ Add a New Pet';

  document.querySelector('#petUploadForm button[type="submit"]')
    .textContent = '🐾 Publish Pet';

  document.getElementById('petImage').required = true;

  document.getElementById('cancelEditBtn')
    .classList.add('hidden');
}

document.getElementById('cancelEditBtn')
  .addEventListener('click', resetPetForm);

/* =========================================
   PUBLISH OR UPDATE PET
========================================= */

document.getElementById('petUploadForm')
  .addEventListener('submit', e => {

    e.preventDefault();

    if (!currentUser || currentUser.role !== 'owner') {
      toast('Please log in with an owner account.');
      return;
    }

    const existing = editingPetId
      ? pets.find(p => p.id === editingPetId)
      : null;

    if (!selectedImageData && !existing) {
      toast('Please upload a pet photo.');
      return;
    }

    const petData = {
      name: document.getElementById('newPetName').value.trim(),
      species: document.getElementById('newPetSpecies').value,
      breed: document.getElementById('newPetBreed').value.trim(),
      age: document.getElementById('newPetAge').value.trim(),
      gender: document.getElementById('newPetGender').value,
      price: Number(document.getElementById('newPetPrice').value),
      location: document.getElementById('newPetLocation').value.trim(),

      character: document.getElementById('newPetTraits')
        .value.split(',').map(x => x.trim()).filter(Boolean),

      description: document.getElementById('newPetDescription')
        .value.trim(),

      health: {
        vaccinated: document.getElementById('healthVaccinated').checked,
        dewormed: document.getElementById('healthDewormed').checked,
        checkup: document.getElementById('healthCheckup').checked,
        groomed: document.getElementById('healthGroomed').checked,
        sterilized: document.getElementById('healthSterilized').checked
      }
    };

    if (petData.price < 0 || !Number.isFinite(petData.price)) {
      toast('Enter a valid fee.');
      return;
    }

    if (editingPetId) {

      const index = pets.findIndex(p =>
        p.id === editingPetId &&
        p.ownerId === currentUser.id
      );

      if (index === -1) {
        toast('Pet listing not found.');
        resetPetForm();
        return;
      }

      const updatedPet = {
        ...pets[index],
        ...petData,
        image: selectedImageData || pets[index].image
      };

      pets[index] = updatedPet;

      if (!save(STORAGE.pets, pets)) return;

      toast('Pet listing updated successfully!');

    } else {

      const pet = {
        id: 'pet-' + Date.now(),
        ...petData,
        image: selectedImageData,
        status: 'available',
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        createdAt: new Date().toISOString()
      };

      pets.unshift(pet);

      if (!save(STORAGE.pets, pets)) {
        pets.shift();
        return;
      }

      toast('Your pet has been published successfully!');
    }

    resetPetForm();

    renderPets();
    renderOwnerDashboard();
  });

/* =========================================
   EDIT PET
========================================= */

function editPet(id) {

  if (!currentUser || currentUser.role !== 'owner') return;

  const pet = pets.find(p =>
    p.id === id && p.ownerId === currentUser.id
  );

  if (!pet) return;

  editingPetId = id;
  selectedImageData = '';

  document.getElementById('newPetName').value = pet.name;
  document.getElementById('newPetSpecies').value = pet.species;
  document.getElementById('newPetBreed').value = pet.breed;
  document.getElementById('newPetAge').value = pet.age;
  document.getElementById('newPetGender').value = pet.gender || 'Unknown';
  document.getElementById('newPetPrice').value = pet.price;
  document.getElementById('newPetLocation').value = pet.location || '';
  document.getElementById('newPetTraits').value =
    (pet.character || []).join(', ');

  document.getElementById('newPetDescription').value = pet.description;

  const h = pet.health || {};

  document.getElementById('healthVaccinated').checked = !!h.vaccinated;
  document.getElementById('healthDewormed').checked = !!h.dewormed;
  document.getElementById('healthCheckup').checked = !!h.checkup;
  document.getElementById('healthGroomed').checked = !!h.groomed;
  document.getElementById('healthSterilized').checked = !!h.sterilized;

  document.getElementById('imagePreview').src = pet.image;
  document.getElementById('imagePreview').classList.remove('hidden');

  document.getElementById('petImage').required = false;

  document.querySelector('#petUploadForm h3').textContent =
    '✏️ Edit Pet Details';

  document.querySelector('#petUploadForm button[type="submit"]')
    .textContent = 'Save Changes';

  document.getElementById('cancelEditBtn')
    .classList.remove('hidden');

  document.getElementById('petUploadForm')
    .scrollIntoView({ behavior: 'smooth' });

  toast('Edit the pet information and save your changes.');
}

/* =========================================
   DELETE PET
========================================= */

function deletePet(id) {

  if (!currentUser || currentUser.role !== 'owner') return;

  const pet = pets.find(p =>
    p.id === id && p.ownerId === currentUser.id
  );

  if (!pet) return;

  if (!confirm('Are you sure you want to delete ' + pet.name + '?')) {
    return;
  }

  pets = pets.filter(p => p.id !== id);
  offers = offers.filter(o => o.petId !== id);
  chats = chats.filter(c => c.petId !== id);
  applications = applications.filter(a => a.petId !== id);

  persistAll();

  renderPets();
  renderOwnerDashboard();
  renderConversationList();

  toast('Pet listing deleted.');
}

/* =========================================
   CHANGE PET AVAILABILITY
========================================= */

function togglePetStatus(id) {

  if (!currentUser || currentUser.role !== 'owner') return;

  const pet = pets.find(p =>
    p.id === id && p.ownerId === currentUser.id
  );

  if (!pet) return;

  pet.status = pet.status === 'available'
    ? 'unavailable'
    : 'available';

  save(STORAGE.pets, pets);

  renderPets();
  renderOwnerDashboard();

  toast('Pet availability updated.');
}

/* =========================================
   OWNER DASHBOARD
========================================= */

function renderOwnerDashboard() {

  if (!currentUser || currentUser.role !== 'owner') return;

  const mine = pets.filter(p =>
    p.ownerId === currentUser.id
  );

  const myApplications = applications.filter(a =>
    mine.some(p => p.id === a.petId)
  );

  const myPending = myApplications.filter(a =>
    a.status === 'pending'
  );

  document.getElementById('totalPets').textContent = mine.length;

  document.getElementById('availablePets').textContent =
    mine.filter(p => p.status !== 'adopted' && p.status !== 'unavailable').length;

  document.getElementById('pendingApplications').textContent =
    myPending.length;

  document.getElementById('adoptedPets').textContent =
    mine.filter(p => p.status === 'adopted').length;

  /* MY PET LISTINGS */

  document.getElementById('myPetsList').innerHTML =
    mine.length
      ? mine.map(p => `
        <div class="listing-card">

          <img src="${escapeHTML(p.image)}"
               alt="${escapeHTML(p.name)}">

          <div class="listing-info">
            <b>${escapeHTML(p.name)}</b>
            <p class="small muted">
              ${escapeHTML(p.breed)} · ${money(p.price)}
            </p>

            <span class="status ${
              p.status === 'adopted' ? 'accepted' :
              p.status === 'unavailable' ? 'rejected' : 'pending'
            }">
              ${(p.status || 'available').toUpperCase()}
            </span>

            <div class="health-tags">
              ${getPetHealth(p).map(h =>
                `<span>✓ ${escapeHTML(h)}</span>`
              ).join('')}
            </div>
          </div>

          <div class="listing-actions">
            <button class="btn btn-secondary"
              onclick="editPet('${p.id}')">Edit</button>

            <button class="btn btn-warm"
              onclick="togglePetStatus('${p.id}')">
              ${p.status === 'available' ? 'Pause' : 'Activate'}
            </button>

            <button class="btn btn-danger"
              onclick="deletePet('${p.id}')">Delete</button>
          </div>
        </div>
      `).join('')
      : '<p class="muted small">You have not published any pets yet.</p>';

  /* ADOPTION REQUESTS */

  document.getElementById('ownerApplications').innerHTML =
    myApplications.length
      ? myApplications.map(a => {

        const pet = pets.find(p => p.id === a.petId);

        return `
          <div class="application-card">

            <b>🐾 ${escapeHTML(pet?.name || 'Pet')}</b>

            <p><b>Applicant:</b> ${escapeHTML(a.name)}</p>
            <p><b>Phone:</b> ${escapeHTML(a.phone)}</p>
            <p><b>Email:</b> ${escapeHTML(a.email)}</p>
            <p><b>Address:</b> ${escapeHTML(a.address)}</p>
            <p><b>Home:</b> ${escapeHTML(a.homeType)}</p>
            <p><b>Caretaker:</b> ${escapeHTML(a.caretaker)}</p>
            <p><b>Experience:</b> ${escapeHTML(a.experience)}</p>
            <p><b>Reason:</b> ${escapeHTML(a.reason)}</p>
            <p><b>Reference:</b> ${escapeHTML(a.tracking)}</p>

            <span class="status ${a.status}">
              ${a.status.toUpperCase()}
            </span>

            ${a.status === 'pending' ? `
              <div class="application-actions">

                <button class="btn btn-primary"
                  onclick="respondApplication('${a.id}','accepted')">
                  Accept Request
                </button>

                <button class="btn btn-danger"
                  onclick="respondApplication('${a.id}','rejected')">
                  Reject Request
                </button>

              </div>
            ` : ''}

          </div>
        `;
      }).join('')
      : '<p class="muted small">No adoption requests received yet.</p>';

  /* PRICE OFFERS */

  const mineOffers = offers.filter(o =>
    mine.some(p => p.id === o.petId)
  );

  document.getElementById('ownerOffers').innerHTML =
    mineOffers.length
      ? mineOffers.map(o => {

        const pet = pets.find(p => p.id === o.petId);

        return `
          <div class="offer-row">

            <span>
              <b>${escapeHTML(pet?.name || 'Pet')}</b><br>
              ${escapeHTML(o.adopterName)}
              offered ${money(o.amount)}<br>

              <span class="status ${o.status}">
                ${o.status.toUpperCase()}
              </span>
            </span>

            ${o.status === 'pending' ? `
              <span class="inline-actions">
                <button class="btn btn-primary small"
                  onclick="respondOffer('${o.id}','accepted')">
                  Accept
                </button>

                <button class="btn btn-danger small"
                  onclick="respondOffer('${o.id}','rejected')">
                  Reject
                </button>
              </span>
            ` : ''}

          </div>
        `;
      }).join('')
      : '<p class="muted small">No offers received yet.</p>';
}

/* =========================================
   ADOPTION REQUEST ACCEPT / REJECT
========================================= */

function respondApplication(id, status) {

  if (!currentUser || currentUser.role !== 'owner') return;

  const application = applications.find(a => a.id === id);

  if (!application || application.status !== 'pending') return;

  const pet = pets.find(p => p.id === application.petId);

  if (!pet || pet.ownerId !== currentUser.id) return;

  if (status === 'accepted') {

    if (!confirm('Accept this adoption request?')) return;

    const alreadyAccepted = applications.some(a =>
      a.petId === pet.id &&
      a.status === 'accepted'
    );

    if (alreadyAccepted) {
      toast('This pet already has an accepted request.');
      return;
    }

    application.status = 'accepted';
    application.respondedAt = new Date().toISOString();

    pet.status = 'adopted';

    applications.forEach(a => {
      if (a.petId === pet.id && a.id !== id && a.status === 'pending') {
        a.status = 'rejected';
      }
    });

  } else {

    application.status = 'rejected';
    application.respondedAt = new Date().toISOString();
  }

  save(STORAGE.applications, applications);
  save(STORAGE.pets, pets);

  renderPets();
  renderOwnerDashboard();

  toast(status === 'accepted'
    ? 'Adoption request accepted!'
    : 'Adoption request rejected.');
}

/* =========================================
   CHAT SYSTEM
========================================= */

function getConversation(petId, adopterId) {
  return chats.find(c =>
    c.petId === petId && c.adopterId === adopterId
  );
}

function startChat(petId) {

  if (!currentUser) {
    openAccount('login');
    toast('Please log in first.');
    return;
  }

  const pet = pets.find(p => p.id === petId);

  if (!pet) return;

  if (currentUser.role === 'owner') {

    if (pet.ownerId !== currentUser.id) {
      toast('You can only manage chats for your own pets.');
      return;
    }

    const related = chats.filter(c => c.petId === petId);

    if (!related.length) {
      toast('No adopter conversation yet.');
      return;
    }

    activeConversationId = related[0].id;

  } else {

    if (pet.ownerId === currentUser.id) {
      toast('You cannot message yourself.');
      return;
    }

    if (pet.status === 'adopted') {
      toast('This pet has already been adopted.');
      return;
    }

    let chat = getConversation(petId, currentUser.id);

    if (!chat) {
      chat = {
        id: 'chat-' + Date.now(),
        petId,
        adopterId: currentUser.id,
        adopterName: currentUser.name,
        ownerId: pet.ownerId,
        messages: []
      };

      chats.push(chat);
      save(STORAGE.chats, chats);
    }

    activeConversationId = chat.id;
  }

  document.getElementById('chats')
    .scrollIntoView({ behavior: 'smooth' });

  renderConversationList();
  renderActiveChat();
}

/* =========================================
   CONVERSATION LIST
========================================= */

function renderConversationList() {

  const container = document.getElementById('conversationList');

  if (!currentUser) {
    container.textContent = 'Please log in to view conversations.';
    return;
  }

  const list = chats.filter(c =>
    currentUser.role === 'owner'
      ? c.ownerId === currentUser.id
      : c.adopterId === currentUser.id
  );

  container.innerHTML =
    list.length
      ? list.map(c => {

        const pet = pets.find(p => p.id === c.petId);

        return `
          <button class="btn btn-secondary"
            style="display:block;width:100%;text-align:left;margin:.35rem 0"
            onclick="selectConversation('${c.id}')">

            ${escapeHTML(pet?.name || 'Pet')}<br>

            <small>
              ${currentUser.role === 'owner'
                ? escapeHTML(c.adopterName)
                : 'Owner chat'}
            </small>
          </button>
        `;
      }).join('')
      : 'No conversations yet. Open a pet card and select Chat with owner.';

  if (activeConversationId &&
      list.some(c => c.id === activeConversationId)) {
    renderActiveChat();
  }
}

function selectConversation(id) {
  activeConversationId = id;
  renderActiveChat();
}

/* =========================================
   DISPLAY CHAT MESSAGES
========================================= */

function renderActiveChat() {

  const c = chats.find(x => x.id === activeConversationId);

  if (!c || !currentUser) return;

  const pet = pets.find(p => p.id === c.petId);

  document.getElementById('activeChatTitle').innerHTML = `
    <b>${escapeHTML(pet?.name || 'Pet')} conversation</b>
    <span class="muted small">
      · ${currentUser.role === 'owner'
        ? 'Adopter: ' + escapeHTML(c.adopterName)
        : 'Owner: ' + escapeHTML(ownerOf(pet))}
    </span>
  `;

  document.getElementById('messages').innerHTML =
    c.messages.length
      ? c.messages.map(m => `
        <div class="message ${m.senderId === currentUser.id ? 'mine' : ''}">
          ${escapeHTML(m.text)}
          <small>
            ${escapeHTML(m.senderName)}
            · ${new Date(m.time).toLocaleString()}
          </small>
        </div>
      `).join('')
      : '<p class="empty">Say hello and ask about this pet.</p>';

  const messages = document.getElementById('messages');
  messages.scrollTop = messages.scrollHeight;

  const related = offers.filter(o =>
    o.petId === c.petId && o.adopterId === c.adopterId
  );

  document.getElementById('chatOffers').innerHTML =
    related.map(o => `
      <div class="offer-row">

        <span>
          Offer: <b>${money(o.amount)}</b><br>
          <span class="status ${o.status}">
            ${o.status.toUpperCase()}
          </span>
        </span>

        ${currentUser.role === 'owner' && o.status === 'pending' ? `
          <span>
            <button class="btn btn-primary small"
              onclick="respondOffer('${o.id}','accepted')">
              Accept
            </button>

            <button class="btn btn-danger small"
              onclick="respondOffer('${o.id}','rejected')">
              Reject
            </button>
          </span>
        ` : ''}

      </div>
    `).join('');
}

/* =========================================
   SEND MESSAGE
========================================= */

document.getElementById('messageForm')
  .addEventListener('submit', e => {

    e.preventDefault();

    const input = document.getElementById('messageInput');
    const text = input.value.trim();

    const c = chats.find(x => x.id === activeConversationId);

    if (!c || !text || !currentUser) return;

    c.messages.push({
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      time: new Date().toISOString()
    });

    save(STORAGE.chats, chats);

    input.value = '';

    renderActiveChat();
    renderConversationList();
  });

/* =========================================
   PRICE NEGOTIATION
========================================= */

document.getElementById('offerForm')
  .addEventListener('submit', e => {

    e.preventDefault();

    const c = chats.find(x => x.id === activeConversationId);

    const amount = Number(
      document.getElementById('offerAmount').value
    );

    if (!c) {
      toast('Choose a conversation first.');
      return;
    }

    if (currentUser.role !== 'adopter') {
      toast('Only adopters can send price offers.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      toast('Enter a valid offer amount.');
      return;
    }

    const pet = pets.find(p => p.id === c.petId);

    if (!pet || pet.status === 'adopted') {
      toast('This pet is no longer available.');
      return;
    }

    offers.push({
      id: 'offer-' + Date.now(),
      petId: c.petId,
      adopterId: currentUser.id,
      adopterName: currentUser.name,
      amount,
      status: 'pending',
      time: new Date().toISOString()
    });

    save(STORAGE.offers, offers);

    document.getElementById('offerAmount').value = '';

    renderActiveChat();
    renderOwnerDashboard();

    toast('Your price offer was sent to the owner.');
  });

/* =========================================
   OWNER ACCEPTS OR REJECTS OFFER
========================================= */

function respondOffer(id, status) {

  if (!currentUser || currentUser.role !== 'owner') return;

  const offer = offers.find(o => o.id === id);

  if (!offer || offer.status !== 'pending') return;

  const pet = pets.find(p => p.id === offer.petId);

  if (!pet || pet.ownerId !== currentUser.id) return;

  offer.status = status;

  save(STORAGE.offers, offers);

  renderOwnerDashboard();
  renderActiveChat();

  toast(status === 'accepted'
    ? 'Price offer accepted.'
    : 'Price offer rejected.');
}

/* =========================================
   ADOPTION FORM AUTO-FILL
========================================= */

function prefillAdoption(id) {

  const pet = pets.find(p => p.id === id);

  if (!pet || pet.status === 'adopted') return;

  document.getElementById('selectedPetId').value = pet.id;
  document.getElementById('formPetName').value = pet.name;
  document.getElementById('formPetAge').value = pet.age;

  const map = {
    Dogs: 'Dog',
    Cats: 'Cat',
    Birds: 'Bird',
    Rabbits: 'Rabbit',
    Fishes: 'Fish',
    Turtles: 'Turtle',
    Hamsters: 'Hamster'
  };

  document.getElementById('formPetType').value =
    map[pet.species] || 'Other';

  if (currentUser && currentUser.role === 'adopter') {
    document.getElementById('applicantName').value = currentUser.name;
    document.getElementById('emailAddress').value = currentUser.email;
  }

  document.getElementById('adoption-form')
    .scrollIntoView({ behavior: 'smooth' });

  toast('Complete the adoption application below.');
}

/* =========================================
   DIGITAL SIGNATURE
========================================= */

const sigCanvas = document.getElementById('sigCanvas');
const sigCtx = sigCanvas.getContext('2d');

let drawing = false;
let hasSigned = false;

sigCtx.lineWidth = 3;
sigCtx.lineCap = 'round';
sigCtx.strokeStyle = '#0f172a';

function signaturePoint(e) {
  const r = sigCanvas.getBoundingClientRect();

  return {
    x: (e.clientX - r.left) * sigCanvas.width / r.width,
    y: (e.clientY - r.top) * sigCanvas.height / r.height
  };
}

sigCanvas.addEventListener('pointerdown', e => {
  drawing = true;
  sigCanvas.setPointerCapture(e.pointerId);

  const p = signaturePoint(e);

  sigCtx.beginPath();
  sigCtx.moveTo(p.x, p.y);
});

sigCanvas.addEventListener('pointermove', e => {

  if (!drawing) return;

  const p = signaturePoint(e);

  sigCtx.lineTo(p.x, p.y);
  sigCtx.stroke();

  hasSigned = true;

  document.getElementById('sigErr').textContent = '';
});

sigCanvas.addEventListener('pointerup', () => {
  drawing = false;
});

sigCanvas.addEventListener('pointercancel', () => {
  drawing = false;
});

document.getElementById('clearSigBtn')
  .addEventListener('click', () => {

    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);

    hasSigned = false;

    document.getElementById('sigErr').textContent = '';
  });

/* =========================================
   SUBMIT ADOPTION APPLICATION
========================================= */

document.getElementById('adoptionApplicationForm')
  .addEventListener('submit', e => {

    e.preventDefault();

    if (!hasSigned) {
      document.getElementById('sigErr').textContent =
        'Please draw your signature before submitting.';
      return;
    }

    if (!e.target.reportValidity()) return;

    const petId = document.getElementById('selectedPetId').value;

    const pet = pets.find(p => p.id === petId);

    if (!pet || pet.status === 'adopted' || pet.status === 'unavailable') {
      toast('Please select an available pet before applying.');
      return;
    }

    if (currentUser && currentUser.role === 'owner') {
      toast('Owners cannot submit adoption applications.');
      return;
    }

    const tracking =
      'PAW-' + Math.floor(100000 + Math.random() * 900000);

    const application = {
      id: 'application-' + Date.now(),
      tracking,
      petId,
      ownerId: pet.ownerId,
      name: document.getElementById('applicantName').value.trim(),
      phone: document.getElementById('phoneNumber').value.trim(),
      email: document.getElementById('emailAddress').value.trim(),
      address: document.getElementById('residentialAddress').value.trim(),
      homeType: document.getElementById('homeType').value,
      caretaker: document.getElementById('primaryCaretaker').value.trim(),
      experience: document.getElementById('previousExperience').value.trim(),
      reason: document.getElementById('reasonForAdoption').value.trim(),
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    applications.unshift(application);

    if (!save(STORAGE.applications, applications)) {
      applications.shift();
      return;
    }

    alert(`
Application received successfully!

Reference: ${tracking}

Applicant: ${application.name}

Pet: ${pet.name}

Your application is now pending owner approval.
    `);

    e.target.reset();

    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    hasSigned = false;

    document.getElementById('sigErr').textContent = '';

    if (currentUser && currentUser.role === 'owner') {
      renderOwnerDashboard();
    }

    toast('Adoption application submitted!');
  });

/* =========================================
   INITIAL PAGE LOAD
========================================= */

document.getElementById('currentYear').textContent =
  new Date().getFullYear();

renderPets();
updateAccountUI();
