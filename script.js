import { namesData } from './names.js';

/* ============================================================
   asmaa - script.js
   single-page state, view rendering, audio, persistence
   data source: names.js (immutable religious content)
   ============================================================ */

const STORAGE_KEYS = Object.freeze({
    theme: 'asmaaTheme',
    language: 'asmaaLanguage',
    progress: 'asmaaProgress',
    dailyName: 'lastDailyName'
});

const DEFAULT_PROGRESS = Object.freeze({
    learned: [],
    dailyStreak: 0,
    lastVisit: null,
    quizzesTaken: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    favorites: []
});

const namesByNumber = new Map(namesData.map(n => [n.number, n]));
const namesByArabic = new Map(namesData.map(n => [n.arabic, n]));

let favoritesSet = new Set();
let learnedSet = new Set();

/**
 * Refresh the O(1) lookup sets from the current progress arrays.
 * Call after any mutation of `appState.progress.favorites` or `appState.progress.learned`.
 */
function rebuildLookupSets() {
    favoritesSet = new Set(appState.progress.favorites);
    learnedSet = new Set(appState.progress.learned);
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

let appState = {
    currentLang: 'en',
    currentView: 'browse',
    currentTheme: 'light',
    currentStudyIndex: 0,
    searchTerm: '',
    quizData: {
        currentQuestion: 0,
        questions: [],
        score: 0,
        answered: false
    },
    progress: { ...DEFAULT_PROGRESS, learned: [], favorites: [] }
};

const translations = {
    en: {
        browse: 'Browse',
        study: 'Study',
        quiz: 'Quiz',
        progress: 'Progress',
        search: 'Search by name, meaning, or number...',
        previous: 'Previous',
        next: 'Next',
        play: '🔊 Play',
        learned: 'Names Learned',
        streak: 'Day Streak',
        accuracy: 'Quiz Accuracy',
        quizzesTaken: 'Quizzes Completed',
        todaysName: "Today's Name to Remember",
        whatIsTheMeaning: 'What is the meaning of this name?',
        nextQuestion: 'Next Question',
        quizComplete: 'Quiz Complete',
        yourScore: 'Your Score',
        clearProgress: 'Clear All Progress',
        confirmClear: 'Are you sure you want to clear all your progress? This cannot be undone.',
        progressCleared: 'All progress has been cleared',
        studyButton: 'Study',
        favoriteButton: '❤️',
        unfavoriteButton: '💔',
        favorites: 'Favorite Names',
        noFavorites: 'No favorite names yet',
        startNewQuiz: 'Start New Quiz',
        questionsFormat: 'Question {current} of {total}',
        perfectScore: "Perfect. Masha'Allah",
        excellentScore: 'Excellent work',
        goodScore: 'Good job. Keep learning',
        keepPracticing: "Keep practicing, you'll improve"
    },
    ar: {
        browse: 'تصفح',
        study: 'دراسة',
        quiz: 'اختبار',
        progress: 'التقدم',
        search: 'ابحث بالاسم أو المعنى أو الرقم...',
        previous: 'السابق',
        next: 'التالي',
        play: '🔊 تشغيل',
        learned: 'الأسماء المحفوظة',
        streak: 'الأيام المتتالية',
        accuracy: 'دقة الاختبار',
        quizzesTaken: 'الاختبارات المكتملة',
        todaysName: 'اسم اليوم للتذكر',
        whatIsTheMeaning: 'ما معنى هذا الاسم؟',
        nextQuestion: 'السؤال التالي',
        quizComplete: 'اكتمل الاختبار',
        yourScore: 'نتيجتك',
        clearProgress: 'مسح كل التقدم',
        confirmClear: 'هل أنت متأكد من أنك تريد مسح كل تقدمك؟ لا يمكن التراجع عن هذا.',
        progressCleared: 'تم مسح جميع التقدم',
        studyButton: 'ادرس',
        favoriteButton: '❤️',
        unfavoriteButton: '💔',
        favorites: 'الأسماء المفضلة',
        noFavorites: 'لا توجد أسماء مفضلة بعد',
        startNewQuiz: 'ابدأ اختبار جديد',
        questionsFormat: 'السؤال {current} من {total}',
        perfectScore: 'ممتاز. ماشاء الله',
        excellentScore: 'عمل ممتاز',
        goodScore: 'عمل جيد. استمر في التعلم',
        keepPracticing: 'استمر في الممارسة، ستتحسن'
    },
    fr: {
        browse: 'Parcourir',
        study: 'Étudier',
        quiz: 'Quiz',
        progress: 'Progrès',
        search: 'Rechercher par nom, signification ou numéro...',
        previous: 'Précédent',
        next: 'Suivant',
        play: '🔊 Jouer',
        learned: 'Noms Appris',
        streak: 'Série de Jours',
        accuracy: 'Précision du Quiz',
        quizzesTaken: 'Quiz Complétés',
        todaysName: "Le Nom d'Aujourd'hui à Retenir",
        whatIsTheMeaning: 'Quelle est la signification de ce nom?',
        nextQuestion: 'Question Suivante',
        quizComplete: 'Quiz Terminé',
        yourScore: 'Votre Score',
        clearProgress: 'Effacer Tous les Progrès',
        confirmClear: 'Êtes-vous sûr de vouloir effacer tous vos progrès? Cela ne peut pas être annulé.',
        progressCleared: 'Tous les progrès ont été effacés',
        studyButton: 'Étudier',
        favoriteButton: '❤️',
        unfavoriteButton: '💔',
        favorites: 'Noms Favoris',
        noFavorites: 'Pas encore de noms favoris',
        startNewQuiz: 'Commencer un Nouveau Quiz',
        questionsFormat: 'Question {current} sur {total}',
        perfectScore: "Parfait. Masha'Allah",
        excellentScore: 'Excellent travail',
        goodScore: 'Bon travail. Continuez à apprendre',
        keepPracticing: 'Continuez à pratiquer, vous vous améliorerez'
    }
};

let cachedNavTabs = null;

function getNavTabs() {
    if (!cachedNavTabs) cachedNavTabs = document.querySelectorAll('.nav-tab');
    return cachedNavTabs;
}

/* ============================================================
   storage helpers
   localStorage may be unavailable (private mode, disabled, full)
   or contain tampered/stale data; every read defends both shape
   and parse failures
   ============================================================ */

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (err) {
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (err) {
        /* private mode or quota exceeded; persistence is best-effort */
    }
}

/**
 * Read and validate progress from localStorage. Discards any field with the
 * wrong shape and falls back to the typed default. Never throws.
 */
function readProgress() {
    const raw = readStorage(STORAGE_KEYS.progress);
    if (!raw) return { ...DEFAULT_PROGRESS, learned: [], favorites: [] };

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        return { ...DEFAULT_PROGRESS, learned: [], favorites: [] };
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { ...DEFAULT_PROGRESS, learned: [], favorites: [] };
    }

    const onlyIntegers = arr => arr.filter(n => Number.isInteger(n) && n >= 1 && n <= 99);

    return {
        learned: Array.isArray(parsed.learned) ? onlyIntegers(parsed.learned) : [],
        dailyStreak: Number.isFinite(parsed.dailyStreak) && parsed.dailyStreak >= 0
            ? parsed.dailyStreak
            : 0,
        lastVisit: typeof parsed.lastVisit === 'string' ? parsed.lastVisit : null,
        quizzesTaken: Number.isFinite(parsed.quizzesTaken) && parsed.quizzesTaken >= 0
            ? parsed.quizzesTaken
            : 0,
        totalCorrect: Number.isFinite(parsed.totalCorrect) && parsed.totalCorrect >= 0
            ? parsed.totalCorrect
            : 0,
        totalQuestions: Number.isFinite(parsed.totalQuestions) && parsed.totalQuestions >= 0
            ? parsed.totalQuestions
            : 0,
        favorites: Array.isArray(parsed.favorites) ? onlyIntegers(parsed.favorites) : []
    };
}

