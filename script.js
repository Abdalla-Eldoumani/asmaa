import { namesData } from './names.js';

// App State
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
    progress: {
        learned: [],
        dailyStreak: 0,
        lastVisit: null,
        quizzesTaken: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        favorites: []
    }
};

// Translations
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
        quizComplete: 'Quiz Complete!',
        yourScore: 'Your Score',
        clearProgress: 'Clear All Progress',
        confirmClear: 'Are you sure you want to clear all your progress? This cannot be undone.',
        progressCleared: 'All progress has been cleared',
        studyButton: 'Study',
        favoriteButton: '❤️',
        unfavoriteButton: '💔',
        favorites: 'Favorite Names',
        noFavorites: 'No favorite names yet',
        startNewQuiz: 'Start New Quiz'
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
        quizComplete: 'اكتمل الاختبار!',
        yourScore: 'نتيجتك',
        clearProgress: 'مسح كل التقدم',
        confirmClear: 'هل أنت متأكد من أنك تريد مسح كل تقدمك؟ لا يمكن التراجع عن هذا.',
        progressCleared: 'تم مسح جميع التقدم',
        studyButton: 'ادرس',
        favoriteButton: '❤️',
        unfavoriteButton: '💔',
        favorites: 'الأسماء المفضلة',
        noFavorites: 'لا توجد أسماء مفضلة بعد',
        startNewQuiz: 'ابدأ اختبار جديد'
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
        quizComplete: 'Quiz Terminé!',
        yourScore: 'Votre Score',
        clearProgress: 'Effacer Tous les Progrès',
        confirmClear: 'Êtes-vous sûr de vouloir effacer tous vos progrès? Cela ne peut pas être annulé.',
        progressCleared: 'Tous les progrès ont été effacés',
        studyButton: 'Étudier',
        favoriteButton: '❤️',
        unfavoriteButton: '💔',
        favorites: 'Noms Favoris',
        noFavorites: 'Pas encore de noms favoris',
        startNewQuiz: 'Commencer un Nouveau Quiz'
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadProgress();
    initializeEventListeners();
    applyTheme();
    renderView();
    checkDailyName();
});

// Load settings from localStorage
function loadSettings() {
    const savedTheme = localStorage.getItem('asmaaTheme');
    const savedLang = localStorage.getItem('asmaaLanguage');
    
    if (savedTheme) {
        appState.currentTheme = savedTheme;
    }
    
    if (savedLang) {
        appState.currentLang = savedLang;
        document.body.classList.toggle('rtl', savedLang === 'ar');
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('asmaaTheme', appState.currentTheme);
    localStorage.setItem('asmaaLanguage', appState.currentLang);
}

// Apply theme
function applyTheme() {
    document.body.setAttribute('data-theme', appState.currentTheme);
    document.getElementById('themeToggle').textContent = appState.currentTheme === 'light' ? '🌙' : '☀️';
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('asmaaProgress');
    if (saved) {
        appState.progress = JSON.parse(saved);
        // Ensure favorites array exists for older saved data
        if (!appState.progress.favorites) {
            appState.progress.favorites = [];
        }
    }
    
    // Check and update streak
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

// Save progress to localStorage
function saveProgress() {
    localStorage.setItem('asmaaProgress', JSON.stringify(appState.progress));
}

// Clear all progress
function clearAllProgress() {
    const t = translations[appState.currentLang];
    if (confirm(t.confirmClear)) {
        appState.progress = {
            learned: [],
            dailyStreak: 0,
            lastVisit: new Date().toISOString(),
            quizzesTaken: 0,
            totalCorrect: 0,
            totalQuestions: 0,
            favorites: []
        };
        saveProgress();
        renderProgress();
        showNotification(t.progressCleared);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Toggle favorite
function toggleFavorite(nameNumber) {
    const index = appState.progress.favorites.indexOf(nameNumber);
    if (index > -1) {
        appState.progress.favorites.splice(index, 1);
    } else {
        appState.progress.favorites.push(nameNumber);
    }
    saveProgress();
    renderView();
}

// Initialize Event Listeners
function initializeEventListeners() {
    // Language selector
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        appState.currentLang = e.target.value;
        document.body.classList.toggle('rtl', appState.currentLang === 'ar');
        saveSettings();
        renderView();
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        appState.currentTheme = appState.currentTheme === 'light' ? 'dark' : 'light';
        applyTheme();
        saveSettings();
    });

    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            appState.currentView = e.target.dataset.view;
            renderView();
        });
    });

    // Search bar
    document.getElementById('searchBar').addEventListener('input', (e) => {
        appState.searchTerm = e.target.value.toLowerCase();
        renderNamesGrid();
    });

    // Study navigation
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

    // Play audio
    document.getElementById('playAudio').addEventListener('click', () => {
        const name = namesData[appState.currentStudyIndex];
        playNameAudio(name.arabic);
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('dailyModal').classList.remove('active');
    });

    // Next question in quiz
    document.getElementById('nextQuestion').addEventListener('click', () => {
        appState.quizData.currentQuestion++;
        if (appState.quizData.currentQuestion < appState.quizData.questions.length) {
            renderQuizQuestion();
        } else {
            showQuizResults();
        }
    });

    // Keyboard navigation for study mode
    document.addEventListener('keydown', (e) => {
        if (appState.currentView === 'study') {
            if (e.key === 'ArrowLeft' && appState.currentStudyIndex > 0) {
                appState.currentStudyIndex--;
                renderStudyView();
            } else if (e.key === 'ArrowRight' && appState.currentStudyIndex < namesData.length - 1) {
                appState.currentStudyIndex++;
                renderStudyView();
            } else if (e.key === ' ') {
                e.preventDefault();
                const name = namesData[appState.currentStudyIndex];
                playNameAudio(name.arabic);
            }
        }
    });
}

