document.addEventListener('DOMContentLoaded', () => {
    const studentListArea = document.getElementById('studentList');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const seatsGrid = document.getElementById('seatsGrid');

    // 앱 실행 시 1번부터 30번까지 기본값 채워두기
    let initialStudents = [];
    for (let i = 1; i <= 30; i++) {
        initialStudents.push(`${i}번`);
    }
    studentListArea.value = initialStudents.join('\n');

    // 자리배치 전 기본 회색 빈 자리 만들기
    function createEmptySeats() {
        seatsGrid.innerHTML = '';
        for (let i = 0; i < 30; i++) {
            const seat = document.createElement('div');
            seat.classList.add('seat', 'empty');
            seat.textContent = '?';
            seatsGrid.appendChild(seat);
        }
    }

    // 배열을 랜덤으로 섞는 함수 (Fisher-Yates 알고리즘)
    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // 자리 뽑기 버튼 클릭 시 이벤트
    shuffleBtn.addEventListener('click', () => {
        const text = studentListArea.value.trim();
        if (!text) {
            alert('학생 명단을 입력해주세요!');
            return;
        }

        // 줄바꿈 기준으로 학생 목록 배열 생성 (빈 줄 제외)
        let students = text.split('\n').map(s => s.trim()).filter(s => s !== '');
        
        if (students.length > 30) {
            alert(`현재 ${students.length}명입니다. 명단은 30명 이하로 맞춰주세요.`);
            return;
        }

        // 30석을 채우기 위해 학생 수가 부족하면 '공석' 추가
        while (students.length < 30) {
            students.push('공석');
        }

        // 명단 섞기
        const shuffled = shuffle(students);

        // 화면에 자리 배치
        seatsGrid.innerHTML = '';
        shuffled.forEach((student, index) => {
            const seat = document.createElement('div');
            seat.classList.add('seat');
            
            if (student === '공석') {
                seat.classList.add('empty');
            }
            
            seat.textContent = student;
            
            // 자리가 하나씩 나타나는 애니메이션 효과
            seat.style.opacity = '0';
            seat.style.transform = 'scale(0.8)';
            seat.style.transition = 'all 0.4s ease';
            seatsGrid.appendChild(seat);
            
            setTimeout(() => {
                seat.style.opacity = '1';
                seat.style.transform = 'scale(1)';
            }, index * 50); // 순차적으로 나타나게 딜레이 부여
        });
    });

    // 최초 로딩 시 빈 자리 세팅
    createEmptySeats();
});