function readTheme() {
    const raw = readStorage(STORAGE_KEYS.theme);
    return raw === 'light' || raw === 'dark' ? raw : null;
}

function readLanguage() {
    const raw = readStorage(STORAGE_KEYS.language);
    return raw === 'en' || raw === 'ar' || raw === 'fr' ? raw : null;
}

/* ============================================================
   bootstrap
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadProgress();
    rebuildLookupSets();
    initializeEventListeners();
    applyTheme();
    applyDirection();
    renderView();
    checkDailyName();

    document.addEventListener('click', initializeAudioForMobile, { once: true });
    document.addEventListener('touchstart', initializeAudioForMobile, { once: true });
});

function loadSettings() {
    const savedTheme = readTheme();
    const savedLang = readLanguage();
    const prefersDark = window.matchMedia
        && window.matchMedia('(prefers-color-scheme: dark)').matches;

    appState.currentTheme = savedTheme ?? (prefersDark ? 'dark' : 'light');
    appState.currentLang = savedLang ?? 'en';
}

function saveSettings() {
    writeStorage(STORAGE_KEYS.theme, appState.currentTheme);
    writeStorage(STORAGE_KEYS.language, appState.currentLang);
}

function applyTheme() {
    document.body.setAttribute('data-theme', appState.currentTheme);
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.textContent = appState.currentTheme === 'light' ? '🌙' : '☀️';
        toggle.setAttribute('aria-label',
            appState.currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }
}

/**
 * Sync direction and `lang` on the document root with the active language.
 * Body keeps the legacy `.rtl` class so older selectors continue to match.
 */
