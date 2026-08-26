document.addEventListener('DOMContentLoaded', () => {
  // Жёстко прописанный адрес бэкенда на Netlify
  const BACKEND_URL = 'https://projactx.netlify.app/.netlify/functions';

  // ==========================================
  // ВХОД (LOGIN DROPDOWN)
  // ==========================================
  const loginBtn = document.getElementById('loginBtn');
  const loginDropdown = document.getElementById('loginDropdown');
  const loginForm = document.getElementById('loginForm');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const signupDropdown = document.getElementById('signupDropdown');

  if (loginBtn && loginDropdown) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (signupDropdown) signupDropdown.classList.remove('active');
      loginDropdown.classList.toggle('active');
    });
    loginDropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = loginForm.querySelector('#loginUsername');
      const passwordInput = loginForm.querySelector('#loginPassword');
      const usernameOrEmail = usernameInput ? usernameInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      if (!usernameOrEmail || !password) {
        alert('Please fill in all login fields!');
        return;
      }

      try {
        if (loginSubmitBtn) { loginSubmitBtn.innerText = 'Loading...'; loginSubmitBtn.disabled = true; }
        const response = await fetch(`${BACKEND_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameOrEmail, password })
        });
        const data = await response.json();
        if (response.ok) {
          alert('Login successful!');
          if (data.username) localStorage.setItem('username', data.username);
          window.location.reload();
        } else {
          alert(data.message || 'Incorrect username or password');
        }
      } catch (error) {
        alert('Could not connect to server.');
      } finally {
        if (loginSubmitBtn) { loginSubmitBtn.innerText = 'Log In'; loginSubmitBtn.disabled = false; }
      }
    });
  }

  // ==========================================
  // РЕГИСТРАЦИЯ (SIGNUP DROPDOWN)
  // ==========================================
  const signupBtnHeader = document.getElementById('signupBtnHeader');
  const signupBtnAlt = document.getElementById('signupBtnAlt');
  const registerForm = document.getElementById('registerForm');
  const regSubmitBtn = document.getElementById('regSubmitBtn');

  const toggleSignupDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loginDropdown) loginDropdown.classList.remove('active');
    if (signupDropdown) signupDropdown.classList.toggle('active');
  };

  if (signupBtnHeader) signupBtnHeader.addEventListener('click', toggleSignupDropdown);
  if (signupBtnAlt) signupBtnAlt.addEventListener('click', toggleSignupDropdown);
  if (signupDropdown) signupDropdown.addEventListener('click', (e) => e.stopPropagation());

  document.addEventListener('click', () => {
    if (loginDropdown) loginDropdown.classList.remove('active');
    if (signupDropdown) signupDropdown.classList.remove('active');
  });

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = registerForm.querySelector('#regUsername')?.value.trim();
      const password = registerForm.querySelector('#regPassword')?.value.trim();
      const birthMonth = registerForm.querySelector('#regMonth')?.value;
      const birthDay = registerForm.querySelector('#regDay')?.value;
      const birthYear = registerForm.querySelector('#regYear')?.value;
      const gender = registerForm.querySelector('#regGender')?.value;

      if (!username || !password || !birthMonth || !birthDay || !birthYear || !gender) {
        alert('Please fill in all registration fields!');
        return;
      }

      if (password.length < 8) {
        alert('Password must be at least 8 characters long!');
        return;
      }

      try {
        if (regSubmitBtn) { regSubmitBtn.innerText = 'Creating...'; regSubmitBtn.disabled = true; }

        const response = await fetch(`${BACKEND_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, birthMonth, birthDay, birthYear, gender })
        });

        const data = await response.json();

        if (response.ok) {
          alert('Registration successful! You can now log in.');
          if (signupDropdown) signupDropdown.classList.remove('active');
          registerForm.reset();
          if (loginDropdown) loginDropdown.classList.add('active');
        } else {
          alert(data.message || 'Registration error.');
        }
      } catch (error) {
        alert('Could not connect to server.');
      } finally {
        if (regSubmitBtn) { regSubmitBtn.innerText = 'Register'; regSubmitBtn.disabled = false; }
      }
    });
  }

  // ==========================================
  // ВОСПРОИЗВЕДЕНИЕ ЗВУКА НА СТРАНИЦЕ SIGNUP
  // ==========================================
  if (window.location.pathname.includes('signup.html')) {
    const signupAudio = new Audio('SignUpSFX.mp3');

    const startAudio = () => {
      signupAudio.play().then(() => {
        setTimeout(() => {
          signupAudio.pause();
          signupAudio.currentTime = 0;
        }, 5000);
      }).catch(() => {});
    };

    document.addEventListener('click', startAudio, { once: true });
  }

  // ==========================================
  // СЕССИЯ И СТАТУС ПОЛЬЗОВАТЕЛЯ
  // ==========================================
  const savedUsername = localStorage.getItem('username');
  const isGuest = !savedUsername || savedUsername.toLowerCase() === 'guest';

  if (savedUsername && !isGuest) {
    const userInfoH1 = document.querySelector('.user-info h1');
    if (userInfoH1) {
      userInfoH1.innerText = `Hello, ${savedUsername}`;
    }

    const playerAvatar = document.getElementById('PlayerImageHolder') || 
                         document.querySelector('.PlayerImageHolder') || 
                         document.querySelector('img[src*="PlayerImageHolder"]');
    if (playerAvatar) {
      playerAvatar.src = 'PlayerHolder.png';
    }

    const authLinks = document.querySelector('.auth-links');
    if (authLinks) {
      authLinks.innerHTML = `<a href="#" id="logoutBtn" class="login" style="background-color: #d9534f; border-radius: 4px;">Log Out</a>`;
      document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('username');
        window.location.reload();
      });
    }
  }

  const friendsContainer = document.getElementById('friendsContainer');
  if (isGuest && friendsContainer) {
    friendsContainer.style.display = 'none';
  }

  // ==========================================
  // ЗАГРУЗКА ИГР С СЕРВЕРА
  // ==========================================
  async function fetchGames() {
    const gamesGrid = document.querySelector('.games-grid-container');
    if (!gamesGrid) return;

    try {
      const response = await fetch(`${BACKEND_URL}/games`);
      if (response.ok) {
        const games = await response.json();
        if (games.length > 0) {
          const placeholder = document.querySelector('.no-creations-placeholder');
          if (placeholder) placeholder.style.display = 'none';

          gamesGrid.innerHTML = games.map(game => `
            <div class="game-card">
              <div class="game-thumb-wrap">
                <img src="${game.image || 'PlayImageDefault.png'}" alt="${game.title}" onerror="this.src='favicon.png'">
              </div>
              <div class="game-card-title">${game.title}</div>
              <div class="game-card-visits">${game.visits || 0} visits</div>
              <div class="game-card-footer">
                <div class="like-bar"></div>
                <img src="LikeShowGame.png" class="like-icon-img" alt="Like" onerror="this.style.background='#00b05e'">
              </div>
            </div>
          `).join('');
        }
      }
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  }

  fetchGames();

  // ==========================================
  // МОДАЛЬНОЕ ОКНО И ОТПРАВКА ИГРЫ НА СЕРВЕР
  // ==========================================
  const uploadModal = document.getElementById('uploadModal');
  const closeUploadModal = document.getElementById('closeUploadModal');
  const uploadPlaceForm = document.getElementById('uploadPlaceForm');
  const moderationStatus = document.getElementById('moderationStatus');
  const submitUploadBtn = document.getElementById('submitUploadBtn');
  const createGameBtn = document.querySelector('.btn-create-new-game');
  const noCreationsMsg = document.querySelector('.no-creations-placeholder');
  const sidebarItems = document.querySelectorAll('.develop-sidebar .develop-menu-item');

  if (isGuest) {
    if (createGameBtn) createGameBtn.style.display = 'none';
    if (noCreationsMsg) noCreationsMsg.innerHTML = 'You must be logged in to create games.';
    sidebarItems.forEach(item => item.classList.add('disabled'));
  } else if (createGameBtn) {
    createGameBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (uploadModal) uploadModal.style.display = 'flex';
    });
  }

  if (closeUploadModal) {
    closeUploadModal.addEventListener('click', () => {
      if (uploadModal) uploadModal.style.display = 'none';
      resetUploadForm();
    });
  }

  function resetUploadForm() {
    if (uploadPlaceForm) uploadPlaceForm.reset();
    if (moderationStatus) {
      moderationStatus.className = 'moderation-status';
      moderationStatus.style.display = 'none';
      moderationStatus.innerText = '';
    }
    if (submitUploadBtn) submitUploadBtn.disabled = false;
  }

  const bannedWords = ['fuck', 'shit', 'bitch', 'ass', 'porn', 'sex', 'хуй', 'пизда', 'блять', 'сука'];

  if (uploadPlaceForm) {
    uploadPlaceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('placeTitleInput');
      const fileInput = document.getElementById('rbxlFileInput');
      const title = titleInput ? titleInput.value.trim() : '';

      if (!fileInput.files.length) {
        alert('Please select a .rbxl file.');
        return;
      }

      if (bannedWords.some(w => title.toLowerCase().includes(w))) {
        moderationStatus.className = 'moderation-status error';
        moderationStatus.innerText = 'Content rejected: Title contains prohibited terms.';
        return;
      }

      submitUploadBtn.disabled = true;
      moderationStatus.className = 'moderation-status loading';
      moderationStatus.innerText = 'Publishing place to server...';

      try {
        const response = await fetch(`${BACKEND_URL}/games`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            creator: savedUsername || 'Guest',
            image: 'PlayImageDefault.png',
            visits: 0
          })
        });

        if (response.ok) {
          moderationStatus.className = 'moderation-status success';
          moderationStatus.innerText = 'Place successfully published!';
          setTimeout(() => {
            if (uploadModal) uploadModal.style.display = 'none';
            resetUploadForm();
            fetchGames();
          }, 1000);
        } else {
          alert('Failed to publish game.');
        }
      } catch (err) {
        alert('Error connecting to backend server.');
      } finally {
        submitUploadBtn.disabled = false;
      }
    });
  }

  // ==========================================
  // ВИДЖЕТ ЧАТА И ПОИСК
  // ==========================================
  const chatHeader = document.getElementById('chatHeader');
  const chatWidget = document.getElementById('chatWidget');
  if (chatHeader && chatWidget) {
    chatHeader.addEventListener('click', () => chatWidget.classList.toggle('open'));
  }
});