const STORAGE_KEY = 'typeforge-state-v1';

const SAMPLE_PARAGRAPHS = {
  easy: [
    'Typing with a calm rhythm and steady focus helps you build confidence and accuracy every single day.',
    'A good habit of practice makes every keystroke smoother, more controlled and less stressful over time.',
    'Small sessions each day can improve your speed, accuracy and confidence without feeling overwhelming.'
  ],
  medium: [
    'Professional typing depends on both rhythm and concentration, so every practice session builds stronger habits for accuracy and pace.',
    'When you focus on finger placement and steady timing, your words become more natural and your productivity increases noticeably.',
    'Consistent practice helps your hands memorize patterns, allowing you to think less about each key and more about the message itself.'
  ],
  hard: [
    'Mastering advanced typing skills means balancing precision, momentum, and endurance while staying relaxed enough to keep your focus sharp across longer passages and more demanding challenges.',
    'The most effective typists train not only for raw speed but also for clean execution, strategic pacing, and confident control when the pressure rises.',
    'Every difficult practice session strengthens your keyboard fluency, sharpens your accuracy, and turns repetition into lasting skill that feels natural in real work.'
  ]
};

const DEFAULT_STATE = {
  username: '',
  results: []
};

const appState = {
  ...DEFAULT_STATE,
  selectedDuration: 60,
  selectedDifficulty: 'easy',
  paragraph: '',
  timer: null,
  timerStartedAt: null,
  currentTyped: '',
  testCompleted: false,
  isTypingActive: false,
  startTimestamp: null
};

const elements = {
  welcomeHeading: document.getElementById('welcomeHeading'),
  totalTests: document.getElementById('totalTests'),
  personalBest: document.getElementById('personalBest'),
  averageWpm: document.getElementById('averageWpm'),
  bestAccuracy: document.getElementById('bestAccuracy'),
  practiceTime: document.getElementById('practiceTime'),
  recentActivity: document.getElementById('recentActivity'),
  progressBars: document.getElementById('progressBars'),
  historyTableBody: document.getElementById('historyTableBody'),
  dashboard: document.getElementById('dashboard'),
  testZone: document.getElementById('testZone'),
  joinForm: document.getElementById('joinForm'),
  nameInput: document.getElementById('nameInput'),
  customParagraphInput: document.getElementById('customParagraphInput'),
  typingEditor: document.getElementById('typingEditor'),
  typingInput: document.getElementById('typingInput'),
  timerLabel: document.getElementById('timerLabel'),
  wpmReadout: document.getElementById('wpmReadout'),
  accuracyReadout: document.getElementById('accuracyReadout'),
  quoteDisplay: document.getElementById('quoteDisplay'),
  startTypingBtn: document.getElementById('startTypingBtn'),
  headerJoinBtn: document.getElementById('headerJoinBtn'),
  newTestBtn: document.getElementById('newTestBtn'),
  loadSampleBtn: document.getElementById('loadSampleBtn'),
  startCustomTestBtn: document.getElementById('startCustomTestBtn'),
  resetTestBtn: document.getElementById('resetTestBtn'),
  finishTestBtn: document.getElementById('finishTestBtn')
};

const modeCards = [...document.querySelectorAll('.mode-card')];
const difficultyButtons = [...document.querySelectorAll('.difficulty-btn')];

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { ...DEFAULT_STATE };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      results: Array.isArray(parsed.results) ? parsed.results : []
    };
  } catch (error) {
    return { ...DEFAULT_STATE };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    username: appState.username,
    results: appState.results
  }));
}

function init() {
  Object.assign(appState, loadState());
  bindEvents();
  renderModeSelection();
  renderDifficultySelection();
  renderDashboard();
  renderQuoteDisplay();
  syncView();
  if (appState.username) {
    elements.nameInput.value = appState.username;
  }
  setTimerText(appState.selectedDuration);
}

function bindEvents() {
  elements.joinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = elements.nameInput.value.trim();
    if (!value) {
      elements.nameInput.focus();
      return;
    }

    appState.username = value;
    saveState();
    syncView();
    renderDashboard();
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  elements.startTypingBtn.addEventListener('click', () => {
    document.getElementById('join').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  elements.headerJoinBtn.addEventListener('click', () => {
    document.getElementById('join').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  elements.newTestBtn.addEventListener('click', () => {
    document.getElementById('testZone').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!appState.username) {
      document.getElementById('join').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    showTypingZone();
  });

  modeCards.forEach((card) => {
    const duration = Number(card.dataset.duration);
    card.querySelector('.mode-btn').addEventListener('click', () => {
      appState.selectedDuration = duration;
      renderModeSelection();
      setTimerText(duration);
      elements.customParagraphInput.value = getSampleParagraph();
      showTypingZone();
    });
  });

  difficultyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      appState.selectedDifficulty = button.dataset.difficulty;
      renderDifficultySelection();
      elements.customParagraphInput.value = getSampleParagraph();
    });
  });

  elements.loadSampleBtn.addEventListener('click', () => {
    elements.customParagraphInput.value = getSampleParagraph();
  });

  elements.startCustomTestBtn.addEventListener('click', () => {
    const customText = elements.customParagraphInput.value.trim();
    startTypingSession(customText || getSampleParagraph());
  });

  elements.resetTestBtn.addEventListener('click', () => {
    resetTypingState();
  });

  elements.finishTestBtn.addEventListener('click', () => {
    finishTypingSession();
  });

  elements.typingInput.addEventListener('input', (event) => {
    if (!appState.isTypingActive) {
      startTestTimer();
    }

    appState.currentTyped = event.target.value;
    renderQuoteDisplay();
    updateLiveStats();

    if (appState.currentTyped.length >= appState.paragraph.length) {
      finishTypingSession();
    }
  });
}