function applyDirection() {
    const dir = appState.currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = appState.currentLang;
    document.body.classList.toggle('rtl', dir === 'rtl');
}

/**
 * Hydrate progress and update the daily-streak. A streak increments only when
 * the previous visit was the calendar day immediately before today; otherwise
 * it resets to 1.
 */
function loadProgress() {
    appState.progress = readProgress();

    const today = new Date().toDateString();
    const lastVisit = appState.progress.lastVisit;

    if (lastVisit) {
        const lastDate = new Date(lastVisit).toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate === yesterday.toDateString()) {
            appState.progress.dailyStreak++;
        } else if (lastDate !== today) {
            appState.progress.dailyStreak = 1;
        }
    } else {
        appState.progress.dailyStreak = 1;
    }

    appState.progress.lastVisit = new Date().toISOString();
    saveProgress();
}

function saveProgress() {
    writeStorage(STORAGE_KEYS.progress, JSON.stringify(appState.progress));
}

function clearAllProgress() {
    const t = translations[appState.currentLang];
    if (confirm(t.confirmClear)) {
        appState.progress = {
            ...DEFAULT_PROGRESS,
            learned: [],
            favorites: [],
            lastVisit: new Date().toISOString()
        };
        rebuildLookupSets();
        saveProgress();
        renderProgress();
        showNotification(t.progressCleared);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('role', 'status');
    notification.textContent = message;
    document.body.appendChild(notification);

    requestAnimationFrame(() => notification.classList.add('show'));

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function toggleFavorite(nameNumber) {
    const index = appState.progress.favorites.indexOf(nameNumber);
    if (index > -1) {
        appState.progress.favorites.splice(index, 1);
    } else {
        appState.progress.favorites.push(nameNumber);
    }
    rebuildLookupSets();
    saveProgress();
    renderView();
}

/* ============================================================
   event wiring
   ============================================================ */

function initializeEventListeners() {
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        appState.currentLang = e.target.value;
        applyDirection();
        saveSettings();
        renderView();
    });

    document.getElementById('themeToggle').addEventListener('click', () => {
        appState.currentTheme = appState.currentTheme === 'light' ? 'dark' : 'light';
        applyTheme();
        saveSettings();
    });

    getNavTabs().forEach(tab => {
        tab.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            appState.currentView = view;
            setActiveTab(view);
            renderView();
        });
    });

    const debouncedRender = debounce(renderNamesGrid, 180);
    document.getElementById('searchBar').addEventListener('input', (e) => {
        appState.searchTerm = e.target.value.toLowerCase();
        debouncedRender();
    });

    document.getElementById('namesGrid').addEventListener('click', handleGridClick);
    document.getElementById('progressGrid').addEventListener('click', handleGridClick);

    document.getElementById('prevName').addEventListener('click', () => {
        if (appState.currentStudyIndex > 0) {
            appState.currentStudyIndex--;
            renderStudyView();
        }
    });

    document.getElementById('nextName').addEventListener('click', () => {
        if (appState.currentStudyIndex < namesData.length - 1) {
            appState.currentStudyIndex++;
            renderStudyView();
        }
    });

    document.getElementById('playAudio').addEventListener('click', () => {
        const name = namesData[appState.currentStudyIndex];
        playNameAudio(name);
    });

    document.getElementById('modalClose').addEventListener('click', closeDailyModal);
    document.getElementById('dailyModal').addEventListener('click', (e) => {
        if (e.target.id === 'dailyModal') closeDailyModal();
    });

    document.getElementById('nextQuestion').addEventListener('click', () => {
        appState.quizData.currentQuestion++;
        if (appState.quizData.currentQuestion < appState.quizData.questions.length) {
            renderQuizQuestion();
        } else {
            showQuizResults();
        }
    });

    document.querySelector('.quiz-card').addEventListener('click', (e) => {
        const restart = e.target.closest('#restartQuizBtn');
        if (restart) startQuiz();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('dailyModal');
            if (modal && modal.classList.contains('active')) {
                closeDailyModal();
                return;
            }
        }
        if (appState.currentView === 'study') {
            if (e.key === 'ArrowLeft' && appState.currentStudyIndex > 0) {
                appState.currentStudyIndex--;
                renderStudyView();
            } else if (e.key === 'ArrowRight'
                       && appState.currentStudyIndex < namesData.length - 1) {
                appState.currentStudyIndex++;
                renderStudyView();
            } else if (e.key === ' ' && e.target === document.body) {
                e.preventDefault();
                playNameAudio(namesData[appState.currentStudyIndex]);
            }
        }
    });
}

