const DataManager = {
    // 서버 전체 데이터 로드
    async loadAllData() {
        try {
            const snapshot = await db.ref('/').once('value');
            const data = snapshot.val();
            return {
                records: data?.records || [],
                sentences: data?.sentences || []
            };
        } catch (e) {
            console.error("Firebase 로드 에러:", e);
            return { records: [], sentences: [] };
        }
    },

    // 공부 기록 저장
    async saveRecords(records) {
        await db.ref('records').set(records);
    },

    // 필수 문장 저장
    async saveSentences(sentences) {
        await db.ref('sentences').set(sentences);
    }
};