// Play name audio with visual feedback
function playNameAudio(arabic) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(arabic);
        utterance.lang = 'ar';
        utterance.rate = 0.8;
        
        // Visual feedback
        const playButton = document.getElementById('playAudio');
        if (playButton) {
            playButton.classList.add('playing');
            utterance.onend = () => {
                playButton.classList.remove('playing');
            };
        }
        
        speechSynthesis.speak(utterance);
    }
}

// Render current view
function renderView() {
    document.querySelectorAll('.view-content').forEach(view => {
        view.style.display = 'none';
    });

    switch(appState.currentView) {
        case 'browse':
            document.querySelector('.browse-view').style.display = 'block';
            renderNamesGrid();
            break;
        case 'study':
            document.querySelector('.study-view').style.display = 'block';
            renderStudyView();
            break;
        case 'quiz':
            document.querySelector('.quiz-view').style.display = 'block';
            startQuiz();
            break;
        case 'progress':
            document.querySelector('.progress-view').style.display = 'block';
            renderProgress();
            break;
    }

    updateUIText();
}

// Update UI text based on language
function updateUIText() {
    const t = translations[appState.currentLang];
    document.querySelectorAll('.nav-tab')[0].textContent = t.browse;
    document.querySelectorAll('.nav-tab')[1].textContent = t.study;
    document.querySelectorAll('.nav-tab')[2].textContent = t.quiz;
    document.querySelectorAll('.nav-tab')[3].textContent = t.progress;
    document.getElementById('searchBar').placeholder = t.search;
    document.getElementById('prevName').textContent = t.previous;
    document.getElementById('nextName').textContent = t.next;
    document.getElementById('playAudio').innerHTML = `${t.play}`;
    document.querySelector('.daily-name-header').textContent = t.todaysName;
    
    // Update language selector
    document.getElementById('languageSelector').value = appState.currentLang;
}

// Render names grid with improved cards
function renderNamesGrid() {
    const grid = document.getElementById('namesGrid');
    grid.innerHTML = '';

    const filtered = namesData.filter(name => {
        if (!appState.searchTerm) return true;
        return name.arabic.includes(appState.searchTerm) ||
                name.transliteration.toLowerCase().includes(appState.searchTerm) ||
                name.meaning[appState.currentLang].toLowerCase().includes(appState.searchTerm) ||
                name.number.toString().includes(appState.searchTerm);
    });

    filtered.forEach(name => {
        const card = createNameCard(name);
        grid.appendChild(card);
    });
}