function handleGridClick(e) {
    const studyBtn = e.target.closest('.btn-study');
    if (studyBtn) {
        e.stopPropagation();
        studyName(parseInt(studyBtn.dataset.index, 10));
        return;
    }
    const favBtn = e.target.closest('.btn-favorite');
    if (favBtn) {
        e.stopPropagation();
        toggleFavorite(parseInt(favBtn.dataset.number, 10));
        return;
    }
    const playBtn = e.target.closest('.btn-play');
    if (playBtn) {
        e.stopPropagation();
        const name = namesByNumber.get(parseInt(playBtn.dataset.number, 10));
        if (name) playNameAudio(name);
        return;
    }
    const card = e.target.closest('.name-card');
    if (card) {
        const btn = card.querySelector('.btn-study');
        if (btn) studyName(parseInt(btn.dataset.index, 10));
    }
}

function setActiveTab(viewName) {
    getNavTabs().forEach(tab => {
        const isActive = tab.dataset.view === viewName;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
}

/* ============================================================
   audio (Web Speech API with fallback chain)
   On iOS the SpeechSynthesisUtterance API requires a real user gesture
   before it can speak; the one-time silent utterance below primes the
   subsystem during the first click or touchstart.
   ============================================================ */

let audioInitialized = false;

function initializeAudioForMobile() {
    if (audioInitialized) return;
    if (!('speechSynthesis' in window)) {
        audioInitialized = true;
        return;
    }
    speechSynthesis.cancel();
    const silent = new SpeechSynthesisUtterance('');
    silent.volume = 0;
    silent.lang = 'ar-SA';
    try {
        speechSynthesis.speak(silent);
    } catch (err) {
        /* iOS sometimes throws on the priming call; safe to ignore */
    }
    audioInitialized = true;
}

/**
 * Speak a name. Accepts either a name object or a literal Arabic string;
 * falls back through Web Speech API, ResponsiveVoice (if loaded), and finally
 * a transliteration toast.
 */
function playNameAudio(nameOrArabic) {
    initializeAudioForMobile();

    let nameObject = null;
    let textToSpeak;

    if (typeof nameOrArabic === 'object' && nameOrArabic !== null) {
        nameObject = nameOrArabic;
        textToSpeak = nameOrArabic.arabicPronunciation || nameOrArabic.arabic;
    } else {
        nameObject = namesByArabic.get(nameOrArabic) || null;
        textToSpeak = nameObject
            ? (nameObject.arabicPronunciation || nameObject.arabic)
            : nameOrArabic;
    }

    const allPlayButtons = document.querySelectorAll('.btn-play, #playAudio');
    allPlayButtons.forEach(btn => btn.classList.add('playing'));
    const resetButtons = () => {
        allPlayButtons.forEach(btn => btn.classList.remove('playing'));
    };

    if ('speechSynthesis' in window) {
        try {
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.75;
            utterance.pitch = 1;
            utterance.volume = 1;
            utterance.onend = resetButtons;
            utterance.onerror = () => {
                resetButtons();
                playNameAudioFallback(nameObject, resetButtons);
            };

            const voices = speechSynthesis.getVoices();
            const arabicVoice = voices.find(v =>
                v.lang.startsWith('ar') || /arabic/i.test(v.name));
            if (arabicVoice) utterance.voice = arabicVoice;

            setTimeout(() => speechSynthesis.speak(utterance), 10);
            return;
        } catch (err) {
            resetButtons();
        }
    }

    playNameAudioFallback(nameObject, resetButtons);
}

function playNameAudioFallback(nameObject, callback) {
    if (!nameObject) {
        if (callback) callback();
        return;
    }

    if (typeof responsiveVoice !== 'undefined') {
        try {
            responsiveVoice.speak(nameObject.arabic, 'Arabic', {
                onend: callback,
                onerror: callback,
                rate: 0.8
            });
            return;
        } catch (err) {
            /* fall through to transliteration toast */
        }
    }

    if (nameObject.transliteration) {
        showNotification(`🔊 ${nameObject.transliteration}`);
        if (callback) setTimeout(callback, 3000);
    } else if (callback) {
        callback();
    }
}

/* ============================================================
   view rendering
   ============================================================ */

function renderView() {
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.remove('is-active');
        view.style.display = '';
    });

    const viewMap = {
        browse: { selector: '.browse-view', render: renderNamesGrid },
        study: { selector: '.study-view', render: renderStudyView },
        quiz: { selector: '.quiz-view', render: startQuiz },
        progress: { selector: '.progress-view', render: renderProgress }
    };

    const target = viewMap[appState.currentView];
    if (target) {
        const el = document.querySelector(target.selector);
        if (el) el.classList.add('is-active');
        target.render();
    }

    updateUIText();
}

