const UI = {
    contentArea: () => document.getElementById('content'),
    shuffleArray: (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    // 🎤 발음 테스트 UI
    renderSpeakingTestPage: function(data) {
        let html = `
            <div class="test-container speak-test">
                <h2>🎤 듣고 바로 말하기</h2>
                <div class="test-card" style="text-align:center;">
                    <div class="hint-box" style="background:#f2f2f2; padding:30px; border-radius:20px; margin-bottom:20px;">
                        <p style="color:#888; margin-bottom:10px;">상황 힌트</p>
                        <h3 style="font-size:20px; margin-bottom:15px;">${data.trans}</h3>
                        <p style="color:var(--main-brown); font-weight:bold;">키워드: ${data.keywords.filter(k=>k).join(', ')}</p>
                    </div>

                    <div id="hiddenSentence" style="display:none; margin-bottom:20px; padding:15px; border:1px dashed var(--main-brown); border-radius:10px; background:#fffbe6; font-weight:bold; color:#333;">
                        ${data.text}
                    </div>

                    <div class="btn-group" style="display:flex; gap:10px;">
                        <button class="brown-btn" style="flex:1;" onclick="App.speak('${data.text.replace(/'/g, "\\'")}')">🔊 듣기</button>
                        <button id="micBtn" class="white-btn" style="flex:1; border:2px solid var(--main-brown);" onclick="App.startListening()">🎤 말하기</button>
                    </div>

                    <div id="speakResult" style="margin-top:25px; min-height:80px;"></div>

                    <button class="white-btn" style="width:100%; margin-top:20px; font-size:14px; color:#666;" onclick="UI.toggleHiddenSentence()">👁️ 문장 전체보기</button>
                    
                    <button class="white-btn" style="width:100%; margin-top:10px; font-weight:bold;" onclick="App.startSpeakingTest()">다음 문장 ➡️</button>
                </div>
            </div>
        `;
        this.contentArea().innerHTML = html;
    },

    // 💡 문장 전체보기 토글 기능
    toggleHiddenSentence: function() {
        const div = document.getElementById('hiddenSentence');
        if (div) {
            div.style.display = (div.style.display === 'none') ? 'block' : 'none';
        }
    },

    updateMicStatus: function(isListening) {
        const btn = document.getElementById('micBtn');
        if (btn) {
            btn.innerHTML = isListening ? "🔴 듣는 중..." : "🎤 말하기";
            btn.style.background = isListening ? "#fff0f0" : "#fff";
        }
    },

    renderSpeakingResult: function(isSuccess, speech) {
        const resDiv = document.getElementById('speakResult');
        const correctText = App.currentSpeakingTest.text; // 정답 텍스트 가져오기

        if (isSuccess) {
            resDiv.innerHTML = `
                <h2 style="color:green;">👍 잘했어요!</h2>
                <p style="color:#333; font-weight:bold; margin-top:5px;">정답: ${correctText}</p>
                <p style="color:#999; font-size:13px;">인식: ${speech}</p>`;
            App.speak("Great job!");
        } else {
            resDiv.innerHTML = `
                <h2 style="color:orange;">🔁 한 번 더 해볼까?</h2>
                <p style="color:#333; font-weight:bold; margin-top:5px;">정답: ${correctText}</p>
                <p style="color:#999; font-size:13px;">인식: ${speech}</p>`;
        }
    },

    updateAutoPlayUI: function(isPlaying) {
        const startBtn = document.getElementById('startPlayBtn');
        const stopBtn = document.getElementById('stopPlayBtn');
        if (startBtn && stopBtn) {
            startBtn.style.display = isPlaying ? 'none' : 'block';
            stopBtn.style.display = isPlaying ? 'block' : 'none';
        }
    },

    renderLogs: function() {
        const dates = studyData.logs ? Object.keys(studyData.logs).sort().reverse() : [];
        this.contentArea().innerHTML = `<h2>📅 공부 기록</h2><button class="add-btn" onclick="App.askNewDate()">+ 날짜 추가</button><ul class="date-list">${dates.map(d => `<li onclick="UI.renderLogDetail('${d}')">${d}</li>`).join('')}</ul>`;
    },

    renderLogDetail: function(date) {
        const log = studyData.logs[date] || { chats: [], sentences: [] };
        let html = `
            <div class="detail-header"><span onclick="UI.renderLogs()" style="cursor:pointer; color:#888;">← 목록</span><h2>📅 ${date}</h2></div>
            <div class="chat-container">${(log.chats||[]).map(c=>`<div class="chat-row ${c.role}"><div class="chat-bubble ${c.role}">${c.text}</div><button class="chat-speak-btn" data-text="${encodeURIComponent(c.text)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊</button></div>`).join('')}</div>
            <div class="sentence-section"><h3>⭐ 필수 문장</h3><div id="sentenceList">${(log.sentences||[]).map((s,i)=>`<div class="sentence-item-card"><div class="s-content"><strong>${s.text}</strong><span>${s.trans}</span></div><button data-text="${encodeURIComponent(s.text)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊</button></div>`).join('')}</div></div>
        `;
        this.contentArea().innerHTML = html;
    },

    renderSentencesPage: function() {
        let all = []; Object.values(studyData.logs).forEach(l => { if(l.sentences) all = all.concat(l.sentences); });
        const shuffled = this.shuffleArray([...all]);
        let html = `<h2>⭐ 필수 문장 (랜덤)</h2><button id="startPlayBtn" class="brown-btn" style="width:100%; margin-bottom:20px;" onclick="App.startAutoPlay()">🔀 전체 랜덤 재생(3초)</button>
                    <button id="stopPlayBtn" class="white-btn" style="width:100%; display:none; color:red; border-color:red;" onclick="App.stopAutoPlay()">⏹ 재생 중지</button>`;
        shuffled.forEach(s => { html += `<div class="sentence-item-card"><strong>${s.text}</strong><p>${s.trans}</p><button data-text="${encodeURIComponent(s.text)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊</button></div>`; });
        this.contentArea().innerHTML = html;
    },

    renderWordsPage: function() {
        const words = studyData.words || [];
        const shuffled = this.shuffleArray([...words]);
        let html = `<h2>📖 나의 단어장</h2><div class="input-section"><input id="wordIn" placeholder="단어"><textarea id="wordMeanIn" placeholder="뜻"></textarea><button class="brown-btn" style="width:100%;" onclick="App.addWord()">추가</button></div>
                    <div id="wordList">${shuffled.map(w => `<div class="sentence-item-card word-card"><strong>${w.word}</strong><p>${w.mean}</p><button data-text="${encodeURIComponent(w.word)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊</button></div>`).join('')}</div>`;
        this.contentArea().innerHTML = html;
    },

    renderTestPage: function(s) {
        this.contentArea().innerHTML = `<div class="test-container"><h2>🎲 문장 테스트</h2><div class="test-card"><h3>${s.text}</h3><button onclick="App.speak('${s.text.replace(/'/g,"\\'")}')">🔊 듣기</button><input type="text" id="testInput" placeholder="뜻 입력"><button onclick="App.checkAnswer()">확인</button><div id="testResult"></div><button onclick="App.startRandomTest()">다음 문제</button></div></div>`;
    },

    renderWordTestPage: function(w) {
        this.contentArea().innerHTML = `<div class="test-container"><h2>📖 단어 테스트</h2><div class="test-card"><h3>${w.mean}</h3><input type="text" id="wordTestInput" placeholder="영어 단어 입력"><button onclick="App.checkWordAnswer()">확인</button><div id="wordTestResult"></div><button onclick="App.startWordTest()">다음 문제</button></div></div>`;
    }
};
