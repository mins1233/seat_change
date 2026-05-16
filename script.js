document.addEventListener('DOMContentLoaded', () => {
    const studentListArea = document.getElementById('studentList');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const seatsGrid = document.getElementById('seatsGrid');

    // 초기 데이터 세팅 (30명 예시)
    let defaultList = [];
    for (let i = 1; i <= 30; i++) defaultList.push(i + "번 학생");
    studentListArea.value = defaultList.join('\n');

    // 초기 빈 그리드 생성
    function initGrid() {
        seatsGrid.innerHTML = '';
        for (let i = 0; i < 30; i++) {
            const seat = document.createElement('div');
            seat.classList.add('seat', 'empty');
            seat.textContent = '-';
            seatsGrid.appendChild(seat);
        }
    }

    // Fisher-Yates 셔플 알고리즘
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    shuffleBtn.addEventListener('click', () => {
        const rawNames = studentListArea.value.trim().split('\n').filter(name => name.trim() !== '');
        let students = [...rawNames];

        if (students.length === 0) {
            alert('명단을 입력해주세요.');
            return;
        }

        // 30명보다 적으면 공석으로 채움
        while (students.length < 30) {
            students.push('공석');
        }

        // 30명보다 많으면 자름
        if (students.length > 30) {
            students = students.slice(0, 30);
        }

        const shuffled = shuffleArray(students);

        // 화면 갱신
        seatsGrid.innerHTML = '';
        shuffled.forEach((name, index) => {
            const seat = document.createElement('div');
            seat.classList.add('seat');
            
            if (name === '공석') {
                seat.classList.add('empty');
                seat.textContent = '';
            } else {
                seat.textContent = name;
            }

            // 애니메이션 효과를 위한 초기화
            seat.style.opacity = '0';
            seat.style.transform = 'translateY(20px)';
            seatsGrid.appendChild(seat);

            // 시간차를 두고 등장
            setTimeout(() => {
                seat.style.opacity = '1';
                seat.style.transform = 'translateY(0)';
            }, index * 30);
        });
    });

    initGrid();
});
