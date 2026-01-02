const UI = {
    getContentArea: function() {
        return document.getElementById('content');
    },

    renderLogs: function() {
        const dates = Object.keys(studyData.logs).sort().reverse();
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2>📅 공부 기록</h2>
                <button class="brown-btn" onclick="App.askNewDate()">+ 날짜 추가</button>
            </div>
            <ul style="list-style:none;">
                ${dates.map(date => `
                    <li style="padding:15px; border:1px solid #eee; margin-bottom:10px; border-radius:8px; cursor:pointer; background:#fff;" 
                        onclick="UI.renderLogDetail('${date}')">
                        <strong>${date}</strong> 공부 기록 보기
                    </li>
                `).join('')}
            </ul>`;
        this.getContentArea().innerHTML = html;
    },

    renderLogDetail: function(date) {
        const log = studyData.logs[date];
        let html = `
            <button class="white-btn" onclick="UI.renderLogs()" style="margin-bottom:15px;">← 뒤로가기</button>
            <h2>📅 ${date} 상세 내용</h2>
            
            <div style="display:flex; flex-direction:column; margin:20px 0;">
                ${log.chats.map(chat => `<div class="chat-bubble ${chat.role}">${chat.text}</div>`).join('')}
            </div>

            <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:20px;">
                <textarea id="geminiIn" placeholder="Gemini 답변 복사/붙여넣기" style="width:100%; height:60px;"></textarea>
                <textarea id="meIn" placeholder="나의 질문/답변 입력" style="width:100%; height:60px;"></textarea>
                <button class="brown-btn" onclick="App.addChat('${date}')" style="width:100%">대화 저장</button>
            </div>

            <h3>⭐ 필수 문장 추가</h3>
            <div style="display:flex; gap:5px; margin-top:10px;">
                <input type="text" id="sentenceIn" style="flex:1;" placeholder="영어 문장을 입력하세요">
                <button class="brown-btn" onclick="App.addSentence('${date}')">추가</button>
            </div>

            <div style="margin-top:20px;">
                ${log.sentences.map((s, i) => `
                    <div class="sentence-item-card">
                        <div><strong>${s.text}</strong><br><small>${s.trans}</small></div>
                        <button onclick="App.speak('${s.text.replace(/'/g, "\\'")}')">🔊</button>
                    </div>
                `).join('')}
            </div>
        `;
        this.getContentArea().innerHTML = html;
    },

    renderSentencesPage: function() {
        let html = `<h2>⭐ 전체 필수 문장</h2><div style="margin-top:20px;">`;
        for (const date in studyData.logs) {
            studyData.logs[date].sentences.forEach(s => {
                html += `
                    <div class="sentence-item-card">
                        <div><strong>${s.text}</strong><p>${s.trans}</p></div>
                        <button onclick="App.speak('${s.text.replace(/'/g, "\\'")}')">🔊</button>
                    </div>`;
            });
        }
        html += `</div>`;
        this.getContentArea().innerHTML = html;
    },

    renderTestPage: function(sentenceObj) {
        this.getContentArea().innerHTML = `
            <div style="text-align:center; padding:20px;">
                <h2>🎲 랜덤 테스트</h2>
                <div style="margin:30px 0; padding:20px; border:1px solid #ddd; border-radius:15px;">
                    <p style="color:#666; margin-bottom:10px;">다음 문장의 뜻은?</p>
                    <h1 style="margin-bottom:20px;">${sentenceObj.text}</h1>
                    <input type="text" id="testInput" style="width:100%; max-width:300px; text-align:center; padding:10px;" placeholder="한글 뜻 입력">
                    <div id="testResult"></div>
                    <div style="margin-top:20px; display:flex; justify-content:center; gap:10px;">
                        <button class="brown-btn" onclick="App.checkAnswer()">확인</button>
                        <button class="white-btn" onclick="App.startRandomTest()">다음 문제</button>
                    </div>
                </div>
            </div>`;
    }
};