function updateUIText() {
    const t = translations[appState.currentLang];
    const tabs = getNavTabs();
    tabs[0].textContent = t.browse;
    tabs[1].textContent = t.study;
    tabs[2].textContent = t.quiz;
    tabs[3].textContent = t.progress;

    const search = document.getElementById('searchBar');
    if (search) {
        search.placeholder = t.search;
        search.setAttribute('aria-label', t.search);
    }

    const prev = document.getElementById('prevName');
    const next = document.getElementById('nextName');
    const play = document.getElementById('playAudio');
    if (prev) prev.textContent = t.previous;
    if (next) next.textContent = t.next;
    if (play) play.textContent = t.play;

    const dailyHeader = document.querySelector('.daily-name-header');
    if (dailyHeader) dailyHeader.textContent = t.todaysName;

    const langSelector = document.getElementById('languageSelector');
    if (langSelector) langSelector.value = appState.currentLang;

    const nextQuestionBtn = document.getElementById('nextQuestion');
    if (nextQuestionBtn) nextQuestionBtn.textContent = t.nextQuestion;
}

/* ============================================================
   browse view
   ============================================================ */

function renderNamesGrid() {
    const grid = document.getElementById('namesGrid');
    const term = appState.searchTerm;
    const filtered = term
        ? namesData.filter(name =>
            name.arabic.includes(term)
            || name.transliteration.toLowerCase().includes(term)
            || name.meaning[appState.currentLang].toLowerCase().includes(term)
            || name.number.toString().includes(term))
        : namesData;

    const fragment = document.createDocumentFragment();
    filtered.forEach(name => fragment.appendChild(createNameCard(name)));
    grid.replaceChildren(fragment);
}

function createNameCard(name) {
    const t = translations[appState.currentLang];
    const isFavorite = favoritesSet.has(name.number);
    const isLearned = learnedSet.has(name.number);

    const card = document.createElement('article');
    card.className = `name-card${isLearned ? ' learned' : ''}${isFavorite ? ' favorite' : ''}`;

    const number = document.createElement('div');
    number.className = 'name-number';
    number.textContent = name.number;
    card.appendChild(number);

    if (isFavorite) {
        const favBadge = document.createElement('div');
        favBadge.className = 'favorite-badge';
        favBadge.setAttribute('aria-label', 'Favorite');
        favBadge.textContent = '❤️';
        card.appendChild(favBadge);
    }

    if (isLearned) {
        const learnedBadge = document.createElement('div');
        learnedBadge.className = 'learned-badge';
        learnedBadge.setAttribute('aria-label', 'Learned');
        learnedBadge.textContent = '✓';
        card.appendChild(learnedBadge);
    }

    const arabic = document.createElement('div');
    arabic.className = 'name-arabic arabic-text';
    arabic.textContent = name.arabic;
    arabic.setAttribute('lang', 'ar');
    arabic.setAttribute('dir', 'rtl');
    card.appendChild(arabic);

    const trans = document.createElement('div');
    trans.className = 'name-transliteration';
    trans.textContent = name.transliteration;
    trans.setAttribute('dir', 'ltr');
    card.appendChild(trans);

    const meaning = document.createElement('div');
    meaning.className = 'name-meaning';
    meaning.textContent = name.meaning[appState.currentLang];
    card.appendChild(meaning);

    const actions = document.createElement('div');
    actions.className = 'name-actions';

    const studyBtn = document.createElement('button');
    studyBtn.type = 'button';
    studyBtn.className = 'btn-action btn-study';
    studyBtn.dataset.index = String(name.number - 1);
    studyBtn.textContent = t.studyButton;
    actions.appendChild(studyBtn);

    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = 'btn-action btn-favorite';
    favBtn.dataset.number = String(name.number);
    favBtn.setAttribute('aria-label',
        isFavorite ? 'Remove from favorites' : 'Add to favorites');
    favBtn.textContent = isFavorite ? '💔' : '❤️';
    actions.appendChild(favBtn);

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'btn-action btn-play';
    playBtn.dataset.number = String(name.number);
    playBtn.setAttribute('aria-label', `Pronounce ${name.transliteration}`);
    playBtn.textContent = '🔊';
    actions.appendChild(playBtn);

    card.appendChild(actions);
    return card;
}

