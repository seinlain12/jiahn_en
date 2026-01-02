const UI = {
    // 콘텐츠 영역을 가져오는 공통 함수
    getContentArea: () => document.getElementById('content'),

    // 1. 날짜별 공부 기록 목록 렌더링
    renderLogs: function() {
        const dates = Object.keys(studyData.logs).sort().reverse();
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2>📅 공부 기록</h2>
                <button class="brown-btn" onclick="App.askNewDate()">+ 날짜 추가</button>
            </div>
            <ul style="padding:0;">
                ${dates.map(date => `
                    <li class="sentence-item-card" 
                        style="cursor:pointer; list-style:none;" 
                        onclick="UI.renderLogDetail('${date}')">
                        <strong>20${date.substring(0,2)}년 ${date.substring(2,4)}월 ${date.substring(4,6)}일</strong> 기록
                    </li>
                `).join('')}
            </ul>`;
        
        const area = this.getContentArea();
        area.innerHTML = html;
        area.scrollTop = 0; // 페이지 전환 시 최상단으로 이동
    },

    // 2. 특정 날짜 상세 내용 보기
    renderLogDetail: function(date) {
        const log = studyData.logs[date];
        let html = `
            <button class="brown-btn" onclick="UI.renderLogs()" style="margin-bottom:15px; background:#666;">← 목록으로</button>
            <h2>📅 ${date} 상세 내용</h2>
            
            <div style="display:flex; flex-direction:column; margin:20px 0;">
                ${log.chats.map((chat) => `
                    <div class="chat-bubble ${chat.role}">${chat.text}</div>
                `).join('')}
            </div>

            <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:20px;">
                <h3 style="font-size:1em; margin-bottom:10px;">✍️ 새 대화 추가</h3>
                <textarea id="geminiIn" placeholder="Gemini 답변" style="width:100%; height:80px; margin-bottom:5px; padding:10px; border:1px solid #ddd; border-radius:5px;"></textarea>
                <textarea id="meIn" placeholder="나의 답변" style="width:100%; height:80px; margin-bottom:10px; padding:10px; border:1px solid #ddd; border-radius:5px;"></textarea>
                <button class="brown-btn" onclick="App.addChat('${date}')" style="width:100%">대화 저장</button>
            </div>

            <div class="sentence-section">
                <h3 style="font-size:1em; margin-bottom:10px;">⭐ 필수 문장 추가</h3>
                <div style="display:flex; gap:5px; margin-bottom:15px;">
                    <input type="text" id="sentenceIn" style="flex:1; padding:10px; border:1px solid #ddd; border-radius:5px;" placeholder="영어 문장 입력">
                    <button class="brown-btn" onclick="App.addSentence('${date}')">추가</button>
                </div>
                <div id="sentenceList">
                    ${log.sentences.map((s, i) => `
                        <div class="sentence-item-card">
                            <div style="flex:1;">
                                <strong style="color:var(--main-brown);">${s.text}</strong><br>
                                <small style="color:#666;">${s.trans}</small>
                            </div>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <button onclick="App.speak('${s.text.replace(/'/g, "\\'")}')" style="background:none; border:none; cursor:pointer; font-size:1.2em;">🔊</button>
                                <button class="delete-btn" onclick="App.delSentence('${date}', ${i})">❌</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <button class="delete-all-btn" onclick="App.deleteFullDate('${date}')">🗑️ ${date} 기록 전체 삭제</button>
        `;
        const area = this.getContentArea();
        area.innerHTML = html;
        area.scrollTop = 0;
    },

    // 3. 필수 문장 모음 페이지
    renderSentencesPage: function() {
        let html = `<h2 style="margin-bottom:20px;">⭐ 필수 문장 모음</h2>`;
        let hasData = false;
        
        for (const date in studyData.logs) {
            studyData.logs[date].sentences.forEach((s) => {
                hasData = true;
                html += `
                    <div class="sentence-item-card">
                        <div style="flex:1;">
                            <strong style="color:var(--main-brown);">${s.text}</strong>
                            <p style="font-size:0.9em; color:#666; margin-top:3px;">${s.trans}</p>
                        </div>
                        <button class="brown-btn" onclick="App.speak('${s.text.replace(/'/g, "\\'")}')" style="padding:5px 10px;">🔊</button>
                    </div>`;
            });
        }
        
        if(!hasData) html += `<p style="text-align:center; color:#999; margin-top:50px;">저장된 문장이 없습니다.</p>`;
        
        const area = this.getContentArea();
        area.innerHTML = html;
        area.scrollTop = 0;
    },

    // 4. 랜덤 테스트 페이지
    renderTestPage: function(s) {
        this.getContentArea().innerHTML = `
            <div style="text-align:center;">
                <h2 style="margin-bottom:20px;">🎲 랜덤 테스트</h2>
                <div style="background:var(--light-yellow); padding:30px; border:1px solid #ffe58f; border-radius:15px; max-width:500px; margin:0 auto;">
                    <p style="color:#666; margin-bottom:10px;">이 문장은 무슨 뜻일까요?</p>
                    <h2 style="margin:20px 0; color:var(--main-brown); font-size:1.5em; word-break:keep-all;">${s.text}</h2>
                    <input type="text" id="testInput" style="width:100%; padding:12px; text-align:center; border:1px solid #ddd; border-radius:8px; font-size:1.1em;" placeholder="뜻을 입력하세요" onkeypress="if(event.keyCode==13) App.checkAnswer()">
                    <div id="testResult" style="min-height:30px; margin-top:15px; font-weight:bold;"></div>
                    <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
                        <button class="brown-btn" onclick="App.checkAnswer()" style="flex:1;">정답 확인</button>
                        <button class="brown-btn" onclick="App.startRandomTest()" style="flex:1; background:#666;">다음 문제</button>
                    </div>
                </div>
            </div>`;
    }
};