// Create enhanced name card
function createNameCard(name) {
    const t = translations[appState.currentLang];
    const isFavorite = appState.progress.favorites.includes(name.number);
    const isLearned = appState.progress.learned.includes(name.number);
    
    const card = document.createElement('div');
    card.className = `name-card ${isLearned ? 'learned' : ''} ${isFavorite ? 'favorite' : ''}`;
    card.innerHTML = `
        <div class="name-number">${name.number}</div>
        ${isFavorite ? '<div class="favorite-badge">❤️</div>' : ''}
        ${isLearned ? '<div class="learned-badge">✓</div>' : ''}
        <div class="name-arabic arabic-text">${name.arabic}</div>
        <div class="name-transliteration">${name.transliteration}</div>
        <div class="name-meaning">${name.meaning[appState.currentLang]}</div>
        <div class="name-actions">
            <button class="btn-action btn-study" data-index="${name.number - 1}">${t.studyButton}</button>
            <button class="btn-action btn-favorite" data-number="${name.number}">
                ${isFavorite ? '💔' : '❤️'}
            </button>
            <button class="btn-action btn-play" data-arabic="${name.arabic}">🔊</button>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.btn-study').addEventListener('click', (e) => {
        e.stopPropagation();
        studyName(parseInt(e.target.dataset.index));
    });
    
    card.querySelector('.btn-favorite').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(parseInt(e.target.dataset.number));
    });
    
    card.querySelector('.btn-play').addEventListener('click', (e) => {
        e.stopPropagation();
        playNameAudio(e.target.dataset.arabic);
    });
    
    // Click on card to study
    card.addEventListener('click', () => {
        studyName(name.number - 1);
    });
    
    return card;
}

// Study specific name
function studyName(index) {
    appState.currentStudyIndex = index;
    appState.currentView = 'study';
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab')[1].classList.add('active');
    renderView();
}

// Play name audio (global function for onclick)
function playName(arabic) {
    playNameAudio(arabic);
}

// Render enhanced study view
function renderStudyView() {
    const name = namesData[appState.currentStudyIndex];
    const isFavorite = appState.progress.favorites.includes(name.number);
    
    document.getElementById('studyArabic').textContent = name.arabic;
    document.getElementById('studyTransliteration').textContent = name.transliteration;
    document.getElementById('studyMeaning').textContent = name.meaning[appState.currentLang];
    document.getElementById('studyReflection').textContent = name.reflection[appState.currentLang];
    
    // Add favorite button to study view
    const studyCard = document.querySelector('.study-card');
    let favoriteBtn = studyCard.querySelector('.study-favorite-btn');
    if (!favoriteBtn) {
        favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'study-favorite-btn';
        studyCard.insertBefore(favoriteBtn, studyCard.firstChild);
    }
    favoriteBtn.innerHTML = isFavorite ? '💔' : '❤️';
    favoriteBtn.onclick = () => toggleFavorite(name.number);
    
    document.getElementById('prevName').disabled = appState.currentStudyIndex === 0;
    document.getElementById('nextName').disabled = appState.currentStudyIndex === namesData.length - 1;
    
    // Mark as learned
    if (!appState.progress.learned.includes(name.number)) {
        appState.progress.learned.push(name.number);
        saveProgress();
    }
}

// Start quiz
function startQuiz() {
    appState.quizData = {
        currentQuestion: 0,
        questions: generateQuizQuestions(10),
        score: 0,
        answered: false
    };
    renderQuizQuestion();
}

// Generate quiz questions
function generateQuizQuestions(count) {
    const questions = [];
    const used = new Set();
    
    while (questions.length < count && questions.length < namesData.length) {
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

// Generate quiz options
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
    
    return options.sort(() => Math.random() - 0.5);
}

// Render quiz question
function renderQuizQuestion() {
    const q = appState.quizData.questions[appState.quizData.currentQuestion];
    const t = translations[appState.currentLang];
    
    document.getElementById('currentQuestion').textContent = appState.quizData.currentQuestion + 1;
    document.getElementById('totalQuestions').textContent = appState.quizData.questions.length;
    document.getElementById('quizProgress').style.width = 
        `${((appState.quizData.currentQuestion + 1) / appState.quizData.questions.length) * 100}%`;
    
    document.getElementById('quizQuestion').textContent = t.whatIsTheMeaning;
    document.getElementById('quizArabic').textContent = q.name.arabic;
    
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    
    q.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option, q.name.meaning[appState.currentLang]);
        optionsContainer.appendChild(btn);
    });
    
    document.getElementById('nextQuestion').style.display = 'none';
    appState.quizData.answered = false;
}

// Check quiz answer
function checkAnswer(selected, correct) {
    if (appState.quizData.answered) return;
    
    appState.quizData.answered = true;
    appState.progress.totalQuestions++;
    
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
        if (opt.textContent === correct) {
            opt.classList.add('correct');
        } else if (opt.textContent === selected && selected !== correct) {
            opt.classList.add('incorrect');
        }
        opt.style.pointerEvents = 'none';
    });
    
    if (selected === correct) {
        appState.quizData.score++;
        appState.progress.totalCorrect++;
    }
    
    saveProgress();
    document.getElementById('nextQuestion').style.display = 'block';
}

// Show quiz results
function showQuizResults() {
    const t = translations[appState.currentLang];
    appState.progress.quizzesTaken++;
    saveProgress();
    
    const percentage = Math.round((appState.quizData.score / appState.quizData.questions.length) * 100);
    let message = '';
    if (percentage === 100) {
        message = '🌟 Perfect! Masha\'Allah! 🌟';
    } else if (percentage >= 80) {
        message = '✨ Excellent work! ✨';
    } else if (percentage >= 60) {
        message = '👍 Good job! Keep learning!';
    } else {
        message = '📚 Keep practicing, you\'ll improve!';
    }
    
    document.querySelector('.quiz-card').innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h2 style="color: var(--primary-green); margin-bottom: 1rem;">${t.quizComplete}</h2>
            <div class="quiz-result-score">
                <div style="font-size: 4rem; margin: 1rem 0; font-weight: bold;">
                    ${appState.quizData.score}/${appState.quizData.questions.length}
                </div>
                <div class="quiz-percentage">${percentage}%</div>
            </div>
            <p style="font-size: 1.3rem; color: var(--text-secondary); margin: 1rem 0;">${message}</p>
            <button class="btn-nav" onclick="startQuiz()" style="margin-top: 2rem;">${t.startNewQuiz}</button>
        </div>
    `;
}

