document.addEventListener('DOMContentLoaded', () => {
    // 1. 필요한 요소들 가져오기
    const colInput = document.getElementById('colCount');
    const rowInput = document.getElementById('rowCount');
    const studentListArea = document.getElementById('studentList');
    const fixedListArea = document.getElementById('fixedList');
    const separatedListArea = document.getElementById('separatedList');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const seatsGrid = document.getElementById('seatsGrid');

    // 초기 학생 데이터 (30명)
    let defaultList = [];
    for (let i = 1; i <= 30; i++) defaultList.push(i + "번 학생");
    studentListArea.value = defaultList.join('\n');

    // 2. 그리드 렌더링 함수 (빈 교실 그리기)
    function renderGrid(board, cols, rows) {
        seatsGrid.innerHTML = '';
        // CSS Grid 가로열 동적 설정
        seatsGrid.style.gridTemplateColumns = `repeat(${cols}, 100px)`;

        board.forEach((name, index) => {
            const seat = document.createElement('div');
            seat.classList.add('seat');
            
            // 분단 띄우기: 2명씩 짝지어 앉도록 (짝수 열 뒤에 마진 추가, 마지막 열 제외)
            let currentColumn = index % cols;
            if ((currentColumn + 1) % 2 === 0 && (currentColumn + 1) !== cols) {
                seat.style.marginRight = '30px';
            }

            if (name === null || name === '공석') {
                seat.classList.add('empty');
                seat.textContent = name === '공석' ? '공석' : '-';
            } else {
                seat.textContent = name;
            }

            // 고정석 표시 (데이터에 'fixed_' 접두사가 붙어있으면 빨간색 강조)
            if (name && name.startsWith('fixed_')) {
                seat.classList.add('fixed-seat');
                seat.textContent = name.replace('fixed_', '');
            }

            // 등장 애니메이션
            seat.style.opacity = '0';
            seat.style.transform = 'translateY(15px)';
            seatsGrid.appendChild(seat);

            setTimeout(() => {
                seat.style.opacity = '1';
                seat.style.transform = 'translateY(0)';
            }, index * 20);
        });
    }

    // 배열 섞기 함수
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 띄어 앉기 조건 검사 함수 (2칸 이상 떨어져야 함)
    function checkSeparation(board, cols, pairs) {
        for (let pair of pairs) {
            let idx1 = board.findIndex(name => name === pair[0] || name === `fixed_${pair[0]}`);
            let idx2 = board.findIndex(name => name === pair[1] || name === `fixed_${pair[1]}`);
            
            // 두 학생이 모두 자리에 있는 경우에만 검사
            if (idx1 !== -1 && idx2 !== -1) {
                let r1 = Math.floor(idx1 / cols);
                let c1 = idx1 % cols;
                let r2 = Math.floor(idx2 / cols);
                let c2 = idx2 % cols;
                
                // 가로 차이와 세로 차이가 모두 2 미만이면 실패 (너무 가까움)
                if (Math.abs(r1 - r2) < 2 && Math.abs(c1 - c2) < 2) {
                    return false;
                }
            }
        }
        return true;
    }

    // 메인 로직: 버튼 클릭 시
    shuffleBtn.addEventListener('click', () => {
        let cols = parseInt(colInput.value);
        let rows = parseInt(rowInput.value);
        let totalSeats = cols * rows;

        // 학생 명단 정리
        const rawNames = studentListArea.value.trim().split('\n').map(n => n.trim()).filter(n => n !== '');
        let students = [...rawNames];

        if (students.length === 0) {
            alert('명단을 입력해주세요.'); return;
        }
        if (students.length > totalSeats) {
            alert(`자리가 부족합니다! 학생은 ${students.length}명인데 자리는 ${totalSeats}석입니다. 열과 행을 늘려주세요.`); return;
        }

        // 고정석 파싱
        let fixedMap = {}; // index 위치 -> 학생 이름
        const fixedInput = fixedListArea.value.trim().split('\n');
        for (let line of fixedInput) {
            if (!line.trim()) continue;
            let parts = line.split(',').map(s => s.trim());
            if (parts.length >= 3) {
                let name = parts[0];
                let r = parseInt(parts[1]) - 1; // 1행 -> index 0
                let c = parseInt(parts[2]) - 1; // 1열 -> index 0
                
                if (r >= 0 && r < rows && c >= 0 && c < cols) {
                    let seatIndex = (r * cols) + c;
                    fixedMap[seatIndex] = name;
                    // 고정된 학생은 섞기 명단에서 제외
                    students = students.filter(s => s !== name);
                }
            }
        }

        // 공석 채우기
        while (students.length + Object.keys(fixedMap).length < totalSeats) {
            students.push('공석');
        }

        // 띄어 앉기 파싱
        let separatedPairs = [];
        const sepInput = separatedListArea.value.trim().split('\n');
        for (let line of sepInput) {
            if (!line.trim()) continue;
            let parts = line.split(',').map(s => s.trim());
            if (parts.length >= 2) {
                separatedPairs.push([parts[0], parts[1]]);
            }
        }

        // 배치 알고리즘 실행 (조건에 맞을 때까지 최대 5000번 재시도)
        let success = false;
        let finalBoard = [];
        const MAX_RETRIES = 5000;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            let board = new Array(totalSeats).fill(null);
            
            // 1. 고정석 배치 (fixed_ 태그를 붙여 추후 강조 처리)
            for (let idx in fixedMap) {
                board[idx] = `fixed_${fixedMap[idx]}`;
            }

            // 2. 남은 학생 섞기
            let shuffled = shuffleArray([...students]);
            
            // 3. 빈 자리에 채우기
            let sIdx = 0;
            for (let b = 0; b < totalSeats; b++) {
                if (board[b] === null) {
                    board[b] = shuffled[sIdx++];
                }
            }

            // 4. 조건 검사
            if (checkSeparation(board, cols, separatedPairs)) {
                finalBoard = board;
                success = true;
                break; // 조건 만족 시 반복 종료
            }
        }

        // 결과 출력
        if (success) {
            renderGrid(finalBoard, cols, rows);
        } else {
            alert('설정하신 조건(띄어 앉기 등)이 너무 까다로워 배치할 수 없습니다. 조건을 조금 완화해 주세요!');
        }
    });

    // 최초 로딩 시 빈 화면 그려주기
    renderGrid(new Array(30).fill(null), 6, 5);
});
