document.addEventListener('DOMContentLoaded', () => {
    console.log('GIF 분할기 초기화됨');
    
    // 요소 참조
    const gifUpload = document.getElementById('gif-upload');
    const previewImg = document.getElementById('preview-img');
    const splitBtn = document.getElementById('split-btn');
    const splitContainer = document.getElementById('split-container');
    const downloadAllBtn = document.getElementById('download-all');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resetFileBtn = document.getElementById('reset-file');
    const splitControls = document.getElementById('split-controls');
    
    // 분할 컨트롤 요소 참조
    const horizontalLinesInput = document.getElementById('horizontal-lines');
    const verticalLinesInput = document.getElementById('vertical-lines');
    const linePositions = document.getElementById('line-positions');
    const previewOverlay = document.getElementById('preview-overlay');
    
    // gifshot 라이브러리 로드 확인
    let gifshotAvailable = typeof gifshot !== 'undefined';
    console.log('Gifshot 라이브러리 사용 가능:', gifshotAvailable);
    
    // gifshot이 없는 경우 스크립트 동적 로드 시도
    if (!gifshotAvailable) {
        console.log('Gifshot 라이브러리 로드 시도...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gifshot/0.4.5/gifshot.min.js';
        script.onload = function() {
            console.log('Gifshot 라이브러리 로드 완료!');
            gifshotAvailable = typeof gifshot !== 'undefined';
            console.log('Gifshot 라이브러리 사용 가능 (동적 로드):', gifshotAvailable);
            
            // 현재 분할 작업이 진행 중이고 원본 파일이 있으면 애니메이션 GIF 처리 자동 시작
            if (currentFile && splitContainer.style.display === 'block') {
                console.log('Gifshot 라이브러리 로드 후 애니메이션 GIF 처리 자동 시작');
                try {
                    processGifWithAnimation(currentFile);
                } catch (e) {
                    console.error('자동 애니메이션 처리 실패:', e);
                }
            }
        };
        script.onerror = function() {
            console.error('Gifshot 라이브러리 로드 실패!');
        };
        document.head.appendChild(script);
    }
    
    // 모든 요소가 제대로 참조되었는지 확인
    console.log('분할 버튼 참조:', splitBtn);
    
    // 캔버스와 다운로드 링크 참조
    const canvases = [
        document.getElementById('canvas1'),
        document.getElementById('canvas2'),
        document.getElementById('canvas3'),
        document.getElementById('canvas4')
    ];
    
    // 다운로드 링크 참조 (UI에서 제거됨)
    const downloadLinks = [
        { href: '#', download: 'part1.gif' },
        { href: '#', download: 'part2.gif' },
        { href: '#', download: 'part3.gif' },
        { href: '#', download: 'part4.gif' }
    ];
    
    // GIF 관련 변수
    let originalWidth = 0;
    let originalHeight = 0;
    let frameDelay = 100; // 기본 프레임 지연 시간
    let currentFile = null; // 현재 업로드된 파일 저장
    let gifInstance = null; // libgif-js SuperGif 인스턴스
    let frames = []; // 모든 프레임 저장
    
    // 처리된 GIF 데이터 저장
    let processedGifs = [];
    
    // 분할된 GIF 미리보기 이미지 관리를 위한 배열
    let previewGifs = [null, null, null, null];
    
    // 분할선 관련 변수
    let horizontalLines = 1; // 가로 분할선 수 (기본값: 1개)
    let verticalLines = 1;   // 세로 분할선 수 (기본값: 1개)
    let hLinePositions = [50]; // 가로 분할선 위치 (기본값: 중간 50%)
    let vLinePositions = [50]; // 세로 분할선 위치 (기본값: 중간 50%)
    
    // 이벤트 리스너 설정
    gifUpload.addEventListener('change', handleFileUpload);
    splitBtn.addEventListener('click', function(e) {
        console.log('분할 버튼 클릭됨');
        handleSplitButtonClick();
    });
    downloadAllBtn.addEventListener('click', handleDownloadAll);
    resetFileBtn.addEventListener('click', resetVideoState);
    
    // 분할선 컨트롤 이벤트 설정
    document.querySelectorAll('.number-input .minus-btn').forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const minValue = parseInt(input.getAttribute('min'));
            let value = parseInt(input.value);
            
            if (value > minValue) {
                value--;
                input.value = value;
                
                if (index === 0) { // 가로 분할선
                    updateHorizontalLines(value);
                } else { // 세로 분할선
                    updateVerticalLines(value);
                }
            }
        });
    });
    
    document.querySelectorAll('.number-input .plus-btn').forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const maxValue = parseInt(input.getAttribute('max'));
            let value = parseInt(input.value);
            
            if (value < maxValue) {
                value++;
                input.value = value;
                
                if (index === 0) { // 가로 분할선
                    updateHorizontalLines(value);
                } else { // 세로 분할선
                    updateVerticalLines(value);
                }
            }
        });
    });
    
    // 가로 분할선 업데이트
    function updateHorizontalLines(count) {
        horizontalLines = count;
        
        // 위치 배열 업데이트
        if (count > hLinePositions.length) {
            // 새 분할선 추가
            while (hLinePositions.length < count) {
                const pos = Math.round(100 / (hLinePositions.length + 1));
                hLinePositions.push(pos);
            }
        } else if (count < hLinePositions.length) {
            // 분할선 제거
            hLinePositions = hLinePositions.slice(0, count);
        }
        
        // 분할선 위치 조정 슬라이더 업데이트
        updateLineControls();
        
        // 미리보기 업데이트
        updateSplitPreview();
    }
    
    // 세로 분할선 업데이트
    function updateVerticalLines(count) {
        verticalLines = count;
        
        // 위치 배열 업데이트
        if (count > vLinePositions.length) {
            // 새 분할선 추가
            while (vLinePositions.length < count) {
                const pos = Math.round(100 / (vLinePositions.length + 1));
                vLinePositions.push(pos);
            }
        } else if (count < vLinePositions.length) {
            // 분할선 제거
            vLinePositions = vLinePositions.slice(0, count);
        }
        
        // 분할선 위치 조정 슬라이더 업데이트
        updateLineControls();
        
        // 미리보기 업데이트
        updateSplitPreview();
    }
    
    // 분할선 위치 조정 컨트롤 업데이트
    function updateLineControls() {
        // 기존 컨트롤 요소 제거
        linePositions.innerHTML = '';
        
        // 가로 분할선 컨트롤 추가
        for (let i = 0; i < horizontalLines; i++) {
            const controlId = `h-line-${i}`;
            const control = document.createElement('div');
            control.className = 'line-position-control';
            control.innerHTML = `
                <label for="${controlId}">가로선 ${i+1} 위치: ${hLinePositions[i]}%</label>
                <input type="range" id="${controlId}" min="5" max="95" value="${hLinePositions[i]}" 
                    data-index="${i}" data-type="horizontal">
                <div class="range-value">${hLinePositions[i]}%</div>
            `;
            linePositions.appendChild(control);
            
            // 이벤트 리스너 추가
            const rangeInput = control.querySelector('input[type="range"]');
            rangeInput.addEventListener('input', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const type = this.getAttribute('data-type');
                const value = parseInt(this.value);
                
                // 레이블 업데이트
                this.previousElementSibling.innerText = `가로선 ${index+1} 위치: ${value}%`;
                this.nextElementSibling.innerText = `${value}%`;
                
                // 값 업데이트
                hLinePositions[index] = value;
                
                // 미리보기 업데이트
                updateSplitPreview();
            });
        }
        
        // 세로 분할선 컨트롤 추가
        for (let i = 0; i < verticalLines; i++) {
            const controlId = `v-line-${i}`;
            const control = document.createElement('div');
            control.className = 'line-position-control';
            control.innerHTML = `
                <label for="${controlId}">세로선 ${i+1} 위치: ${vLinePositions[i]}%</label>
                <input type="range" id="${controlId}" min="5" max="95" value="${vLinePositions[i]}" 
                    data-index="${i}" data-type="vertical">
                <div class="range-value">${vLinePositions[i]}%</div>
            `;
            linePositions.appendChild(control);
            
            // 이벤트 리스너 추가
            const rangeInput = control.querySelector('input[type="range"]');
            rangeInput.addEventListener('input', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const type = this.getAttribute('data-type');
                const value = parseInt(this.value);
                
                // 레이블 업데이트
                this.previousElementSibling.innerText = `세로선 ${index+1} 위치: ${value}%`;
                this.nextElementSibling.innerText = `${value}%`;
                
                // 값 업데이트
                vLinePositions[index] = value;
                
                // 미리보기 업데이트
                updateSplitPreview();
            });
        }
    }
    
    // 분할 미리보기 업데이트
    function updateSplitPreview() {
        // 기존 분할선 제거
        previewOverlay.innerHTML = '';
        
        // 이미지 크기 확인
        const rect = previewImg.getBoundingClientRect();
        previewOverlay.style.width = rect.width + 'px';
        previewOverlay.style.height = rect.height + 'px';
        
        // 가로 분할선 추가
        for (let i = 0; i < horizontalLines; i++) {
            const line = document.createElement('div');
            line.className = 'split-line horizontal';
            line.style.top = `${hLinePositions[i]}%`;
            previewOverlay.appendChild(line);
        }
        
        // 세로 분할선 추가
        for (let i = 0; i < verticalLines; i++) {
            const line = document.createElement('div');
            line.className = 'split-line vertical';
            line.style.left = `${vLinePositions[i]}%`;
            previewOverlay.appendChild(line);
        }
        
        // 분할 버튼 텍스트 업데이트
        const totalParts = (horizontalLines + 1) * (verticalLines + 1);
        splitBtn.innerText = `${totalParts}등분 분할하기`;
    }
    
    // 파일 업로드 처리 함수
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            resetVideoState();
            return;
        }
        
        console.log('파일 업로드됨:', file.name);
        
        if (!file.type.includes('gif')) {
            alert('GIF 파일만 업로드 가능합니다.');
            resetVideoState();
            return;
        }
        
        // 현재 파일 저장
        currentFile = file;
        
        // SuperGif 인스턴스 초기화
        if (gifInstance) {
            gifInstance = null;
        }
        
        // 분할 버튼 비활성화 (로딩 중)
        splitBtn.disabled = true;
        splitBtn.style.display = 'none';
        
        // 파일 취소 버튼 표시
        resetFileBtn.style.display = 'inline-block';
        
        // 분할 결과 숨기기
        splitContainer.style.display = 'none';
        
        // 원본 미리보기 표시
        const fileUrl = URL.createObjectURL(file);
        previewImg.setAttribute('rel:animated_src', fileUrl);
        previewImg.setAttribute('src', fileUrl);
        previewImg.style.display = 'block';
        
        // 미리보기가 없다는 텍스트 숨기기
        const noPreviewText = document.querySelector('.no-preview');
        if (noPreviewText) {
            noPreviewText.style.display = 'none';
        }
        
        // 지연 시간을 두어 이미지가 DOM에 추가된 후 SuperGif 인스턴스 생성
        setTimeout(() => {
            try {
                // SuperGif 인스턴스 생성
                gifInstance = new SuperGif({ 
                    gif: previewImg,
                    auto_play: true  // 자동 재생 활성화
                });
                
                // GIF 로드
                gifInstance.load(() => {
                    console.log('GIF 로드 완료');
                    
                    // GIF 크기 가져오기
                    originalWidth = gifInstance.get_canvas().width;
                    originalHeight = gifInstance.get_canvas().height;
                    
                    console.log(`GIF 크기: ${originalWidth}x${originalHeight}, 프레임 수: ${gifInstance.get_length()}`);
                    
                    // 분할 버튼 활성화
                    splitBtn.disabled = false;
                    splitBtn.style.display = 'block';
                    console.log('분할 버튼 활성화됨:', splitBtn.disabled, splitBtn.style.display);
                    
                    // 분할 결과 숨기기
                    splitContainer.style.display = 'none';
                    
                    // 분할 설정 컨트롤 표시
                    splitControls.style.display = 'block';
                    
                    // 분할선 설정 초기화
                    horizontalLinesInput.value = '1';
                    verticalLinesInput.value = '1';
                    horizontalLines = 1;
                    verticalLines = 1;
                    hLinePositions = [50];
                    vLinePositions = [50];
                    
                    // 분할선 컨트롤 및 미리보기 업데이트
                    updateLineControls();
                    updateSplitPreview();
                    
                    // 기존 분할 이미지가 있으면 제거
                    clearPreviousGifs();
                });
            } catch (error) {
                console.error('GIF 로드 중 오류 발생:', error);
                alert('GIF 로드 중 오류가 발생했습니다. 다른 GIF 파일을 시도해보세요.');
                currentFile = null;
            }
        }, 100);
    }
    
    // 기존 분할 GIF 이미지 제거 함수
    function clearPreviousGifs() {
        for (let i = 0; i < 4; i++) {
            if (previewGifs[i]) {
                const parentDiv = canvases[i].parentNode;
                parentDiv.removeChild(previewGifs[i]);
                previewGifs[i] = null;
            }
        }
    }
    
    // 상태 초기화 함수 추가
    function resetVideoState() {
        // 현재 파일 초기화
        currentFile = null;
        
        // 원본 이미지 초기화
        previewImg.removeAttribute('rel:animated_src');
        previewImg.removeAttribute('src');
        previewImg.style.display = 'none';
        
        // 미리보기가 없다는 텍스트 표시
        const noPreviewText = document.querySelector('.no-preview');
        if (noPreviewText) {
            noPreviewText.style.display = 'block';
        }
        
        // 분할 결과 숨기기
        splitContainer.style.display = 'none';
        
        // 분할 설정 컨트롤 숨기기
        splitControls.style.display = 'none';
        
        // 분할 버튼 비활성화
        splitBtn.disabled = true;
        splitBtn.style.display = 'none';
        
        // 파일 취소 버튼 숨기기
        resetFileBtn.style.display = 'none';
        
        // 파일 입력 필드 초기화
        gifUpload.value = '';
        
        // 기존 분할 이미지 제거
        clearPreviousGifs();
        
        // 처리된 GIF 초기화
        processedGifs = [];
        
        // 로딩 인디케이터 숨기기
        loadingIndicator.style.display = 'none';
    }
    
    // 분할 버튼 클릭 처리 함수
    function handleSplitButtonClick() {
        console.log('분할 버튼 클릭 처리 시작');
        console.log('currentFile 상태:', currentFile ? '파일 있음' : '파일 없음');
        console.log('gifInstance 상태:', gifInstance ? 'GIF 로드됨' : 'GIF 로드 안됨');
        
        if (!currentFile) {
            alert('먼저 GIF 파일을 업로드해주세요.');
            return;
        }
        
        // 버튼 비활성화 (중복 클릭 방지)
        splitBtn.disabled = true;
        splitBtn.style.display = 'none';
        
        // 분할 설정 컨트롤 숨기기
        splitControls.style.display = 'none';
        
        // 로딩 인디케이터 표시
        loadingIndicator.style.display = 'block';
        
        // 기존 분할 이미지가 있으면 제거
        clearPreviousGifs();
        
        // 그리드 컨테이너 비우기
        const gridContainer = document.querySelector('.grid-container');
        gridContainer.innerHTML = '';
        
        // 분할 영역 동적 생성
        const totalRows = horizontalLines + 1;
        const totalCols = verticalLines + 1;
        const totalParts = totalRows * totalCols;
        
        // 그리드 스타일 설정
        gridContainer.style.gridTemplateColumns = `repeat(${totalCols}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${totalRows}, 1fr)`;
        
        // 캔버스와 다운로드 링크 참조 배열 초기화
        const canvases = [];
        
        // 각 영역에 캔버스 생성
        for (let i = 0; i < totalParts; i++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.id = `part${i+1}`;
            
            const canvas = document.createElement('canvas');
            canvas.id = `canvas${i+1}`;
            gridItem.appendChild(canvas);
            
            gridContainer.appendChild(gridItem);
            canvases.push(canvas);
        }
        
        // 타임아웃 설정 (30초 후 자동 취소, 시간 단축)
        const timeoutId = setTimeout(() => {
            loadingIndicator.style.display = 'none';
            splitBtn.disabled = false;
            splitBtn.style.display = 'block';
            splitControls.style.display = 'block';
            alert('분할 작업이 너무 오래 걸립니다. GIF 파일 크기가 너무 큰 경우 분할이 어려울 수 있습니다.');
        }, 30000);
        
        // 즉시 기본 정적 이미지 분할 처리 시작
        try {
            // 원본 이미지의 크기가 있는지 확인
            if (originalWidth === 0 || originalHeight === 0) {
                // 원본 이미지가 로드되지 않은 경우 크기 추정
                const img = new Image();
                img.onload = function() {
                    originalWidth = img.width;
                    originalHeight = img.height;
                    console.log(`GIF 크기 추정: ${originalWidth}x${originalHeight}`);
                    
                    // 간단한 정적 이미지 분할 시작
                    processSimpleSplit(currentFile, timeoutId, totalRows, totalCols);
                    
                    // 애니메이션 GIF 처리 시작 (별도로 진행)
                    processGifWithAnimation(currentFile);
                };
                img.onerror = function() {
                    clearTimeout(timeoutId);
                    loadingIndicator.style.display = 'none';
                    splitBtn.disabled = false;
                    splitBtn.style.display = 'block';
                    splitControls.style.display = 'block';
                    alert('이미지 로드 중 오류가 발생했습니다.');
                };
                img.src = URL.createObjectURL(currentFile);
            } else {
                // 크기를 알고 있는 경우 직접 분할 시작
                processSimpleSplit(currentFile, timeoutId, totalRows, totalCols);
                
                // 애니메이션 GIF 처리 시작 (별도로 진행)
                processGifWithAnimation(currentFile);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('GIF 처리 중 오류 발생:', error);
            loadingIndicator.style.display = 'none';
            splitBtn.disabled = false;
            splitBtn.style.display = 'block';
            splitControls.style.display = 'block';
            alert('GIF 처리 중 오류가 발생했습니다: ' + error.message);
        }
    }
    
    // 간단한 이미지 분할 처리 함수 (업데이트)
    function processSimpleSplit(file, timeoutId, rows, cols) {
        console.log('간단한 이미지 분할 시작...');
        console.log(`분할 설정: ${rows}행 x ${cols}열`);
        
        // 분할 영역의 위치 계산
        const parts = [];
        let partIndex = 0;
        
        // 분할선 위치를 퍼센트에서 픽셀로 변환
        const hPixelPositions = [0, ...hLinePositions.map(p => Math.round(originalHeight * p / 100)), originalHeight];
        const vPixelPositions = [0, ...vLinePositions.map(p => Math.round(originalWidth * p / 100)), originalWidth];
        
        // 각 영역의 좌표와 크기 계산
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                parts.push({
                    x: vPixelPositions[c],
                    y: hPixelPositions[r],
                    width: vPixelPositions[c+1] - vPixelPositions[c],
                    height: hPixelPositions[r+1] - hPixelPositions[r],
                    index: partIndex++
                });
            }
        }
        
        let completedParts = 0;
        const totalParts = parts.length;
        
        // 이미지 객체 생성 및 로드
        const sourceImg = new Image();
        sourceImg.onload = function() {
            // 각 부분별로 분할
            for (let i = 0; i < totalParts; i++) {
                const part = parts[i];
                
                // 캔버스 설정
                const canvas = document.getElementById(`canvas${i+1}`);
                if (!canvas) {
                    console.error(`캔버스 요소를 찾을 수 없음: canvas${i+1}`);
                    continue;
                }
                
                canvas.width = part.width;
                canvas.height = part.height;
                const ctx = canvas.getContext('2d');
                
                // 이미지 그리기
                ctx.drawImage(
                    sourceImg, 
                    part.x, part.y, part.width, part.height, 
                    0, 0, part.width, part.height
                );
                
                // 임시로 캔버스 이미지 URL로 변환 (다운로드 링크는 나중에 애니메이션 GIF로 대체)
                const tempImageUrl = canvas.toDataURL('image/png');
                
                // 임시 이미지를 미리보기로 표시
                const previewImg = document.createElement('img');
                previewImg.src = tempImageUrl;
                previewImg.style.width = '100%';
                previewImg.style.height = 'auto';
                previewImg.style.display = 'block';
                previewImg.style.marginBottom = '0';
                
                // 미리보기 이미지 추가
                const parentDiv = canvas.parentNode;
                parentDiv.insertBefore(previewImg, canvas.nextSibling);
                
                // 캔버스 숨기기
                canvas.style.display = 'none';
                
                // 미리보기 이미지 저장
                previewGifs[i] = previewImg;
                
                // 모든 처리 완료 확인
                completedParts++;
                
                if (completedParts >= totalParts) {
                    console.log('모든 영역 분할 완료');
                    
                    // 분할 결과 표시
                    splitContainer.style.display = 'block';
                    
                    // 타임아웃 취소
                    clearTimeout(timeoutId);
                }
            }
        };
        
        sourceImg.onerror = function() {
            console.error('이미지 로드 오류');
            clearTimeout(timeoutId);
            loadingIndicator.style.display = 'none';
            splitBtn.disabled = false;
            splitBtn.style.display = 'block';
            splitControls.style.display = 'block';
            alert('이미지를 로드할 수 없습니다.');
        };
        
        sourceImg.src = URL.createObjectURL(file);
    }
    
    // 애니메이션이 있는 GIF 처리 함수
    function processGifWithAnimation(file) {
        console.log('애니메이션 GIF 분할 시작...');
        
        // 전체 부분 수 계산
        const totalRows = horizontalLines + 1;
        const totalCols = verticalLines + 1;
        const totalParts = totalRows * totalCols;
        
        // gifshot 라이브러리 확인 및 로드 시도
        if (typeof gifshot === 'undefined') {
            console.log('Gifshot 미로드 상태에서 processGifWithAnimation 호출됨');
            
            // 글로벌 context에서 loadGifshot 함수가 있는지 확인
            if (typeof window.loadGifshot === 'function') {
                console.log('loadGifshot 함수를 사용하여 라이브러리 로드 시도');
                
                window.loadGifshot()
                    .then(() => {
                        console.log('Gifshot 로드 성공, 애니메이션 GIF 처리 계속');
                        setTimeout(() => {
                            processGifWithAnimation(file);
                        }, 500);
                    })
                    .catch(error => {
                        console.error('Gifshot 로드 실패, 대체 방법 사용:', error);
                        processWithGifJs(file);
                    });
            } else {
                console.log('loadGifshot 함수 없음, gif.js 사용 시도');
                processWithGifJs(file);
            }
            return;
        }
        
        // 여기서부터는 gifshot이 로드된 경우의 처리
        // 기본 정보 설정
        const fileURL = URL.createObjectURL(file);
        
        // 분할선 위치를 퍼센트에서 픽셀로 변환
        const hPixelPositions = [0, ...hLinePositions.map(p => Math.round(originalHeight * p / 100)), originalHeight];
        const vPixelPositions = [0, ...vLinePositions.map(p => Math.round(originalWidth * p / 100)), originalWidth];
        
        // 각 영역의 좌표와 크기 계산
        const parts = [];
        let partIndex = 0;
        
        for (let r = 0; r < totalRows; r++) {
            for (let c = 0; c < totalCols; c++) {
                parts.push({
                    x: vPixelPositions[c],
                    y: hPixelPositions[r],
                    width: vPixelPositions[c+1] - vPixelPositions[c],
                    height: hPixelPositions[r+1] - hPixelPositions[r],
                    name: `${r+1}-${c+1}`,
                    index: partIndex++
                });
            }
        }
        
        // SuperGif을 통한 이미지 시퀀스 방식으로 처리
        const tempImg = new Image();
        tempImg.onload = function() {
            console.log('프레임 추출을 위한 임시 이미지 로드 완료');
            
            try {
                // GIF 분석 시작
                const gifAnalyzer = new SuperGif({ 
                    gif: tempImg,
                    auto_play: false
                });
                
                gifAnalyzer.load(function() {
                    console.log('GIF 분석 로드 완료!');
                    const frameCount = gifAnalyzer.get_length();
                    console.log(`총 프레임 수: ${frameCount}`);
                    
                    if (frameCount <= 1) {
                        console.log('단일 프레임 GIF입니다. 정적 이미지로 처리합니다.');
                        processGIFWithGifshot(null);
                        return;
                    }
                    
                    // 각 부분별로 프레임 수집
                    const partFrames = Array(totalParts).fill().map(() => []); // 분할된 각 부분의 프레임 이미지 배열
                    let frameDelay = 100;
                    
                    try {
                        // 프레임 딜레이 정보 가져오기 (첫 프레임 기준)
                        frameDelay = gifAnalyzer.get_canvas().id_to_animated_gif_control.ext.get_frameDelay() || 100;
                        console.log(`프레임 딜레이: ${frameDelay}ms`);
                    } catch (e) {
                        console.warn('프레임 딜레이 정보를 가져오는 중 오류:', e);
                    }
                    
                    console.log('각 프레임별로 분할 영역 추출 시작...');
                    
                    // 모든 프레임 처리
                    for (let i = 0; i < frameCount; i++) {
                        // 현재 프레임으로 이동
                        gifAnalyzer.move_to(i);
                        
                        // 현재 프레임의 캔버스 가져오기
                        const frameCanvas = gifAnalyzer.get_canvas();
                        
                        // 각 분할 영역별로 이미지 추출
                        for (let j = 0; j < totalParts; j++) {
                            const part = parts[j];
                            
                            // 부분 이미지를 담을 임시 캔버스
                            const tempCanvas = document.createElement('canvas');
                            tempCanvas.width = part.width;
                            tempCanvas.height = part.height;
                            const tempCtx = tempCanvas.getContext('2d');
                            
                            // 원본 프레임에서 부분 이미지 그리기
                            tempCtx.drawImage(
                                frameCanvas, 
                                part.x, part.y, part.width, part.height, 
                                0, 0, part.width, part.height
                            );
                            
                            // 부분 이미지 URL 가져오기
                            const partImageData = tempCanvas.toDataURL('image/png');
                            
                            // 부분 영역의 프레임 배열에 추가
                            partFrames[j].push(partImageData);
                        }
                        
                        // 진행 상황 표시
                        if (i % 5 === 0 || i === frameCount - 1) {
                            console.log(`프레임 처리 중: ${i+1}/${frameCount} (${Math.round((i+1) / frameCount * 100)}%)`);
                            updateProgress(Math.round((i+1) / frameCount * 70)); // 최대 70%까지
                        }
                    }
                    
                    console.log('프레임 추출 완료. GIF 생성 시작...');
                    
                    // 각 부분별로 GIF 생성
                    createGifsFromFrames(partFrames, parts, frameDelay);
                });
            } catch (error) {
                console.error('GIF 분석 중 오류 발생:', error);
                processGIFWithGifshot(null);
            }
        };
        
        tempImg.onerror = function() {
            console.error('GIF 로드 실패');
            processGIFWithGifshot(null);
        };
        
        tempImg.src = fileURL;
    }
    
    // 프레임 시퀀스에서 GIF 생성 함수
    function createGifsFromFrames(partFrames, parts, frameDelay) {
        const totalParts = partFrames.length;
        let completedGifs = 0;
        
        // 진행 상황 표시
        function updateGifProgress(percent) {
            // 70% 기준에서 시작하여 100%로 
            updateProgress(70 + Math.round(percent * 0.3));
        }
        
        console.log(`${totalParts}개의 분할 GIF 생성 시작...`);
        
        // 각 부분별로 GIF 생성 시도
        for (let i = 0; i < totalParts; i++) {
            const part = parts[i];
            
            try {
                // GIF 옵션 설정
                const options = {
                    images: partFrames[i],
                    gifWidth: part.width,
                    gifHeight: part.height,
                    interval: frameDelay / 1000, // 초 단위로 변환
                    numFrames: partFrames[i].length,
                    frameDuration: frameDelay,
                    sampleInterval: 10,
                    progressCallback: function(progress) {
                        console.log(`부분 ${i+1} GIF 생성 진행: ${Math.round(progress * 100)}%`);
                    }
                };
                
                // Gifshot으로 GIF 생성
                gifshot.createGIF(options, function(obj) {
                    if (!obj.error) {
                        console.log(`부분 ${i+1} GIF 생성 완료`);
                        
                        // 프로세스 진행율 업데이트
                        completedGifs++;
                        updateGifProgress(completedGifs / totalParts);
                        
                        // 미리보기 이미지 업데이트
                        if (previewGifs[i]) {
                            previewGifs[i].src = obj.image;
                        }
                        
                        // 처리된 GIF 저장
                        processedGifs[i] = obj.image;
                        
                        // 완료 카운터 증가
                        if (completedGifs >= totalParts) {
                            console.log('모든 GIF 생성 완료!');
                            loadingIndicator.style.display = 'none';
                            splitBtn.disabled = false;
                            splitBtn.style.display = 'block';
                        }
                    } else {
                        console.error('GIF 생성 중 오류:', obj.error);
                        if (completedGifs === 0) {
                            alert('GIF 생성 중 오류가 발생했습니다. 정적 이미지만 제공됩니다.');
                        }
                    }
                });
            } catch (e) {
                console.error(`부분 ${i+1} GIF 생성 실패:`, e);
                completedGifs++;
                
                if (completedGifs >= totalParts) {
                    console.log('모든 GIF 처리 완료 (일부 오류 발생)');
                    loadingIndicator.style.display = 'none';
                    splitBtn.disabled = false;
                    splitBtn.style.display = 'block';
                }
            }
        }
    }
    
    // gif.js 라이브러리를 사용한 대체 처리
    function processWithGifJs(file) {
        console.log('gif.js 라이브러리를 사용한 대체 처리 시작');
        
        // 기본 정보 설정
        const fileURL = URL.createObjectURL(file);
        const quadWidth = Math.floor(originalWidth / 2);
        const quadHeight = Math.floor(originalHeight / 2);
        
        // 각 부분의 좌표
        const parts = [
            { x: 0, y: 0, name: "좌상단" }, // 좌상단
            { x: quadWidth, y: 0, name: "우상단" }, // 우상단
            { x: 0, y: quadHeight, name: "좌하단" }, // 좌하단
            { x: quadWidth, y: quadHeight, name: "우하단" } // 우하단
        ];
        
        try {
            // gif.js가 로드되었는지 확인
            if (typeof GIF === 'undefined') {
                console.error('gif.js 라이브러리를 찾을 수 없습니다. 정적 이미지로 대체합니다.');
                processGIFWithGifshot(null);
                return;
            }
            
            // 각 부분별 GIF 인코더 생성
            const encoders = [];
            for (let i = 0; i < 4; i++) {
                encoders.push(new GIF({
                    workers: 2,
                    quality: 10,
                    width: quadWidth,
                    height: quadHeight,
                    workerScript: 'https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js'
                }));
            }
            
            // 소스 이미지 로드
            const img = new Image();
            img.onload = function() {
                console.log('소스 이미지 로드 완료');
                
                // 캔버스를 통해 원본 GIF 분석
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                const tempCtx = tempCanvas.getContext('2d');
                
                // 이미지 그리기
                tempCtx.drawImage(img, 0, 0);
                
                // 각 부분별 캔버스와 인코더 설정
                for (let i = 0; i < 4; i++) {
                    const part = parts[i];
                    const partCanvas = document.createElement('canvas');
                    partCanvas.width = quadWidth;
                    partCanvas.height = quadHeight;
                    const partCtx = partCanvas.getContext('2d');
                    
                    // 해당 영역 복사
                    partCtx.drawImage(
                        tempCanvas, 
                        part.x, part.y, quadWidth, quadHeight, 
                        0, 0, quadWidth, quadHeight
                    );
                    
                    // 프레임 추가
                    encoders[i].addFrame(partCanvas, {delay: 100, copy: true});
                    
                    // 인코딩 시작
                    encoders[i].on('finished', function(blob) {
                        console.log(`부분 ${i+1} 인코딩 완료`);
                        
                        // Blob URL 생성
                        const blobUrl = URL.createObjectURL(blob);
                        
                        // 처리된 GIF 저장
                        processedGifs[i] = blobUrl;
                        
                        // 미리보기 이미지 업데이트
                        if (previewGifs[i]) {
                            previewGifs[i].src = blobUrl;
                        }
                    });
                    
                    encoders[i].on('progress', function(p) {
                        console.log(`부분 ${i+1} 인코딩 진행률: ${Math.round(p * 100)}%`);
                    });
                    
                    // 시작
                    encoders[i].render();
                }
                
                alert('GIF 처리 중입니다. 분할된 애니메이션은 처리가 완료되면 자동으로 표시됩니다.');
            };
            
            img.onerror = function() {
                console.error('이미지 로드 중 오류 발생');
                processGIFWithGifshot(null);
            };
            
            img.src = fileURL;
            
        } catch (error) {
            console.error('gif.js 처리 중 오류:', error);
            processGIFWithGifshot(null);
        }
    }
    
    // 모든 GIF 다운로드 함수
    function handleDownloadAll() {
        console.log('모두 다운로드 버튼 클릭됨');
        
        // 처리된 GIF가 있는지 확인
        if (!processedGifs.length) {
            alert('먼저 GIF를 분할해주세요.');
            return;
        }
        
        // 각 부분을 순차적으로 다운로드 (약간의 딜레이를 두고)
        processedGifs.forEach((gif, index) => {
            setTimeout(() => {
                downloadPartAsGif(index);
            }, index * 500); // 각 다운로드 사이에 500ms 간격
        });
    }

    // 대체 프레임 추출 방법 - 이미지 URL 사용
    function extractFrameURLs(gifFile) {
        return new Promise((resolve, reject) => {
            try {
                // 파일을 URL로 변환
                const fileURL = URL.createObjectURL(gifFile);
                console.log('파일 URL 생성:', fileURL);
                
                // gifshot의 내장 함수를 사용하여 프레임 추출
                gifshot.createGIF({
                    'gifWidth': originalWidth,
                    'gifHeight': originalHeight,
                    'images': [fileURL], // 원본 GIF URL
                    'frameDuration': 10,
                    'numFrames': 0, // 모든 프레임
                    'numWorkers': 4,
                    'progressCallback': function(captureProgress) {
                        console.log(`GIF 분석 진행률: ${Math.round(captureProgress * 100)}%`);
                    }
                }, function(obj) {
                    // 성공 시
                    if(!obj.error) {
                        // gifshot은 직접 프레임을 반환하지 않지만, 여기서는 우회적으로 사용
                        console.log('GIF 분석 완료:', obj);
                        resolve([obj.image]); // 완성된 GIF URL 반환
                    } else {
                        console.error('GIF 분석 실패:', obj.error);
                        reject(new Error('GIF 분석에 실패했습니다.'));
                    }
                });
            } catch (error) {
                console.error('프레임 추출 중 오류:', error);
                reject(error);
            }
        });
    }
    
    // 새로운 GIF 파일 처리 함수 - gifshot 사용
    async function processGIFWithGifshot(timeoutId) {
        console.log('대체 GIF 처리 시작...');
        
        if (!currentFile) {
            throw new Error('업로드된 파일이 없습니다.');
        }
        
        try {
            // 분할 영역 계산
            const quadWidth = Math.floor(originalWidth / 2);
            const quadHeight = Math.floor(originalHeight / 2);
            
            // 각 부분의 좌표
            const parts = [
                { x: 0, y: 0 }, // 좌상단
                { x: quadWidth, y: 0 }, // 우상단
                { x: 0, y: quadHeight }, // 좌하단
                { x: quadWidth, y: quadHeight } // 우하단
            ];
            
            // 진행 상황 추적을 위한 카운터
            let completedParts = 0;
            const totalParts = 4;
            
            // 원본 GIF를 이미지로 사용
            const fileURL = URL.createObjectURL(currentFile);
            
            console.log('각 부분별 GIF 정적 이미지 생성 시작...');
            
            // 대체 방법으로 정적 이미지 생성
            for (let i = 0; i < 4; i++) {
                const part = parts[i];
                
                // 이미지를 로드하여 캔버스에 그리기
                const img = new Image();
                img.onload = function() {
                    // 캔버스 설정
                    const resultCanvas = canvases[i];
                    resultCanvas.width = quadWidth;
                    resultCanvas.height = quadHeight;
                    
                    // 이미지 일부분 그리기
                    const ctx = resultCanvas.getContext('2d');
                    ctx.drawImage(img, part.x, part.y, quadWidth, quadHeight, 0, 0, quadWidth, quadHeight);
                    
                    // 정적 이미지 URL 생성
                    const staticImageUrl = resultCanvas.toDataURL('image/png');
                    
                    // 다운로드 링크 설정
                    const downloadLink = downloadLinks[i];
                    downloadLink.href = staticImageUrl;
                    downloadLink.download = `part${i+1}_static.png`;
                    
                    // 미리보기 이미지 생성
                    if (!previewGifs[i]) {
                        const previewImg = document.createElement('img');
                        previewImg.src = staticImageUrl;
                        previewImg.style.width = '100%';
                        previewImg.style.height = 'auto';
                        previewImg.style.display = 'block';
                        previewImg.style.marginBottom = '0';
                        
                        // 미리보기 이미지 추가
                        const parentDiv = resultCanvas.parentNode;
                        parentDiv.insertBefore(previewImg, resultCanvas.nextSibling);
                        
                        // 캔버스 숨기기
                        resultCanvas.style.display = 'none';
                        
                        // 미리보기 이미지 저장
                        previewGifs[i] = previewImg;
                    }
                    
                    // 진행 상황 업데이트
                    completedParts++;
                    console.log(`완료된 부분: ${completedParts}/${totalParts}`);
                    
                    if (completedParts === totalParts) {
                        // 진행 중인 타임아웃이 있으면 제거
                        if (timeoutId) clearTimeout(timeoutId);
                        
                        // 로딩 인디케이터 숨기기
                        loadingIndicator.style.display = 'none';
                        
                        // 분할 영역 표시
                        splitContainer.style.display = 'block';
                        
                        // 버튼 상태 복원
                        splitBtn.disabled = false;
                        splitBtn.style.display = 'block';
                        
                        console.log('모든 부분 정적 이미지 처리 완료!');
                        alert('애니메이션 GIF 생성이 어려워 정적 이미지로 대체되었습니다. 정적 이미지를 다운로드할 수 있습니다.');
                    }
                };
                
                img.onerror = function() {
                    console.error(`부분 ${i+1} 이미지 로드 실패`);
                    completedParts++;
                    if (completedParts === totalParts) {
                        if (timeoutId) clearTimeout(timeoutId);
                        loadingIndicator.style.display = 'none';
                        splitContainer.style.display = 'block';
                        splitBtn.disabled = false;
                        splitBtn.style.display = 'block';
                    }
                };
                
                img.src = fileURL;
            }
        } catch (error) {
            console.error('대체 GIF 처리 중 오류 발생:', error);
            if (timeoutId) clearTimeout(timeoutId);
            
            // 로딩 인디케이터 숨기기
            loadingIndicator.style.display = 'none';
            
            // 버튼 상태 복원
            splitBtn.disabled = false;
            splitBtn.style.display = 'block';
            
            alert('GIF 처리 중 오류가 발생했습니다: ' + error.message);
        }
    }

    // GIF 파트 다운로드 함수
    function downloadPartAsGif(index) {
        if (!processedGifs[index]) {
            console.error('해당 인덱스의 GIF 데이터가 없습니다:', index);
            return;
        }
        
        const blobUrl = processedGifs[index];
        const fileName = `part${index+1}.gif`;
        
        // 임시 링크 생성 및 다운로드
        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = fileName;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        
        console.log(`${index+1}번 영역 GIF 다운로드 완료`);
    }
}); 