/* ============================================================
   study view
   ============================================================ */

function studyName(index) {
    appState.currentStudyIndex = index;
    appState.currentView = 'study';
    setActiveTab('study');
    renderView();
}

function renderStudyView() {
    const name = namesData[appState.currentStudyIndex];
    const isFavorite = favoritesSet.has(name.number);

    document.getElementById('studyArabic').textContent = name.arabic;
    document.getElementById('studyTransliteration').textContent = name.transliteration;
    document.getElementById('studyMeaning').textContent = name.meaning[appState.currentLang];
    document.getElementById('studyReflection').textContent = name.reflection[appState.currentLang];

    const studyCard = document.querySelector('.study-card');
    let favoriteBtn = studyCard.querySelector('.study-favorite-btn');
    if (!favoriteBtn) {
        favoriteBtn = document.createElement('button');
        favoriteBtn.type = 'button';
        favoriteBtn.className = 'study-favorite-btn';
        favoriteBtn.addEventListener('click', () => toggleFavorite(name.number));
        studyCard.insertBefore(favoriteBtn, studyCard.firstChild);
    } else {
        const fresh = favoriteBtn.cloneNode(false);
        fresh.addEventListener('click', () => toggleFavorite(name.number));
        favoriteBtn.replaceWith(fresh);
        favoriteBtn = fresh;
    }
    favoriteBtn.textContent = isFavorite ? '💔' : '❤️';
    favoriteBtn.setAttribute('aria-label',
        isFavorite ? 'Remove from favorites' : 'Add to favorites');

    document.getElementById('prevName').disabled = appState.currentStudyIndex === 0;
    document.getElementById('nextName').disabled
        = appState.currentStudyIndex === namesData.length - 1;

    if (!learnedSet.has(name.number)) {
        appState.progress.learned.push(name.number);
        rebuildLookupSets();
        saveProgress();
    }
}

/* ============================================================
   quiz
   ============================================================ */

function startQuiz() {
    appState.quizData = {
        currentQuestion: 0,
        questions: generateQuizQuestions(10),
        score: 0,
        answered: false
    };
    rebuildQuizCardScaffold();
    renderQuizQuestion();
}

function generateQuizQuestions(count) {
    const questions = [];
    const used = new Set();

    while (questions.length < count && used.size < namesData.length) {
        const index = Math.floor(Math.random() * namesData.length);
        if (!used.has(index)) {
            used.add(index);
            questions.push({
                name: namesData[index],
                options: generateOptions(index)
            });
        }
    }
    return questions;
}

function generateOptions(correctIndex) {
    const options = [namesData[correctIndex].meaning[appState.currentLang]];
    const used = new Set([correctIndex]);

    while (options.length < 4) {
        const index = Math.floor(Math.random() * namesData.length);
        if (!used.has(index)) {
            used.add(index);
            options.push(namesData[index].meaning[appState.currentLang]);
        }
    }
    return shuffleArray(options);
}

/**
 * Restore the original quiz card markup. After `showQuizResults` we replace
 * the card body with a results panel; this rebuilds it before each new quiz.
 */
