const UI = {
    getContentArea: () => document.getElementById('content'),

    renderLogs: function() {
        const dates = Object.keys(studyData.logs).sort().reverse();
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2>📅 공부 기록</h2>
                <button class="brown-btn" onclick="App.askNewDate()">+ 날짜 추가</button>
            </div>
            <ul>
                ${dates.map(date => `
                    <li style="padding:15px; border:1px solid #eee; margin-bottom:10px; border-radius:8px; cursor:pointer; list-style:none;" 
                        onclick="UI.renderLogDetail('${date}')"><strong>${date}</strong> 공부 기록</li>
                `).join('')}
            </ul>`;
        this.getContentArea().innerHTML = html;
    },

    renderLogDetail: function(date) {
        const log = studyData.logs[date];
        let html = `
            <button class="brown-btn" onclick="UI.renderLogs()" style="margin-bottom:15px; background:#666;">← 목록으로</button>
            <h2>📅 ${date} 상세 내용</h2>
            
            <div style="display:flex; flex-direction:column; margin:20px 0;">
                ${log.chats.map((chat, idx) => `
                    <div class="chat-bubble ${chat.role}">${chat.text}</div>
                `).join('')}
            </div>

            <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:20px;">
                <h3>✍️ 새 대화 추가</h3>
                <textarea id="geminiIn" placeholder="Gemini 답변" style="width:100%; height:80px; margin:5px 0; padding:10px;"></textarea>
                <textarea id="meIn" placeholder="나의 답변" style="width:100%; height:80px; margin:5px 0; padding:10px;"></textarea>
                <button class="brown-btn" onclick="App.addChat('${date}')" style="width:100%">대화 저장</button>
            </div>

            <div class="sentence-section">
                <h3>⭐ 필수 문장 추가</h3>
                <div style="display:flex; gap:5px; margin:10px 0;">
                    <input type="text" id="sentenceIn" style="flex:1; padding:10px;" placeholder="영어 문장 입력">
                    <button class="brown-btn" onclick="App.addSentence('${date}')">추가</button>
                </div>
                <div id="sentenceList">
                    ${log.sentences.map((s, i) => `
                        <div class="sentence-item-card">
                            <div style="flex:1;"><strong>${s.text}</strong><br><small>${s.trans}</small></div>
                            <div style="display:flex; gap:5px;">
                                <button onclick="App.speak('${s.text.replace(/'/g, "\\'")}')" style="background:none; border:none; cursor:pointer;">🔊</button>
                                <button class="delete-btn" onclick="App.delSentence('${date}', ${i})">❌</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <button class="delete-all-btn" onclick="App.deleteFullDate('${date}')">🗑️ ${date} 기록 전체 삭제</button>
        `;
        this.getContentArea().innerHTML = html;
    },

    renderSentencesPage: function() {
        let html = `<h2>⭐ 필수 문장 모음</h2>`;
        for (const date in studyData.logs) {
            studyData.logs[date].sentences.forEach((s, i) => {
                html += `
                    <div class="sentence-item-card">
                        <div><strong>${s.text}</strong><p>${s.trans}</p></div>
                        <button class="brown-btn" onclick="App.speak('${s.text.replace(/'/g, "\\'")}')">🔊 발음</button>
                    </div>`;
            });
        }
        this.getContentArea().innerHTML = html;
    },

    renderTestPage: function(s) {
        this.getContentArea().innerHTML = `
            <div style="text-align:center;">
                <h2>🎲 랜덤 테스트</h2>
                <div style="margin:30px auto; padding:30px; border:1px solid #ddd; border-radius:15px; max-width:500px;">
                    <p>이 문장은 무슨 뜻일까요?</p>
                    <h2 style="margin:20px 0;">${s.text}</h2>
                    <input type="text" id="testInput" style="width:100%; padding:12px; text-align:center;" placeholder="뜻을 입력하세요">
                    <div id="testResult"></div>
                    <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
                        <button class="brown-btn" onclick="App.checkAnswer()">정답 확인</button>
                        <button class="brown-btn" onclick="App.startRandomTest()" style="background:#666;">다음 문제</button>
                    </div>
                </div>
            </div>`;
    }
};
