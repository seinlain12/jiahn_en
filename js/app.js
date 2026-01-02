const App = {
    currentTestSentence: null,
    geminiUrl: "https://gemini.google.com/u/2/app/655389b059f1115e?hl=ko&pageId=none",

    init: async function() {
        await loadDataFromServer(); // 서버 데이터 로드
        this.bindMenu();
        UI.renderLogs();
    },

    bindMenu: function() {
        document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('active');
        document.querySelectorAll('.sidebar li').forEach(item => {
            item.onclick = () => {
                const view = item.getAttribute('data-view');
                if (view === 'dates') UI.renderLogs();
                else if (view === 'sentences') UI.renderSentencesPage();
                else if (view === 'test') App.startRandomTest();
                else if (view === 'gemini') window.open(this.geminiUrl, '_blank');
                document.getElementById('sidebar').classList.remove('active');
            };
        });
    },

    addSentence: async function(date) {
        const sIn = document.getElementById('sentenceIn');
        const text = sIn.value.trim();
        if (!text) return;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`);
            const data = await res.json();
            let fullTrans = data[0] ? data[0].map(it => it[0]).join("") : "번역 실패";
            
            if(!studyData.logs[date].sentences) studyData.logs[date].sentences = [];
            studyData.logs[date].sentences.push({ text: text, trans: fullTrans });
            
            sIn.value = ""; 
            saveToStorage(); 
            UI.renderLogDetail(date);
        } catch (e) { alert("연결 오류"); }
    },

    checkAnswer: function() {
        const userIn = document.getElementById('testInput').value.trim();
        if (!userIn) return;
        const correct = this.currentTestSentence.trans;
        const isOk = correct.replace(/[\s\.\?\!]/g, "").includes(userIn.replace(/[\s\.\?\!]/g, ""));
        
        const resDiv = document.getElementById('testResult');
        if (isOk) {
            resDiv.innerHTML = `<div class="res correct">⭕ 정답입니다!<br><small>뜻: ${correct}</small></div>`;
        } else {
            resDiv.innerHTML = `<div class="res wrong">❌ 조금 다르네요.<br><small>뜻: ${correct}</small></div>
            <button class="white-btn" style="width:100%;margin-top:10px;" onclick="App.forceCorrect()">의미는 맞아요! 정답 처리</button>`;
        }
    },

    forceCorrect: function() {
        document.getElementById('testResult').innerHTML = `<div class="res correct">⭕ 확인했습니다! 정답 처리되었습니다.</div>`;
    },

    startRandomTest: function() {
        let all = [];
        for (const d in studyData.logs) {
            if(studyData.logs[d].sentences) all = all.concat(studyData.logs[d].sentences);
        }
        if (all.length === 0) return alert("문장이 없습니다.");
        this.currentTestSentence = all[Math.floor(Math.random() * all.length)];
        UI.renderTestPage(this.currentTestSentence);
    },

    addChat: function(date) {
        const g = document.getElementById('geminiIn'), m = document.getElementById('meIn');
        if (g.value.trim()) studyData.logs[date].chats.push({ role: "gemini", text: g.value });
        if (m.value.trim()) studyData.logs[date].chats.push({ role: "me", text: m.value });
        g.value = ""; m.value = ""; 
        saveToStorage(); 
        UI.renderLogDetail(date);
    },

    speak: function(t) { 
        window.speechSynthesis.cancel(); 
        const u = new SpeechSynthesisUtterance(t); 
        u.lang = 'en-US'; 
        window.speechSynthesis.speak(u); 
    },

    askNewDate: function() { 
        const d = prompt("YYMMDD 형태로 날짜 입력 (예: 260102)"); 
        if (d && !studyData.logs[d]) { 
            studyData.logs[d] = { chats: [], sentences: [] }; 
            saveToStorage(); 
            UI.renderLogs(); 
        } 
    },

    delSentence: function(d, i) { 
        studyData.logs[d].sentences.splice(i, 1); 
        saveToStorage(); 
        UI.renderLogDetail(d); 
    },

    deleteFullDate: function(d) { 
        if (confirm("해당 날짜의 모든 기록을 삭제할까요?")) { 
            delete studyData.logs[d]; 
            saveToStorage(); 
            UI.renderLogs(); 
        } 
    }
};

const UI = {
    renderLogs: function() {
        const list = document.getElementById('logList');
        list.innerHTML = "";
        Object.keys(studyData.logs).sort().reverse().forEach(date => {
            const div = document.createElement('div');
            div.className = "log-item";
            div.innerHTML = `<span>📅 20${date.slice(0,2)}-${date.slice(2,4)}-${date.slice(4,6)}</span>`;
            div.onclick = () => this.renderLogDetail(date);
            list.appendChild(div);
        });
    },

    renderLogDetail: function(date) {
        const list = document.getElementById('logList');
        list.innerHTML = `
            <div class="detail-header">
                <button onclick="UI.renderLogs()" class="back-btn">← 뒤로</button>
                <h2>20${date.slice(0,2)}년 ${date.slice(2,4)}월 ${date.slice(4,6)}일</h2>
                <button onclick="App.deleteFullDate('${date}')" class="del-btn">삭제</button>
            </div>
            <div class="card">
                <h3>💬 Gemini와 대화 기록</h3>
                <div id="chatBox"></div>
                <input type="text" id="geminiIn" placeholder="Gemini 답변 복사">
                <input type="text" id="meIn" placeholder="내 영어 질문 복사">
                <button onclick="App.addChat('${date}')" class="blue-btn">채팅 추가</button>
            </div>
            <div class="card">
                <h3>📝 외울 문장 추가</h3>
                <input type="text" id="sentenceIn" placeholder="영어 문장을 입력하세요">
                <button onclick="App.addSentence('${date}')" class="green-btn">자동 번역 후 저장</button>
                <div id="sentenceBox"></div>
            </div>`;
        
        const cBox = document.getElementById('chatBox');
        studyData.logs[date].chats.forEach(c => {
            const d = document.createElement('div');
            d.className = `chat ${c.role}`;
            d.innerText = c.text;
            cBox.appendChild(d);
        });

        const sBox = document.getElementById('sentenceBox');
        studyData.logs[date].sentences?.forEach((s, i) => {
            const d = document.createElement('div');
            d.className = "sentence-item";
            d.innerHTML = `
                <div onclick="App.speak('${s.text.replace(/'/g, "\\'")}')">
                    <b>${s.text}</b><br><small>${s.trans}</small>
                </div>
                <button onclick="App.delSentence('${date}', ${i})">×</button>`;
            sBox.appendChild(d);
        });
    },

    renderSentencesPage: function() {
        const list = document.getElementById('logList');
        list.innerHTML = "<h2>전체 문장 목록</h2>";
        for (const date in studyData.logs) {
            studyData.logs[date].sentences?.forEach(s => {
                const d = document.createElement('div');
                d.className = "sentence-item";
                d.innerHTML = `<b onclick="App.speak('${s.text.replace(/'/g, "\\'")}')">${s.text}</b><br><small>${s.trans} (${date})</small>`;
                list.appendChild(d);
            });
        }
    },

    renderTestPage: function(s) {
        const list = document.getElementById('logList');
        list.innerHTML = `
            <div class="card test-card">
                <h2>랜덤 퀴즈</h2>
                <p class="test-q">"${s.text}"</p>
                <button class="white-btn" onclick="App.speak('${s.text.replace(/'/g, "\\'")}')">🔊 발음 듣기</button>
                <hr>
                <p>위 문장의 한국어 뜻은?</p>
                <input type="text" id="testInput" placeholder="정답 입력">
                <button onclick="App.checkAnswer()" class="blue-btn">정답 확인</button>
                <div id="testResult"></div>
                <button onclick="App.startRandomTest()" class="white-btn" style="margin-top:20px;">다음 문제</button>
            </div>`;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