function rebuildQuizCardScaffold() {
    const card = document.querySelector('.quiz-card');
    if (!card) return;
    if (card.querySelector('#quizQuestion')) return;

    card.replaceChildren();

    const progressWrap = document.createElement('div');
    progressWrap.className = 'quiz-progress';
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Quiz progress');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', '0');
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.id = 'quizProgress';
    bar.appendChild(fill);
    const counter = document.createElement('div');
    counter.className = 'question-counter';
    counter.id = 'questionCounter';
    counter.setAttribute('aria-live', 'polite');
    progressWrap.appendChild(bar);
    progressWrap.appendChild(counter);

    const question = document.createElement('div');
    question.className = 'quiz-question';
    question.id = 'quizQuestion';

    const arabic = document.createElement('div');
    arabic.className = 'quiz-arabic-display arabic-text';
    arabic.id = 'quizArabic';

    const options = document.createElement('div');
    options.className = 'quiz-options';
    options.id = 'quizOptions';
    options.setAttribute('role', 'group');
    options.setAttribute('aria-label', 'Answer options');

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.id = 'nextQuestion';
    nextBtn.className = 'btn-nav hidden';
    nextBtn.textContent = translations[appState.currentLang].nextQuestion;
    nextBtn.addEventListener('click', () => {
        appState.quizData.currentQuestion++;
        if (appState.quizData.currentQuestion < appState.quizData.questions.length) {
            renderQuizQuestion();
        } else {
            showQuizResults();
        }
    });

    card.appendChild(progressWrap);
    card.appendChild(question);
    card.appendChild(arabic);
    card.appendChild(options);
    card.appendChild(nextBtn);
}

function renderQuizQuestion() {
    const q = appState.quizData.questions[appState.quizData.currentQuestion];
    const t = translations[appState.currentLang];

    const counterText = t.questionsFormat
        .replace('{current}', appState.quizData.currentQuestion + 1)
        .replace('{total}', appState.quizData.questions.length);
    document.getElementById('questionCounter').textContent = counterText;

    const fillPct = ((appState.quizData.currentQuestion + 1)
        / appState.quizData.questions.length) * 100;
    document.getElementById('quizProgress').style.width = `${fillPct}%`;

    const bar = document.querySelector('.quiz-progress .progress-bar');
    if (bar) bar.setAttribute('aria-valuenow', String(Math.round(fillPct)));

    document.getElementById('quizQuestion').textContent = t.whatIsTheMeaning;

    const quizArabic = document.getElementById('quizArabic');
    quizArabic.replaceChildren();
    const arabicLine = document.createElement('div');
    arabicLine.className = 'quiz-name-arabic';
    arabicLine.textContent = q.name.arabic;
    arabicLine.setAttribute('lang', 'ar');
    arabicLine.setAttribute('dir', 'rtl');
    const transLine = document.createElement('div');
    transLine.className = 'quiz-name-transliteration';
    transLine.textContent = q.name.transliteration;
    transLine.setAttribute('dir', 'ltr');
    quizArabic.appendChild(arabicLine);
    quizArabic.appendChild(transLine);

    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.replaceChildren();
    q.options.forEach(option => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        btn.textContent = option;
        btn.addEventListener('click',
            () => checkAnswer(option, q.name.meaning[appState.currentLang]));
        optionsContainer.appendChild(btn);
    });

    const nextBtn = document.getElementById('nextQuestion');
    nextBtn.classList.add('hidden');
    appState.quizData.answered = false;
}

function checkAnswer(selected, correct) {
    if (appState.quizData.answered) return;

    appState.quizData.answered = true;
    appState.progress.totalQuestions++;

    document.querySelectorAll('.quiz-option').forEach(opt => {
        if (opt.textContent === correct) {
            opt.classList.add('correct');
        } else if (opt.textContent === selected && selected !== correct) {
            opt.classList.add('incorrect');
        }
        opt.disabled = true;
    });

    if (selected === correct) {
        appState.quizData.score++;
        appState.progress.totalCorrect++;
    }

    saveProgress();
    document.getElementById('nextQuestion').classList.remove('hidden');
}

function showQuizResults() {
    const t = translations[appState.currentLang];
    appState.progress.quizzesTaken++;
    saveProgress();

    const total = appState.quizData.questions.length;
    const percentage = Math.round((appState.quizData.score / total) * 100);
    let message = t.keepPracticing;
    if (percentage === 100) message = t.perfectScore;
    else if (percentage >= 80) message = t.excellentScore;
    else if (percentage >= 60) message = t.goodScore;

    const card = document.querySelector('.quiz-card');
    card.replaceChildren();

    const container = document.createElement('div');
    container.className = 'quiz-results-container';

    const title = document.createElement('h2');
    title.className = 'quiz-results-title';
    title.textContent = t.quizComplete;
    container.appendChild(title);

    const scoreWrap = document.createElement('div');
    scoreWrap.className = 'quiz-result-score';
    const scoreNumber = document.createElement('div');
    scoreNumber.className = 'quiz-results-score-number';
    scoreNumber.textContent = `${appState.quizData.score}/${total}`;
    const pct = document.createElement('div');
    pct.className = 'quiz-percentage';
    pct.textContent = `${percentage}%`;
    scoreWrap.appendChild(scoreNumber);
    scoreWrap.appendChild(pct);
    container.appendChild(scoreWrap);

    const messageEl = document.createElement('p');
    messageEl.className = 'quiz-results-message';
    messageEl.textContent = message;
    container.appendChild(messageEl);

    const restart = document.createElement('button');
    restart.type = 'button';
    restart.id = 'restartQuizBtn';
    restart.className = 'btn-nav quiz-results-restart';
    restart.textContent = t.startNewQuiz;
    container.appendChild(restart);

    card.appendChild(container);
}