// Render enhanced progress view
function renderProgress() {
    const t = translations[appState.currentLang];
    
    document.getElementById('totalLearned').textContent = appState.progress.learned.length;
    document.getElementById('currentStreak').textContent = appState.progress.dailyStreak;
    
    const accuracy = appState.progress.totalQuestions > 0 ? Math.round((appState.progress.totalCorrect / appState.progress.totalQuestions) * 100) : 0;
    document.getElementById('quizAccuracy').textContent = accuracy + '%';
    document.getElementById('totalQuizzes').textContent = appState.progress.quizzesTaken;
    
    // Add clear progress button if it doesn't exist
    const progressView = document.querySelector('.progress-view');
    let clearBtn = progressView.querySelector('.clear-progress-btn');
    if (!clearBtn) {
        clearBtn = document.createElement('button');
        clearBtn.className = 'clear-progress-btn btn-nav';
        clearBtn.textContent = t.clearProgress;
        clearBtn.onclick = clearAllProgress;
        
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        container.style.marginTop = '2rem';
        container.appendChild(clearBtn);
        
        progressView.insertBefore(container, progressView.querySelector('.names-grid'));
    } else {
        clearBtn.textContent = t.clearProgress;
    }
    
    // Show learned names and favorites
    const progressGrid = document.getElementById('progressGrid');
    progressGrid.innerHTML = '';
    
    // Add favorites section
    if (appState.progress.favorites.length > 0) {
        const favoritesHeader = document.createElement('h3');
        favoritesHeader.textContent = t.favorites;
        favoritesHeader.style.gridColumn = '1 / -1';
        favoritesHeader.style.marginTop = '2rem';
        favoritesHeader.style.color = 'var(--primary-gold)';
        progressGrid.appendChild(favoritesHeader);
        
        appState.progress.favorites.forEach(num => {
            const name = namesData.find(n => n.number === num);
            if (name) {
                const card = createNameCard(name);
                progressGrid.appendChild(card);
            }
        });
    }
    
    // Add learned names section
    if (appState.progress.learned.length > 0) {
        const learnedHeader = document.createElement('h3');
        learnedHeader.textContent = t.learned;
        learnedHeader.style.gridColumn = '1 / -1';
        learnedHeader.style.marginTop = '2rem';
        learnedHeader.style.color = 'var(--primary-green)';
        progressGrid.appendChild(learnedHeader);
        
        appState.progress.learned.forEach(num => {
            const name = namesData.find(n => n.number === num);
            if (name && !appState.progress.favorites.includes(num)) {
                const card = createNameCard(name);
                progressGrid.appendChild(card);
            }
        });
    }
}

// Check and show daily name
function checkDailyName() {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('lastDailyName');
    
    if (lastShown !== today) {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const nameIndex = dayOfYear % namesData.length;
        const name = namesData[nameIndex];
        
        document.getElementById('dailyArabic').textContent = name.arabic;
        document.getElementById('dailyTransliteration').textContent = name.transliteration;
        document.getElementById('dailyMeaning').textContent = name.meaning[appState.currentLang];
        
        setTimeout(() => {
            document.getElementById('dailyModal').classList.add('active');
        }, 1000);
        
        localStorage.setItem('lastDailyName', today);
    }
}

window.studyName = studyName;
window.playName = playName;
window.startQuiz = startQuiz;
window.clearAllProgress = clearAllProgress;
window.toggleFavorite = toggleFavorite;