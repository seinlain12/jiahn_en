const App = {
    currentTestSentence: null,
    currentTestWord: null,
    currentSpeakingTest: null,
    geminiUrl: "https://gemini.google.com/u/3/app/c817dbe3e5aa5be3?hl=ko&pageId=none",
    
    isAutoPlaying: false,
    autoPlayList: [],
    autoPlayIndex: 0,

    init: function() {
        const password = prompt("비밀번호를 입력하세요.");
        if (password === "970808") {
            document.body.style.display = "flex";
            this.bindMenu();
            loadData(() => { UI.renderLogs(); });
            
            window.speechSynthesis.getVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
            }
        } else {
            alert("비밀번호가 틀렸습니다.");
            window.location.reload();
        }
    },

    getBestVoices: function() {
        return window.speechSynthesis.getVoices();
    },

    loadVoice: function(text) {
        const voices = this.getBestVoices();
        const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
        if (isKorean) {
            return voices.find(v => v.name.includes('Yuna')) || voices.find(v => v.lang.includes('ko'));
        } else {
            return voices.find(v => v.name.includes('Alex')) || voices.find(v => v.lang.includes('en-US'));
        }
    },

    speak: function(text, callback) {
        if (!text) return;
        let cleanText = text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\u200d/g, "").replace(/[\*\"\#\(\)]/g, "").replace(/[\r\n]+/gm, " ").trim();
        window.speechSynthesis.cancel(); 
        const utter = new SpeechSynthesisUtterance(cleanText);
        const selectedVoice = this.loadVoice(cleanText);
        if (selectedVoice) { utter.voice = selectedVoice; utter.lang = selectedVoice.lang; }
        utter.rate = 0.9; 
        if (callback) utter.onend = callback;
        window.speechSynthesis.speak(utter);
    },

    startSpeakingTest: function() {
        let all = [];
        for (const d in studyData.logs) { if (studyData.logs[d].sentences) all = all.concat(studyData.logs[d].sentences); }
        if (all.length === 0) return alert("학습된 문장이 없습니다.");
        
        const target = all[Math.floor(Math.random() * all.length)];
        const words = target.text.split(' ').filter(w => w.length > 3);
        const keywords = words.length >= 2 ? [words[0], words[words.length-1]] : [words[0] || ""];
        
        this.currentSpeakingTest = {
            text: target.text,
            trans: target.trans,
            keywords: keywords.map(k => k.toLowerCase().replace(/[^a-z]/g, ""))
        };
        UI.renderSpeakingTestPage(this.currentSpeakingTest);
    },

    startListening: function() {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Recognition) return alert("지원하지 않는 브라우저입니다.");
        
        const recognition = new Recognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        UI.updateMicStatus(true);

        recognition.onresult = (event) => {
            const speechToText = event.results[0][0].transcript.toLowerCase();
            const keywords = this.currentSpeakingTest.keywords;
            const isSuccess = keywords.every(k => speechToText.includes(k));
            UI.renderSpeakingResult(isSuccess, speechToText);
        };

        recognition.onerror = () => { UI.updateMicStatus(false); };
        recognition.onend = () => UI.updateMicStatus(false);
        recognition.start();
    },

    startAutoPlay: function() {
        let all = [];
        for (const d in studyData.logs) { (studyData.logs[d].sentences || []).forEach(s => all.push(s.text)); }
        if (all.length === 0) return;
        this.autoPlayList = UI.shuffleArray([...all]);
        this.autoPlayIndex = 0; this.isAutoPlaying = true;
        UI.updateAutoPlayUI(true); this.playNextInLoop();
    },

    playNextInLoop: function() {
        if (!this.isAutoPlaying || this.autoPlayIndex >= this.autoPlayList.length) { this.stopAutoPlay(); return; }
        this.speak(this.autoPlayList[this.autoPlayIndex], () => {
            this.autoPlayIndex++;
            if (this.isAutoPlaying) setTimeout(() => this.playNextInLoop(), 3000);
        });
    },

    stopAutoPlay: function() { 
        this.isAutoPlaying = false; 
        window.speechSynthesis.cancel(); 
        UI.updateAutoPlayUI(false); 
    },

    bindMenu: function() {
        document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('active');
        document.querySelectorAll('.sidebar li').forEach(item => {
            item.onclick = () => {
                this.stopAutoPlay(); 
                const view = item.getAttribute('data-view');
                if (view === 'dates') UI.renderLogs();
                else if (view === 'sentences') UI.renderSentencesPage();
                else if (view === 'words') UI.renderWordsPage();
                else if (view === 'test') App.startRandomTest();
                else if (view === 'wordTest') App.startWordTest();
                else if (view === 'speakTest') App.startSpeakingTest();
                else if (view === 'gemini') window.open(this.geminiUrl, '_blank');
                document.getElementById('sidebar').classList.remove('active');
            };
        });
    },

    addWord: function() {
        const wordIn = document.getElementById('wordIn'), meanIn = document.getElementById('wordMeanIn'), descIn = document.getElementById('wordDescIn');
        if (!wordIn.value.trim() || !meanIn.value.trim()) return alert("내용을 입력하세요.");
        if (!studyData.words) studyData.words = [];
        studyData.words.push({ word: wordIn.value.trim(), mean: meanIn.value.trim(), desc: descIn.value.trim() });
        saveToStorage().then(() => UI.renderWordsPage());
    },

    deleteWord: function(index) {
        if (confirm("삭제할까요?")) { studyData.words.splice(index, 1); saveToStorage().then(() => UI.renderWordsPage()); }
    },

    addChat: function(date) {
        const gIn = document.getElementById('geminiIn'), mIn = document.getElementById('meIn');
        if (!studyData.logs[date]) studyData.logs[date] = { chats: [], sentences: [] };
        if (gIn.value.trim()) studyData.logs[date].chats.push({ role: "gemini", text: gIn.value.trim() });
        if (mIn.value.trim()) studyData.logs[date].chats.push({ role: "me", text: mIn.value.trim() });
        saveToStorage().then(() => UI.renderLogDetail(date));
    },

    addSentence: async function(date) {
        const sIn = document.getElementById('sentenceIn');
        if (!sIn.value.trim()) return;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(sIn.value)}`);
            const data = await res.json();
            studyData.logs[date].sentences.push({ text: sIn.value.trim(), trans: data[0][0][0] });
            saveToStorage().then(() => UI.renderLogDetail(date));
        } catch (e) { alert("연결 오류"); }
    },

    checkAnswer: function() {
        const userInput = document.getElementById('testInput').value.trim();
        const correct = this.currentTestSentence.trans;
        const resDiv = document.getElementById('testResult');
        if (correct.includes(userInput)) { resDiv.innerHTML = "⭕ 정답!"; App.speak("Correct!"); }
        else { resDiv.innerHTML = `❌ 오답! 정답: ${correct}`; }
    },

    startRandomTest: function() {
        let all = [];
        for (const d in studyData.logs) { if (studyData.logs[d].sentences) all = all.concat(studyData.logs[d].sentences); }
        if (all.length === 0) return alert("문장이 없습니다.");
        this.currentTestSentence = all[Math.floor(Math.random() * all.length)];
        UI.renderTestPage(this.currentTestSentence);
    },

    startWordTest: function() {
        const words = studyData.words || [];
        if (words.length === 0) return alert("단어장이 비어있습니다.");
        this.currentTestWord = words[Math.floor(Math.random() * words.length)];
        UI.renderWordTestPage(this.currentTestWord);
    },

    checkWordAnswer: function() {
        const userInput = document.getElementById('wordTestInput').value.trim().toLowerCase();
        const correct = this.currentTestWord.word.toLowerCase();
        const resDiv = document.getElementById('wordTestResult');
        if (userInput === correct) { resDiv.innerHTML = "⭕ 정답!"; App.speak(correct); }
        else { resDiv.innerHTML = `❌ 오답! 정답은 ${correct}`; }
    },

    askNewDate: function() {
        const d = prompt("날짜 입력 (YYMMDD)");
        if (d) {
            if (!studyData.logs) studyData.logs = {};
            if (!studyData.logs[d]) { studyData.logs[d] = { chats: [], sentences: [] }; saveToStorage().then(() => UI.renderLogs()); }
        }
    },

    delSentence: function(date, i) { studyData.logs[date].sentences.splice(i, 1); saveToStorage().then(() => UI.renderLogDetail(date)); },
    saveData: function() { saveToStorage().then(() => alert("저장 완료!")); }
};
document.addEventListener('DOMContentLoaded', () => App.init());