function showTypingZone() {
  elements.testZone.classList.remove('hidden');
  elements.testZone.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderModeSelection() {
  modeCards.forEach((card) => {
    const selected = Number(card.dataset.duration) === appState.selectedDuration;
    card.classList.toggle('selected', selected);
  });
}

function renderDifficultySelection() {
  difficultyButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.difficulty === appState.selectedDifficulty);
  });
}

function getSampleParagraph() {
  const paragraphs = SAMPLE_PARAGRAPHS[appState.selectedDifficulty] || SAMPLE_PARAGRAPHS.easy;
  return paragraphs[Math.floor(Math.random() * paragraphs.length)];
}

function setTimerText(durationInSeconds) {
  const minutes = String(Math.floor(durationInSeconds / 60)).padStart(2, '0');
  const seconds = String(durationInSeconds % 60).padStart(2, '0');
  elements.timerLabel.textContent = `${minutes}:${seconds}`;
}

function syncView() {
  const hasUsername = Boolean(appState.username && appState.username.trim());
  elements.dashboard.classList.toggle('hidden', !hasUsername);
  const joinSectionVisible = !hasUsername;
  document.getElementById('join').classList.toggle('hidden', !joinSectionVisible);
}

function renderDashboard() {
  const username = appState.username ? appState.username.trim() : 'User';
  elements.welcomeHeading.textContent = `Welcome back, ${username}!`;

  const totalResults = appState.results.length;
  const bestWpm = appState.results.reduce((best, item) => Math.max(best, Number(item.wpm || 0)), 0);
  const averageWpm = totalResults
    ? (appState.results.reduce((sum, item) => sum + Number(item.wpm || 0), 0) / totalResults).toFixed(1)
    : '0';
  const bestAccuracy = appState.results.reduce((best, item) => Math.max(best, Number(item.accuracy || 0)), 0);
  const practiceMinutes = appState.results.reduce((sum, item) => sum + Number(item.duration || 0), 0) / 60;

  elements.totalTests.textContent = totalResults;
  elements.personalBest.textContent = `${bestWpm.toFixed(1)}`;
  elements.averageWpm.textContent = `${averageWpm}`;
  elements.bestAccuracy.textContent = `${bestAccuracy.toFixed(0)}%`;
  elements.practiceTime.textContent = `${Math.round(practiceMinutes)} min`;

  const recentItems = [...appState.results].reverse().slice(0, 4);
  elements.recentActivity.innerHTML = recentItems.length
    ? recentItems.map((item) => `<li>${item.mode} · ${Number(item.wpm).toFixed(1)} WPM · ${Number(item.accuracy).toFixed(0)}% accuracy</li>`).join('')
    : '<li>No typing history yet. Start your first challenge.</li>';

  const progressEntries = [...appState.results].slice(-5).map((item, index) => ({
    label: item.mode || `Session ${index + 1}`,
    value: Number(item.wpm || 0)
  }));

  if (!progressEntries.length) {
    elements.progressBars.innerHTML = '<div class="progress-bar-row"><span>Ready for your first test</span><div class="bar-track"><div class="bar-fill" style="width: 0%"></div></div></div>';
    return;
  }

  const maxValue = Math.max(...progressEntries.map((item) => item.value), 1);
  elements.progressBars.innerHTML = progressEntries.map((item) => {
    const width = (item.value / maxValue) * 100;
    return `
      <div class="progress-bar-row">
        <span>${item.label}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${width}%"></div>
        </div>
      </div>
    `;
  }).join('');

  const rows = [...appState.results].reverse().slice(0, 8);
  elements.historyTableBody.innerHTML = rows.length
    ? rows.map((item) => `
        <tr>
          <td>${item.mode}</td>
          <td>${Number(item.wpm).toFixed(1)}</td>
          <td>${Number(item.accuracy).toFixed(0)}%</td>
          <td>${item.duration}s</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4">No typing history yet.</td></tr>';
}

function startTypingSession(customParagraph) {
  if (!appState.username) {
    document.getElementById('join').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  appState.paragraph = customParagraph.trim();
  if (!appState.paragraph) {
    alert('Please enter a paragraph to start the challenge.');
    return;
  }

  appState.currentTyped = '';
  appState.testCompleted = false;
  appState.isTypingActive = false;
  appState.startTimestamp = null;
  elements.typingInput.value = '';
  elements.customParagraphInput.value = appState.paragraph;
  elements.typingEditor.classList.remove('hidden');
  renderQuoteDisplay();
  updateLiveStats();
  setTimerText(appState.selectedDuration);
  elements.typingInput.focus();
  elements.testZone.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function startTestTimer() {
  if (appState.isTypingActive) {
    return;
  }

  appState.isTypingActive = true;
  appState.startTimestamp = Date.now();
  appState.timer = window.setInterval(() => {
    const elapsedMs = Date.now() - appState.startTimestamp;
    const remainingSeconds = Math.max(0, appState.selectedDuration - Math.floor(elapsedMs / 1000));
    const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
    const seconds = String(remainingSeconds % 60).padStart(2, '0');
    elements.timerLabel.textContent = `${minutes}:${seconds}`;

    if (remainingSeconds <= 0) {
      finishTypingSession();
    }
  }, 250);
}

function finishTypingSession() {
  if (appState.testCompleted) {
    return;
  }

  appState.testCompleted = true;
  window.clearInterval(appState.timer);

  const typed = appState.currentTyped || '';
  const elapsedSeconds = Math.min(appState.selectedDuration, Math.max(1, Math.round((Date.now() - appState.startTimestamp) / 1000 || 1)));
  const correctChars = [...typed].reduce((count, char, index) => count + (char === appState.paragraph[index] ? 1 : 0), 0);
  const typedLength = typed.length || 0;
  const accuracy = typedLength ? (correctChars / typedLength) * 100 : 100;
  const grossWpm = typedLength ? (typedLength / 5) / (elapsedSeconds / 60) : 0;
  const wpm = Math.max(0, Math.min(grossWpm, 300));
  const modeLabel = {
    60: 'Quick Sprint',
    300: 'Deep Focus',
    600: 'Endurance Challenge'
  }[appState.selectedDuration] || 'Typing Session';

  const result = {
    mode: modeLabel,
    wpm: wpm.toFixed(1),
    accuracy: accuracy.toFixed(0),
    duration: appState.selectedDuration
  };

  appState.results.push(result);
  saveState();
  renderDashboard();

  const finalWpm = Number(result.wpm).toFixed(1);
  const finalAccuracy = Number(result.accuracy).toFixed(0);
  elements.wpmReadout.textContent = `${finalWpm} WPM`;
  elements.accuracyReadout.textContent = `${finalAccuracy}% Accuracy`;

  if (typed.length < appState.paragraph.length) {
    appState.currentTyped = appState.paragraph.slice(0, typed.length);
    elements.typingInput.value = appState.currentTyped;
  }

  elements.typingInput.blur();
  appState.isTypingActive = false;
  appState.startTimestamp = null;
}

function resetTypingState() {
  window.clearInterval(appState.timer);
  appState.currentTyped = '';
  appState.paragraph = '';
  appState.isTypingActive = false;
  appState.startTimestamp = null;
  appState.testCompleted = false;
  elements.typingInput.value = '';
  elements.customParagraphInput.value = getSampleParagraph();
  setTimerText(appState.selectedDuration);
  elements.wpmReadout.textContent = '0 WPM';
  elements.accuracyReadout.textContent = '100% Accuracy';
  renderQuoteDisplay();
}

function updateLiveStats() {
  const typed = appState.currentTyped || '';
  const totalTyped = typed.length || 0;
  let correctChars = 0;

  for (let index = 0; index < typed.length; index += 1) {
    if (typed[index] === appState.paragraph[index]) {
      correctChars += 1;
    }
  }

  const accuracy = totalTyped ? (correctChars / totalTyped) * 100 : 100;
  const elapsedSeconds = appState.startTimestamp
    ? Math.max(1, Math.floor((Date.now() - appState.startTimestamp) / 1000))
    : 1;
  const wpm = totalTyped ? (correctChars / 5) / (elapsedSeconds / 60) : 0;

  elements.wpmReadout.textContent = `${wpm.toFixed(1)} WPM`;
  elements.accuracyReadout.textContent = `${accuracy.toFixed(0)}% Accuracy`;
}

function renderQuoteDisplay() {
  const paragraph = appState.paragraph || 'Start a challenge to begin typing.';
  const typed = appState.currentTyped || '';
  const html = [...paragraph].map((char, index) => {
    let className = 'pending';

    if (typed[index] === undefined) {
      className = index === typed.length ? 'current' : 'pending';
    } else if (typed[index] === char) {
      className = 'correct';
    } else {
      className = 'incorrect';
    }

    return `<span class="${className}">${escapeHtml(char)}</span>`;
  }).join('');

  elements.quoteDisplay.innerHTML = html;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

init();
