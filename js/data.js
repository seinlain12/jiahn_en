const DataManager = {
    // 모든 데이터 가져오기 (초기 로딩용)
    async getAllData() {
        try {
            const snapshot = await db.ref('/').once('value');
            return snapshot.val() || { records: [], sentences: [] };
        } catch (e) {
            console.error("데이터 로드 실패:", e);
            return { records: [], sentences: [] };
        }
    },

    // 공부 기록 업데이트
    async saveRecords(records) {
        await db.ref('records').set(records);
    },

    // 필수 문장 업데이트
    async saveSentences(sentences) {
        await db.ref('sentences').set(sentences);
    }
};
