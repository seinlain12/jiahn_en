// 로컬 스토리지 데이터 로드
const savedData = localStorage.getItem('studyHubData');

// 데이터가 없으면 초기 기본값 생성
let studyData = savedData ? JSON.parse(savedData) : {
    logs: {
        "260101": {
            chats: [],
            sentences: []
        }
    }
};

// 데이터 저장 함수
function saveToStorage() {
    localStorage.setItem('studyHubData', JSON.stringify(studyData));
}