/* ============================================================
   progress view
   ============================================================ */

function renderProgress() {
    const t = translations[appState.currentLang];

    document.getElementById('learnedLabel').textContent = t.learned;
    document.getElementById('streakLabel').textContent = t.streak;
    document.getElementById('accuracyLabel').textContent = t.accuracy;
    document.getElementById('quizzesLabel').textContent = t.quizzesTaken;

    document.getElementById('totalLearned').textContent
        = appState.progress.learned.length;
    document.getElementById('currentStreak').textContent
        = appState.progress.dailyStreak;

    const accuracy = appState.progress.totalQuestions > 0
        ? Math.round((appState.progress.totalCorrect
            / appState.progress.totalQuestions) * 100)
        : 0;
    document.getElementById('quizAccuracy').textContent = `${accuracy}%`;
    document.getElementById('totalQuizzes').textContent
        = appState.progress.quizzesTaken;

    const progressView = document.querySelector('.progress-view');
    let clearBtn = progressView.querySelector('.clear-progress-btn');
    if (!clearBtn) {
        clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'clear-progress-btn btn-nav';
        clearBtn.textContent = t.clearProgress;
        clearBtn.addEventListener('click', clearAllProgress);
        progressView.insertBefore(clearBtn, progressView.querySelector('.names-grid'));
    } else {
        clearBtn.textContent = t.clearProgress;
    }

    const progressGrid = document.getElementById('progressGrid');
    const fragment = document.createDocumentFragment();

    if (appState.progress.favorites.length > 0) {
        const header = document.createElement('h3');
        header.className = 'progress-section-header progress-section-header--favorites';
        header.textContent = t.favorites;
        fragment.appendChild(header);

        appState.progress.favorites.forEach(num => {
            const name = namesByNumber.get(num);
            if (name) fragment.appendChild(createNameCard(name));
        });
    }

    if (appState.progress.learned.length > 0) {
        const header = document.createElement('h3');
        header.className = 'progress-section-header progress-section-header--learned';
        header.textContent = t.learned;
        fragment.appendChild(header);

        appState.progress.learned.forEach(num => {
            const name = namesByNumber.get(num);
            if (name && !favoritesSet.has(num)) {
                fragment.appendChild(createNameCard(name));
            }
        });
    }

    progressGrid.replaceChildren(fragment);
}

/* ============================================================
   daily-name modal
   ============================================================ */

let modalReturnFocus = null;

/**
 * Show the daily name once per calendar day. Index is computed from
 * day-of-year, so the cycle repeats every 99 days.
 */
function checkDailyName() {
    const today = new Date().toDateString();
    const lastShown = readStorage(STORAGE_KEYS.dailyName);
    if (lastShown === today) return;

    const startOfYear = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor((new Date() - startOfYear) / 86400000);
    const nameIndex = dayOfYear % namesData.length;
    const name = namesData[nameIndex];

    document.getElementById('dailyArabic').textContent = name.arabic;
    document.getElementById('dailyTransliteration').textContent = name.transliteration;
    document.getElementById('dailyMeaning').textContent = name.meaning[appState.currentLang];

    setTimeout(openDailyModal, 1000);
    writeStorage(STORAGE_KEYS.dailyName, today);
}

function openDailyModal() {
    const modal = document.getElementById('dailyModal');
    if (!modal) return;
    modalReturnFocus = document.activeElement;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    const close = document.getElementById('modalClose');
    if (close) close.focus();
}

function closeDailyModal() {
    const modal = document.getElementById('dailyModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (modalReturnFocus && typeof modalReturnFocus.focus === 'function') {
        modalReturnFocus.focus();
    }
    modalReturnFocus = null;
}

/* ============================================================
   global hooks (kept for parity with prior public API)
   ============================================================ */

window.studyName = studyName;
window.startQuiz = startQuiz;
window.clearAllProgress = clearAllProgress;
window.toggleFavorite = toggleFavorite;
