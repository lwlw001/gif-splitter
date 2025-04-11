document.addEventListener('DOMContentLoaded', function() {
    // 라이브러리 로딩 확인
    let fabricLoaded = typeof fabric !== 'undefined';
    let gifLibraryLoaded = typeof gifshot !== 'undefined' && typeof GIF !== 'undefined';
    
    console.log('Fabric.js 로드 상태:', fabricLoaded);
    console.log('GIF 라이브러리 로드 상태:', gifLibraryLoaded);
    
    // 요소 참조
    const imageUpload = document.getElementById('image-upload');
    const editorCanvas = document.getElementById('editor-canvas');
    const previewDisplay = document.getElementById('preview-display');
    const previewBtn = document.getElementById('preview-btn');
    const createGifBtn = document.getElementById('create-gif-btn');
    const resetBtn = document.getElementById('reset-btn');
    const downloadGifLink = document.getElementById('download-gif');
    
    // 텍스트 컨트롤 요소
    const textContent = document.getElementById('text-content');
    const fontFamily = document.getElementById('font-family');
    const textColor = document.getElementById('text-color');
    const fontSize = document.getElementById('font-size');
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const underlineBtn = document.getElementById('underline-btn');
    const strokeBtn = document.getElementById('stroke-btn');
    const addTextBtn = document.getElementById('add-text-btn');
    
    // 애니메이션 설정 요소
    const animationDuration = document.getElementById('animation-duration');
    const animationFrames = document.getElementById('animation-frames');
    const loopCount = document.getElementById('loop-count');
    
    // 효과 버튼들
    const effectButtons = document.querySelectorAll('.effect-btn');
    const textAnimButtons = document.querySelectorAll('.text-anim-btn');
    
    // 프레임 타임라인 요소
    const framesContainer = document.getElementById('frames-container');
    const addFrameBtn = document.getElementById('add-frame-btn');
    const deleteFrameBtn = document.getElementById('delete-frame-btn');
    const duplicateFrameBtn = document.getElementById('duplicate-frame-btn');
    const playFramesBtn = document.getElementById('play-frames-btn');
    const frameScrubber = document.getElementById('frame-scrubber');
    const currentFrameEl = document.getElementById('current-frame');
    const totalFramesEl = document.getElementById('total-frames');
    const prevFrameBtn = document.getElementById('prev-frame-btn');
    const nextFrameBtn = document.getElementById('next-frame-btn');
    const goToStartBtn = document.getElementById('go-to-start-btn');
    const goToEndBtn = document.getElementById('go-to-end-btn');
    const frameSettingsBtn = document.getElementById('frame-settings-btn');
    
    // 미디어 라이브러리 요소
    const mediaTabs = document.querySelectorAll('.media-tab');
    const mediaContents = document.querySelectorAll('.media-content');
    const mediaUploadInput = document.getElementById('media-upload-input');
    const audioUploadInput = document.getElementById('audio-upload-input');
    const mediaItemsContainer = document.querySelector('.media-items-container');
    const audioPreviewBtns = document.querySelectorAll('.audio-preview-btn');
    const audioAddBtns = document.querySelectorAll('.audio-add-btn');
    const transitionItems = document.querySelectorAll('.transition-item');
    
    // 캔버스 관련 변수
    let canvas;
    let backgroundImage = null;
    let selectedEffect = 'none';
    let selectedTextEffect = 'none';
    let textObjects = [];
    
    // 프레임 관련 변수
    let frames = []; // 프레임 상태를 저장하는 배열
    let currentFrameIndex = 0; // 현재 선택된 프레임 인덱스
    let isPlaying = false; // 프레임 재생 중인지 여부
    let playbackInterval; // 재생 인터벌 ID
    
    // 미디어 라이브러리 관련 변수
    let mediaItems = []; // 업로드된 미디어 아이템 배열
    let audioItems = []; // 오디오 아이템 배열
    let selectedTransition = null; // 선택된 트랜지션
    let availableTransitions = { // 사용 가능한 트랜지션 정의
        fade: { name: '페이드', duration: 0.5 },
        wipe: { name: '와이프', duration: 0.7 },
        slide: { name: '슬라이드', duration: 0.6 },
        zoom: { name: '줌', duration: 0.8 },
        rotate: { name: '회전', duration: 0.7 }
    };
    
    // 기본 오디오 파일 정의
    const defaultAudioItems = [
        { id: 'audio_1', name: '배경음악 1', url: 'assets/audio/bg_music_1.mp3', duration: 30 },
        { id: 'audio_2', name: '배경음악 2', url: 'assets/audio/bg_music_2.mp3', duration: 45 },
        { id: 'audio_3', name: '효과음 1', url: 'assets/audio/sfx_1.mp3', duration: 2 }
    ];
    
    // 이미지 효과 설정을 위한 객체 추가
    let effectSettings = {
        fadeIn: {
            opacityStart: 0,
            opacityEnd: 1
        },
        fadeOut: {
            opacityStart: 1,
            opacityEnd: 0
        },
        zoomIn: {
            scaleStart: 0.7,
            scaleEnd: 1.3
        },
        zoomOut: {
            scaleStart: 1.3,
            scaleEnd: 0.7
        },
        slideUp: {
            distance: 40
        },
        slideDown: {
            distance: 40
        },
        pulse: {
            intensity: 0.2,
            frequency: 4
        },
        shake: {
            intensity: 15,
            frequency: 6
        },
        rotate: {
            angle: 30,
            direction: 'clockwise'
        },
        blur: {
            amount: 5
        },
        steam: {
            intensity: 0.5,
            speed: 5,
            particles: 8,
            position: 'center'
        },
        // 새로운 효과들 추가
        filmGrain: {
            intensity: 0.5,
            speed: 5
        },
        glitch: {
            intensity: 0.5,
            frequency: 3
        },
        oldFilm: {
            scratches: 5,
            dust: 0.5,
            flicker: 0.3
        },
        vhs: {
            linesBroken: 0.3,
            colorShift: 0.2,
            noise: 0.5
        },
        pixelate: {
            size: 10
        },
        duotone: {
            colorLight: '#ffffff',
            colorDark: '#2AC1BC'
        },
        '3DSplit': {
            distance: 10,
            rotation: 5
        },
        mirror: {
            direction: 'horizontal', // horizontal, vertical, both
            offset: 0
        },
        kaleidoscope: {
            sides: 6,
            angle: 0
        },
        motionBlur: {
            direction: 'horizontal', // horizontal, vertical, radial
            intensity: 10
        }
    };
    
    // 확장된 프레임 속성
    const defaultFrameProps = {
        duration: 0.5, // 기본 프레임 재생 시간 (초)
        transition: null, // 다음 프레임으로 넘어갈 때 사용할 트랜지션
        transitionDuration: 0.3, // 트랜지션 지속 시간 (초)
        audioTrack: null, // 프레임에 연결된 오디오 트랙
        effects: [] // 프레임에 적용된 효과 목록
    };
    
    // 캔버스 초기화
    function initCanvas() {
        if (!fabricLoaded) {
            alert('에디터 라이브러리(Fabric.js)가 로드되지 않았습니다. 페이지를 새로고침한 후 다시 시도해 주세요.');
            return;
        }
        
        // 기존 캔버스 확인 및 삭제
        if (canvas) {
            canvas.dispose();
        }
        
        // 캔버스 크기 설정
        const canvasWidth = 600;
        const canvasHeight = 400;
        
        // Fabric 캔버스 생성
        canvas = new fabric.Canvas(editorCanvas, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true
        });
        
        // 캔버스 이벤트 리스너 설정
        canvas.on('object:modified', function() {
            // 객체가 수정되면 현재 프레임 상태 저장
            saveCurrentFrame();
        });
        
        // 안내 텍스트 추가
        const guideText = new fabric.Text('이미지를 업로드해 주세요', {
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            fontSize: 20,
            originX: 'center',
            originY: 'center',
            fill: '#999999',
            selectable: false
        });
        canvas.add(guideText);
        canvas.renderAll();
    }
    
    // 이미지 업로드 처리
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(evt) {
            const imgURL = evt.target.result;
            fabric.Image.fromURL(imgURL, function(img) {
                // 기존 코드
                // 캔버스 크기에 맞게 이미지 크기 조정
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                
                // 이미지 비율 유지하며 크기 조정
                if (img.width > img.height) {
                    // 가로가 긴 이미지
                    const scale = canvasWidth / img.width;
                    img.scaleToWidth(canvasWidth);
                    if (img.getScaledHeight() > canvasHeight) {
                        img.scaleToHeight(canvasHeight);
                    }
                } else {
                    // 세로가 긴 이미지
                    const scale = canvasHeight / img.height;
                    img.scaleToHeight(canvasHeight);
                    if (img.getScaledWidth() > canvasWidth) {
                        img.scaleToWidth(canvasWidth);
                    }
                }
                
                // 캔버스 중앙에 이미지 배치
                img.set({
                    left: canvasWidth / 2,
                    top: canvasHeight / 2,
                    originX: 'center',
                    originY: 'center'
                });
                
                // 원래 스케일 저장
                img.originalScaleX = img.scaleX;
                img.originalScaleY = img.scaleY;
                
                // 캔버스 초기화 및 이미지 추가
                canvas.clear();
                canvas.add(img);
                canvas.renderAll();
                
                // 배경 이미지로 설정
                backgroundImage = img;
                
                // 현재 선택된 효과 적용
                if (selectedEffect !== 'none') {
                    applyEffectToCanvasRealtime();
                }
                
                // 캔버스 히스토리 초기화
                if (typeof canvas.historyInit === 'function') {
                    canvas.historyInit();
                }
                
                // 프레임 초기화 - 이미지 업로드시 첫 프레임 생성
                initFrames();
                
                // 미디어 라이브러리에도 추가
                addToMediaLibrary(imgURL, file.name);
            });
        };
        reader.readAsDataURL(file);
    }
    
    // 미디어 라이브러리에 이미지 추가
    function addToMediaLibrary(url, filename) {
        const mediaItem = {
            id: 'media_' + Date.now(),
            type: 'image',
            url: url,
            filename: filename,
            added: new Date()
        };
        
        mediaItems.push(mediaItem);
        
        // 미디어 아이템 UI에 추가
        addMediaItemToUI(mediaItem);
    }
    
    // 미디어 아이템을 UI에 추가
    function addMediaItemToUI(item) {
        if (!mediaItemsContainer) return;
        
        const mediaItemEl = document.createElement('div');
        mediaItemEl.className = 'media-item';
        mediaItemEl.dataset.id = item.id;
        
        const mediaImg = document.createElement('img');
        mediaImg.src = item.url;
        mediaItemEl.appendChild(mediaImg);
        
        const controls = document.createElement('div');
        controls.className = 'media-item-controls';
        
        // 미리보기 버튼
        const previewBtn = document.createElement('button');
        previewBtn.className = 'media-item-btn';
        previewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        previewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            previewMediaItem(item);
        });
        controls.appendChild(previewBtn);
        
        // 추가 버튼
        const addBtn = document.createElement('button');
        addBtn.className = 'media-item-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i>';
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addMediaItemToCanvas(item);
        });
        controls.appendChild(addBtn);
        
        mediaItemEl.appendChild(controls);
        
        // 클릭 이벤트
        mediaItemEl.addEventListener('click', () => {
            addMediaItemToCanvas(item);
        });
        
        mediaItemsContainer.appendChild(mediaItemEl);
    }
    
    // 미디어 아이템 미리보기
    function previewMediaItem(item) {
        if (!previewDisplay) return;
        
        if (item.type === 'image') {
            // 미리보기 영역에 이미지 표시
            const img = document.createElement('img');
            img.src = item.url;
            img.className = 'preview-img';
            
            previewDisplay.innerHTML = '';
            previewDisplay.appendChild(img);
        }
    }
    
    // 미디어 아이템을 캔버스에 추가
    function addMediaItemToCanvas(item) {
        if (!canvas) return;
        
        if (item.type === 'image') {
            fabric.Image.fromURL(item.url, function(img) {
                // 캔버스 크기에 맞게 이미지 크기 조정
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                
                // 이미지 비율 유지하며 크기 조정
                if (img.width > img.height) {
                    img.scaleToWidth(canvasWidth * 0.8);
                    if (img.getScaledHeight() > canvasHeight * 0.8) {
                        img.scaleToHeight(canvasHeight * 0.8);
                    }
                } else {
                    img.scaleToHeight(canvasHeight * 0.8);
                    if (img.getScaledWidth() > canvasWidth * 0.8) {
                        img.scaleToWidth(canvasWidth * 0.8);
                    }
                }
                
                // 캔버스 중앙에 이미지 배치
                img.set({
                    left: canvasWidth / 2,
                    top: canvasHeight / 2,
                    originX: 'center',
                    originY: 'center'
                });
                
                // 캔버스에 이미지 추가
                canvas.add(img);
                
                // 객체를 선택 상태로
                canvas.setActiveObject(img);
                canvas.renderAll();
                
                // 현재 프레임 상태 저장
                saveCurrentFrame();
            });
        }
    }
    
    // 프레임 초기화 함수
    function initFrames() {
        // 기존 프레임 제거
        frames = [];
        currentFrameIndex = 0;
        
        // 첫 프레임 추가
        addFrame();
    }
    
    // 프레임 추가 함수
    function addFrame() {
        // 현재 캔버스 상태를 저장
        const frameData = {
            dataURL: canvas.toDataURL('image/png'),
            objects: canvas.toJSON(),
            duration: defaultFrameProps.duration,
            transition: defaultFrameProps.transition,
            transitionDuration: defaultFrameProps.transitionDuration,
            audioTrack: defaultFrameProps.audioTrack,
            effects: [...defaultFrameProps.effects]
        };
        
        frames.push(frameData);
        currentFrameIndex = frames.length - 1;
        
        updateFramesContainer();
        updateFrameControls();
    }
    
    // 프레임 설정 함수
    function setFrameDuration(index, duration) {
        if (index >= 0 && index < frames.length) {
            frames[index].duration = duration;
            updateFramesContainer();
        }
    }
    
    // 프레임 선택 함수
    function selectFrame(index) {
        if (index < 0 || index >= frames.length) return;
        
        // 현재 프레임 상태 저장
        saveCurrentFrame();
        
        // 선택한 프레임 로드
        currentFrameIndex = index;
        loadFrame(index);
        
        // UI 업데이트
        updateFramesContainer();
    }
    
    // 프레임 로드 함수
    function loadFrame(index) {
        if (index < 0 || index >= frames.length) return;
        
        const frame = frames[index];
        
        // 캔버스 상태 로드
        canvas.clear();
        canvas.loadFromJSON(frame.objects, function() {
            // 배경 이미지 참조 복원
            const bgImage = canvas.getObjects().find(obj => obj.type === 'image');
            if (bgImage) {
                backgroundImage = bgImage;
            }
            
            // 텍스트 객체 참조 복원
            textObjects = canvas.getObjects('text');
            
            canvas.renderAll();
        });
    }
    
    // 현재 프레임 상태 저장 함수
    function saveCurrentFrame() {
        if (frames.length === 0 || currentFrameIndex < 0) return;
        
        // 현재 프레임 데이터 업데이트
        frames[currentFrameIndex].dataURL = canvas.toDataURL('image/png');
        frames[currentFrameIndex].objects = canvas.toJSON();
    }
    
    // 재생/일시정지 토글
    function togglePlayback() {
        if (isPlaying) {
            stopPlayback();
        } else {
            startPlayback();
        }
    }
    
    // 재생 시작
    function startPlayback() {
        if (frames.length <= 1) return;
        
        // 현재 상태 저장
        saveCurrentFrame();
        
        isPlaying = true;
        playFramesBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        let playbackIndex = currentFrameIndex;
        const totalTime = parseFloat(animationDuration.value); // 총 재생 시간 (초)
        const frameDelay = totalTime * 1000 / frames.length; // 프레임당 시간 (밀리초)
        
        playbackInterval = setInterval(() => {
            // 다음 프레임으로 이동
            playbackIndex = (playbackIndex + 1) % frames.length;
            
            // 프레임 로드
            loadFrame(playbackIndex);
            
            // UI 업데이트
            currentFrameIndex = playbackIndex;
            updateFramesContainer();
            
            // 스크러버 업데이트
            frameScrubber.value = playbackIndex;
            currentFrameEl.textContent = playbackIndex + 1;
        }, frameDelay);
    }
    
    // 재생 중지
    function stopPlayback() {
        if (!isPlaying) return;
        
        isPlaying = false;
        playFramesBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        if (playbackInterval) {
            clearInterval(playbackInterval);
            playbackInterval = null;
        }
    }
    
    // 프레임 복제 함수
    function duplicateFrame() {
        if (frames.length === 0) return;
        
        // 현재 프레임 상태 저장
        saveCurrentFrame();
        
        // 현재 프레임 복제
        const currentFrame = frames[currentFrameIndex];
        const duplicatedFrame = {
            dataURL: currentFrame.dataURL,
            objects: JSON.parse(JSON.stringify(currentFrame.objects)),
            duration: currentFrame.duration,
            transition: currentFrame.transition,
            transitionDuration: currentFrame.transitionDuration,
            audioTrack: currentFrame.audioTrack,
            effects: [...currentFrame.effects]
        };
        
        // 복제된 프레임 삽입
        frames.splice(currentFrameIndex + 1, 0, duplicatedFrame);
        
        // 복제된 프레임 선택
        currentFrameIndex++;
        
        // UI 업데이트
        updateFramesContainer();
        updateFrameControls();
    }
    
    // 프레임 삭제 함수
    function deleteFrame() {
        if (frames.length <= 1) {
            alert('최소 1개의 프레임이 필요합니다.');
            return;
        }
        
        // 현재 프레임 삭제
        frames.splice(currentFrameIndex, 1);
        
        // 인덱스 조정
        currentFrameIndex = Math.min(currentFrameIndex, frames.length - 1);
        
        // 프레임 로드 및 UI 업데이트
        loadFrame(currentFrameIndex);
        updateFramesContainer();
        updateFrameControls();
    }
    
    // 프레임 컨트롤 업데이트 함수
    function updateFrameControls() {
        if (!deleteFrameBtn || !duplicateFrameBtn || !playFramesBtn || !frameScrubber) return;
        
        // 버튼 활성화/비활성화 설정
        deleteFrameBtn.disabled = frames.length <= 1;
        duplicateFrameBtn.disabled = frames.length === 0;
        playFramesBtn.disabled = frames.length <= 1;
        frameScrubber.disabled = frames.length <= 1;
        
        // 추가 버튼들
        if (prevFrameBtn) prevFrameBtn.disabled = frames.length <= 1;
        if (nextFrameBtn) nextFrameBtn.disabled = frames.length <= 1;
        if (goToStartBtn) goToStartBtn.disabled = frames.length <= 1;
        if (goToEndBtn) goToEndBtn.disabled = frames.length <= 1;
    }
    
    // 미디어 라이브러리 탭 기능 설정
    function setupMediaTabs() {
        mediaTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 모든 탭 비활성화
                mediaTabs.forEach(t => t.classList.remove('active'));
                mediaContents.forEach(c => c.classList.remove('active'));
                
                // 선택된 탭 활성화
                tab.classList.add('active');
                const tabId = tab.dataset.tab + '-tab';
                const contentEl = document.getElementById(tabId);
                if (contentEl) {
                    contentEl.classList.add('active');
                }
            });
        });
    }
    
    // 초기화 함수 업데이트
    function init() {
        initCanvas();
        setupEventListeners();
        setupEffectSettingListeners();
        initMediaLibrary();
        
        // 기본 효과 선택
        setImageEffect('none');
        setTextEffect('none');
        
        // 프레임 컨트롤 초기화
        updateFrameControls();
    }
    
    // 미디어 라이브러리 초기화
    function initMediaLibrary() {
        // 기본 오디오 아이템 설정
        audioItems = [...defaultAudioItems];
        
        // 미디어 탭 설정
        setupMediaTabs();
        
        // 샘플 이미지 추가 (실제 구현 시 제거 또는 리소스 확인 후 추가)
        if (mediaItemsContainer && mediaItemsContainer.children.length === 0) {
            // 샘플 이미지가 실제로 있는 경우에만 추가
            console.log('미디어 라이브러리 초기화: 샘플 이미지 추가 준비됨');
        }
    }
    
    // 텍스트 추가
    function addText() {
        if (!canvas) return;
        
        const content = textContent.value.trim();
        if (!content) {
            alert('텍스트를 입력해 주세요.');
            return;
        }
        
        // 텍스트 스타일 설정
        const textOptions = {
            left: canvas.width / 2,
            top: canvas.height / 2,
            fontSize: parseInt(fontSize.value),
            fontFamily: fontFamily.value,
            fill: textColor.value,
            originX: 'center',
            originY: 'center',
            textAlign: 'center',
            fontWeight: boldBtn.classList.contains('active') ? 'bold' : 'normal',
            fontStyle: italicBtn.classList.contains('active') ? 'italic' : 'normal',
            underline: underlineBtn.classList.contains('active'),
            strokeWidth: strokeBtn.classList.contains('active') ? 1 : 0,
            stroke: strokeBtn.classList.contains('active') ? '#000000' : ''
        };
        
        // 새 텍스트 객체 생성
        const textObj = new fabric.Text(content, textOptions);
        
        // 텍스트 객체에 애니메이션 효과 정보 추가
        textObj.animationEffect = selectedTextEffect;
        
        // 캔버스에 텍스트 추가
        canvas.add(textObj);
        canvas.setActiveObject(textObj);
        canvas.renderAll();
        
        // 텍스트 객체 배열에 추가
        textObjects.push(textObj);
        
        // 입력 필드 초기화
        textContent.value = '';
        
        // 프레임에 변경 사항 저장
        saveCurrentFrame();
    }
    
    // 이미지 효과 설정
    function setImageEffect(effect) {
        selectedEffect = effect;
        console.log('이미지 효과 설정:', effect);
        
        // 버튼 스타일 업데이트
        effectButtons.forEach(btn => {
            if (btn.dataset.effect === effect) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // 모든 세부 설정 패널 숨기기
        document.querySelectorAll('.effect-detail-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        
        // 선택된 효과에 대한 세부 설정 패널 표시
        const detailPanel = document.getElementById(`${effect}-panel`);
        if (detailPanel) {
            detailPanel.style.display = 'block';
            
            // 현재 설정값을 UI에 반영
            const settings = effectSettings[effect];
            if (settings) {
                Object.keys(settings).forEach(key => {
                    const input = detailPanel.querySelector(`[data-param="${key}"]`);
                    if (input) {
                        if (input.type === 'select-one') {
                            input.value = settings[key];
                        } else if (input.type === 'range') {
                            input.value = settings[key];
                            // 값 표시 업데이트
                            const valueDisplay = input.nextElementSibling;
                            if (valueDisplay && valueDisplay.classList.contains('value-display')) {
                                let displayValue = settings[key];
                                if (key === 'angle') displayValue += '°';
                                valueDisplay.textContent = displayValue;
                            }
                        }
                    }
                });
            }
        }
        
        // 효과 즉시 적용 - 배경 이미지가 있을 경우에만 실행
        if (backgroundImage) {
            applyEffectToCanvasRealtime();
            
            // 프레임에 변경 사항 저장
            saveCurrentFrame();
        }
    }
    
    // 효과 설정값 변경 이벤트 처리 함수
    function handleEffectSettingChange(e) {
        const param = e.target.dataset.param;
        const effect = selectedEffect;
        const value = e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value;
        
        // 설정값 업데이트
        if (effectSettings[effect] && param) {
            effectSettings[effect][param] = value;
            
            // 값 표시 업데이트
            if (e.target.type === 'range') {
                const valueDisplay = e.target.nextElementSibling;
                if (valueDisplay && valueDisplay.classList.contains('value-display')) {
                    let displayValue = value;
                    if (param === 'angle') displayValue += '°';
                    valueDisplay.textContent = displayValue;
                }
            }
            
            // 효과 즉시 적용
            if (backgroundImage) {
                applyEffectToCanvasRealtime();
            }
        }
    }
    
    // 효과 설정 요소에 이벤트 리스너 추가하는 함수
    function setupEffectSettingListeners() {
        document.querySelectorAll('.effect-detail-panel input, .effect-detail-panel select').forEach(input => {
            input.addEventListener('input', handleEffectSettingChange);
            input.addEventListener('change', handleEffectSettingChange);
        });
    }
    
    // 실시간으로 캔버스에 효과 적용하는 함수
    function applyEffectToCanvasRealtime() {
        // 기존 애니메이션 중지
        if (backgroundImage && backgroundImage.effectAnimationId) {
            cancelAnimationFrame(backgroundImage.effectAnimationId);
            backgroundImage.effectAnimationId = null;
        }
        
        // 캔버스를 초기 상태로 재설정
        canvas.clear();
        
        // 배경 이미지 원래 상태로 복원
        backgroundImage.set({
            opacity: 1,
            scaleX: backgroundImage.originalScaleX || 1,
            scaleY: backgroundImage.originalScaleY || 1,
            angle: 0,
            left: canvas.width / 2,
            top: canvas.height / 2
        });
        
        // 배경 이미지 다시 추가
        canvas.add(backgroundImage);
        
        // 텍스트 객체들 다시 추가
        textObjects.forEach(textObj => {
            canvas.add(textObj);
        });
        
        // 효과가 없으면 애니메이션하지 않음
        if (selectedEffect === 'none') {
            canvas.renderAll();
            return;
        }
        
        // 애니메이션 시작 시간 기록
        backgroundImage.effectStartTime = Date.now();
        
        // 애니메이션 함수
        function animateImageEffect() {
            // 경과 시간 계산 (밀리초)
            const elapsed = Date.now() - backgroundImage.effectStartTime;
            // 3초 주기로 애니메이션 반복 (0~1 범위의 progress)
            const progress = (elapsed % 3000) / 3000;
            
            // 배경 이미지 원래 상태로 복원
            backgroundImage.set({
                opacity: 1,
                scaleX: backgroundImage.originalScaleX || 1,
                scaleY: backgroundImage.originalScaleY || 1,
                angle: 0,
                left: canvas.width / 2,
                top: canvas.height / 2
            });
            
            // 세부 설정값 가져오기
            const settings = effectSettings[selectedEffect] || {};
            
            // 효과 적용
            switch (selectedEffect) {
                case 'fadeIn':
                    // 페이드인 효과 (시작 투명도 -> 종료 투명도 반복)
                    const fadeInOpacity = settings.opacityStart + (settings.opacityEnd - settings.opacityStart) * progress;
                    backgroundImage.set('opacity', fadeInOpacity);
                    break;
                    
                case 'fadeOut':
                    // 페이드아웃 효과 (시작 투명도 -> 종료 투명도 반복)
                    const fadeOutOpacity = settings.opacityStart + (settings.opacityEnd - settings.opacityStart) * progress;
                    backgroundImage.set('opacity', fadeOutOpacity);
                    break;
                    
                case 'zoomIn':
                    // 줌인 효과 (시작 크기 -> 종료 크기 반복)
                    const zoomInScale = settings.scaleStart + (settings.scaleEnd - settings.scaleStart) * Math.sin(progress * Math.PI * 2);
                    backgroundImage.set({
                        scaleX: backgroundImage.originalScaleX * zoomInScale,
                        scaleY: backgroundImage.originalScaleY * zoomInScale
                    });
                    break;
                    
                case 'zoomOut':
                    // 줌아웃 효과 (시작 크기 -> 종료 크기 반복)
                    const zoomOutScale = settings.scaleStart + (settings.scaleEnd - settings.scaleStart) * Math.sin(progress * Math.PI * 2);
                    backgroundImage.set({
                        scaleX: backgroundImage.originalScaleX * zoomOutScale,
                        scaleY: backgroundImage.originalScaleY * zoomOutScale
                    });
                    break;
                    
                case 'slideUp':
                    // 아래에서 위로 슬라이드 (설정된 거리만큼 반복)
                    const slideUpOffset = settings.distance * Math.sin(progress * Math.PI * 2);
                    backgroundImage.set({
                        top: canvas.height / 2 + slideUpOffset
                    });
                    break;
                    
                case 'slideDown':
                    // 위에서 아래로 슬라이드 (설정된 거리만큼 반복)
                    const slideDownOffset = settings.distance * Math.sin(progress * Math.PI * 2);
                    backgroundImage.set({
                        top: canvas.height / 2 - slideDownOffset
                    });
                    break;
                    
                case 'pulse':
                    // 펄스 효과 (설정된 강도와 주기로 변화)
                    const pulseScale = 1 + settings.intensity * Math.sin(progress * Math.PI * settings.frequency);
                    backgroundImage.set({
                        scaleX: backgroundImage.originalScaleX * pulseScale,
                        scaleY: backgroundImage.originalScaleY * pulseScale
                    });
                    break;
                    
                case 'shake':
                    // 흔들림 효과 (설정된 강도와 주기로 좌우 흔들림)
                    const shakeAmount = settings.intensity * Math.sin(progress * Math.PI * settings.frequency);
                    backgroundImage.set({
                        left: canvas.width / 2 + shakeAmount
                    });
                    break;
                    
                case 'rotate':
                    // 회전 효과 (설정된 각도와 방향으로 회전)
                    let rotateAngle = 0;
                    if (settings.direction === 'clockwise') {
                        rotateAngle = settings.angle * progress;
                    } else if (settings.direction === 'counterclockwise') {
                        rotateAngle = -settings.angle * progress;
                    } else if (settings.direction === 'alternate') {
                        rotateAngle = settings.angle * Math.sin(progress * Math.PI * 2);
                    }
                    backgroundImage.set({
                        angle: rotateAngle
                    });
                    break;
                    
                case 'blur':
                    // 블러 효과 (Canvas API에서는 직접적인 블러 적용이 어려움)
                    // WebGL 필터 또는 CSS 필터를 사용할 경우 구현 가능
                    // 여기서는 플레이스홀더만 유지
                    break;
                    
                case 'steam':
                    // 김 모락모락 효과
                    drawSteamEffect(canvas.contextContainer, canvas, progress);
                    break;
                    
                case 'filmGrain':
                    applyFilmGrainEffect(backgroundImage, progress, effectSettings.filmGrain);
                    break;
                    
                case 'glitch':
                    applyGlitchEffect(backgroundImage, progress, effectSettings.glitch);
                    break;
                    
                case 'oldFilm':
                    applyOldFilmEffect(backgroundImage, progress, effectSettings.oldFilm);
                    break;
                    
                case 'vhs':
                    applyVHSEffect(backgroundImage, progress, effectSettings.vhs);
                    break;
                    
                case 'pixelate':
                    applyPixelateEffect(backgroundImage, progress, effectSettings.pixelate);
                    break;
                    
                case 'duotone':
                    applyDuotoneEffect(backgroundImage, progress, effectSettings.duotone);
                    break;
                    
                case '3DSplit':
                    apply3DSplitEffect(backgroundImage, progress, effectSettings['3DSplit']);
                    break;
                    
                case 'mirror':
                    applyMirrorEffect(backgroundImage, progress, effectSettings.mirror);
                    break;
                    
                case 'kaleidoscope':
                    applyKaleidoscopeEffect(backgroundImage, progress, effectSettings.kaleidoscope);
                    break;
                    
                case 'motionBlur':
                    applyMotionBlurEffect(backgroundImage, progress, effectSettings.motionBlur);
                    break;
            }
            
            // 캔버스 새로고침
            canvas.renderAll();
            
            // 애니메이션 계속 유지
            backgroundImage.effectAnimationId = requestAnimationFrame(animateImageEffect);
        }
        
        // 애니메이션 시작
        backgroundImage.effectAnimationId = requestAnimationFrame(animateImageEffect);
        
        // 프레임에 변경 사항 저장
        saveCurrentFrame();
    }
    
    // 김 모락모락 효과 그리기 함수
    function drawSteamEffect(ctx, canvas, progress) {
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // 김 입자 수
        const numParticles = 10;
        
        // 각 입자 그리기
        for (let i = 0; i < numParticles; i++) {
            // 입자의 위치 계산 (원 모양으로 분포)
            const angle = (i / numParticles) * Math.PI * 2;
            const radius = 50 + Math.sin(progress * Math.PI * 2 + i) * 20;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY - Math.sin(progress * Math.PI * 3 + i * 0.5) * 100;
            
            // 입자 크기와 투명도 계산
            const size = 20 + Math.sin(progress * Math.PI * 2 + i * 0.7) * 10;
            const opacity = 0.4 - (y / height) * 0.3;
            
            // 입자가 보이는 경우에만 그리기
            if (opacity > 0) {
                // 그라디언트로 둥근 입자 효과 생성
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
                
                // 입자 그리기
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // 필름 그레인 효과 함수
    function applyFilmGrainEffect(image, progress, settings) {
        // 원래 스케일 백업
        const originalScaleX = image.scaleX;
        const originalScaleY = image.scaleY;
        
        // 필름 그레인 효과를 위한 노이즈 오프셋 계산
        const noiseX = Math.sin(progress * Math.PI * 2) * settings.intensity;
        const noiseY = Math.cos(progress * Math.PI * 2) * settings.intensity;
        
        // 이미지 필터 업데이트
        const grainFilter = new fabric.Image.filters.Noise({
            noise: 50 * settings.intensity
        });
        
        // 이미지에 필터 적용
        image.filters = [grainFilter];
        image.applyFilters();
        
        // 이미지 위치 미세하게 흔들기
        image.set({
            left: image.left + noiseX,
            top: image.top + noiseY
        });
    }
    
    // 글리치 효과 함수
    function applyGlitchEffect(image, progress, settings) {
        // 글리치 효과는 특정 간격으로 발생
        const glitchTime = Math.sin(progress * Math.PI * settings.frequency) > 0.8;
        
        if (glitchTime) {
            // RGB 분할 효과
            const rgbSplitFilter = new fabric.Image.filters.BlendColor({
                color: '#FF0000',
                mode: 'tint',
                opacity: 0.1 * settings.intensity
            });
            
            // 노이즈 필터
            const noiseFilter = new fabric.Image.filters.Noise({
                noise: 30 * settings.intensity
            });
            
            // 이미지 위치 흔들기
            const offsetX = (Math.random() - 0.5) * 10 * settings.intensity;
            const offsetY = (Math.random() - 0.5) * 10 * settings.intensity;
            
            image.set({
                left: image.left + offsetX,
                top: image.top + offsetY
            });
            
            // 필터 적용
            image.filters = [rgbSplitFilter, noiseFilter];
            image.applyFilters();
        } else {
            // 정상 상태로 복구
            image.filters = [];
            image.applyFilters();
        }
    }
    
    // 오래된 필름 효과 함수
    function applyOldFilmEffect(image, progress, settings) {
        // 세피아 필터
        const sepiaFilter = new fabric.Image.filters.Sepia();
        
        // 노이즈 필터 (먼지 효과)
        const noiseFilter = new fabric.Image.filters.Noise({
            noise: 20 * settings.dust
        });
        
        // 명도 조절 (깜빡임 효과)
        const brightness = 1 + (Math.sin(progress * Math.PI * 10) * 0.1 * settings.flicker);
        const brightnessFilter = new fabric.Image.filters.Brightness({
            brightness: brightness
        });
        
        // 스크래치 효과 (랜덤한 선)
        if (Math.random() < 0.1 * settings.scratches) {
            // 스크래치 효과는 캔버스에 직접 그리기
            const scratchX = Math.random() * canvas.width;
            const scratchY = Math.random() * canvas.height;
            const scratchLength = Math.random() * 100 + 50;
            const scratchWidth = Math.random() * 2 + 0.5;
            
            const scratchLine = new fabric.Line(
                [scratchX, scratchY, scratchX, scratchY + scratchLength],
                {
                    stroke: 'rgba(255,255,255,0.5)',
                    strokeWidth: scratchWidth,
                    selectable: false,
                    evented: false,
                    opacity: 0.7
                }
            );
            
            canvas.add(scratchLine);
            
            // 잠시 후 스크래치 제거
            setTimeout(() => {
                canvas.remove(scratchLine);
            }, 100);
        }
        
        // 필터 적용
        image.filters = [sepiaFilter, noiseFilter, brightnessFilter];
        image.applyFilters();
    }
    
    // VHS 효과 함수
    function applyVHSEffect(image, progress, settings) {
        // RGB 분할 효과
        const offset = Math.sin(progress * Math.PI * 2) * settings.colorShift * 10;
        
        // 필터 적용
        const rgbSplitFilter = new fabric.Image.filters.BlendColor({
            color: '#0000FF',
            mode: 'tint',
            opacity: 0.1 + 0.05 * Math.sin(progress * Math.PI * 2)
        });
        
        // 노이즈 필터
        const noiseFilter = new fabric.Image.filters.Noise({
            noise: 10 * settings.noise
        });
        
        // 밝기/대비 조정
        const contrastFilter = new fabric.Image.filters.Contrast({
            contrast: 0.1
        });
        
        // 수평선 깨짐 효과
        if (Math.random() < settings.linesBroken * 0.1) {
            // 특정 높이에 깨진 선 효과
            const lineY = Math.random() * canvas.height;
            const lineHeight = Math.random() * 5 + 2;
            
            const brokenLine = new fabric.Rect({
                left: 0,
                top: lineY,
                width: canvas.width,
                height: lineHeight,
                fill: 'rgba(0,255,255,0.3)',
                selectable: false,
                evented: false
            });
            
            canvas.add(brokenLine);
            
            // 잠시 후 깨진 선 제거
            setTimeout(() => {
                canvas.remove(brokenLine);
            }, 100);
        }
        
        // 이미지에 필터 적용
        image.filters = [rgbSplitFilter, noiseFilter, contrastFilter];
        image.applyFilters();
        
        // 이미지 위치 미세하게 흔들기 (테이프 흔들림 효과)
        if (progress % 0.2 < 0.02) {
            image.set({
                left: image.left + (Math.random() - 0.5) * 5,
                skewX: (Math.random() - 0.5) * 2
            });
        }
    }
    
    // 픽셀화 효과 함수
    function applyPixelateEffect(image, progress, settings) {
        // 픽셀 크기 계산 (시간에 따라 변화)
        const pixelSize = settings.size + Math.sin(progress * Math.PI * 2) * 5;
        
        // 픽셀화 필터 적용
        const pixelateFilter = new fabric.Image.filters.Pixelate({
            blocksize: pixelSize
        });
        
        // 필터 적용
        image.filters = [pixelateFilter];
        image.applyFilters();
    }
    
    // 듀오톤 효과 함수
    function applyDuotoneEffect(image, progress, settings) {
        // 그레이스케일 필터
        const grayscaleFilter = new fabric.Image.filters.Grayscale();
        
        // 컬러 블렌드 필터 (주기적으로 변화)
        const blendIntensity = 0.5 + Math.sin(progress * Math.PI * 2) * 0.2;
        const blendFilter = new fabric.Image.filters.BlendColor({
            color: settings.colorDark,
            mode: 'tint',
            opacity: blendIntensity
        });
        
        // 필터 적용
        image.filters = [grayscaleFilter, blendFilter];
        image.applyFilters();
    }
    
    // 3D 분할 효과 함수
    function apply3DSplitEffect(image, progress, settings) {
        // 원본 이미지 상태 저장
        const originalLeft = image.left;
        const originalTop = image.top;
        
        // 분할 거리 계산 (시간에 따라 변화)
        const distance = settings.distance * Math.sin(progress * Math.PI * 2);
        const rotation = settings.rotation * Math.sin(progress * Math.PI * 2);
        
        // 이미지 위치 업데이트
        image.set({
            left: originalLeft + distance,
            top: originalTop,
            angle: rotation
        });
        
        // 컬러 블렌드 필터 (빨간색 채널)
        const redFilter = new fabric.Image.filters.BlendColor({
            color: '#FF0000',
            mode: 'tint',
            opacity: 0.5
        });
        
        // 필터 적용
        image.filters = [redFilter];
        image.applyFilters();
        
        // 두 번째 이미지 (청록색 채널) 생성은 복잡하므로 실제 구현 시 별도 처리 필요
    }
    
    // 미러 효과 함수
    function applyMirrorEffect(image, progress, settings) {
        // 방향에 따른 처리
        if (settings.direction === 'horizontal' || settings.direction === 'both') {
            // 수평 반전
            image.set({
                flipX: progress > 0.5
            });
        }
        
        if (settings.direction === 'vertical' || settings.direction === 'both') {
            // 수직 반전
            image.set({
                flipY: progress > 0.5
            });
        }
        
        // 오프셋 적용 (이미지 이동)
        const offset = settings.offset * Math.sin(progress * Math.PI * 2);
        image.set({
            left: image.left + offset,
            top: image.top + offset
        });
    }
    
    // 만화경 효과 함수
    function applyKaleidoscopeEffect(image, progress, settings) {
        // 회전 각도 계산
        const angle = settings.angle + progress * 360;
        
        // 회전 적용
        image.set({
            angle: angle
        });
        
        // 캔버스 중앙을 기준으로 회전 설정
        image.setOriginPoint({
            x: canvas.width / 2,
            y: canvas.height / 2
        });
        
        // 캔버스 중앙에 위치시키기
        image.set({
            left: canvas.width / 2,
            top: canvas.height / 2
        });
        
        // 필터 (색상 변화)
        const hueFilter = new fabric.Image.filters.HueRotation({
            rotation: progress * 2 * Math.PI
        });
        
        // 필터 적용
        image.filters = [hueFilter];
        image.applyFilters();
    }
    
    // 모션 블러 효과 함수
    function applyMotionBlurEffect(image, progress, settings) {
        // 블러 정도 계산
        const blurAmount = settings.intensity * (0.5 + Math.sin(progress * Math.PI * 2) * 0.5);
        
        // 방향에 따른 처리
        let offsetX = 0;
        let offsetY = 0;
        
        if (settings.direction === 'horizontal') {
            offsetX = blurAmount;
        } else if (settings.direction === 'vertical') {
            offsetY = blurAmount;
        } else {
            // 방사형 블러는 웹 구현 한계로 이동 효과로 대체
            offsetX = Math.cos(progress * Math.PI * 2) * blurAmount;
            offsetY = Math.sin(progress * Math.PI * 2) * blurAmount;
        }
        
        // 이미지 위치 업데이트
        image.set({
            left: image.left + offsetX,
            top: image.top + offsetY
        });
        
        // 블러 필터 (웹에서는 제한적 구현)
        // fabric.js에서는 직접적인 모션 블러 필터가 없어서 
        // 실제 모션 블러 구현은 캔버스를 복제하여 여러 위치에 그리는 방식으로 구현해야 함
    }
    
    // 텍스트 애니메이션 설정
    function setTextEffect(effect) {
        selectedTextEffect = effect;
        console.log('텍스트 애니메이션 설정:', effect);
        
        // 버튼 스타일 업데이트
        textAnimButtons.forEach(btn => {
            if (btn.dataset.effect === effect) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // 선택된 텍스트 객체에 효과 적용 (실시간)
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'text') {
            activeObject.animationEffect = effect;
            // 즉시 효과 적용 실행
            applyTextEffectPreview(activeObject);
            canvas.renderAll();
        }
        
        // 프레임에 변경 사항 저장
        saveCurrentFrame();
    }
    
    // 텍스트 효과 미리보기 적용 함수
    function applyTextEffectPreview(textObj) {
        if (!textObj || textObj.type !== 'text') return;
        
        // 기존 애니메이션 중지
        if (textObj.animationId) {
            cancelAnimationFrame(textObj.animationId);
            textObj.animationId = null;
        }
        
        // 원래 값 저장 (나중에 복원하기 위해)
        if (!textObj.originalProperties) {
            textObj.originalProperties = {
                scaleX: textObj.scaleX,
                scaleY: textObj.scaleY,
                opacity: textObj.opacity,
                top: textObj.top,
                angle: textObj.angle,
                left: textObj.left,
                text: textObj.text
            };
        }
        
        const effect = textObj.animationEffect;
        
        // 'none' 효과는 애니메이션하지 않음
        if (effect === 'none') {
            // 원래 상태로 복원
            textObj.set({
                scaleX: textObj.originalProperties.scaleX,
                scaleY: textObj.originalProperties.scaleY,
                opacity: textObj.originalProperties.opacity,
                angle: textObj.originalProperties.angle,
                top: textObj.originalProperties.top,
                left: textObj.originalProperties.left,
                text: textObj.originalProperties.text
            });
            canvas.renderAll();
            return;
        }
        
        // 애니메이션을 위한 시작 시간 기록
        textObj.animationStartTime = Date.now();
        
        // 애니메이션 함수
        function animateEffect() {
            // 경과 시간 계산 (밀리초)
            const elapsed = Date.now() - textObj.animationStartTime;
            // 2초 주기로 애니메이션 반복 (0~1 범위의 progress)
            const progress = (elapsed % 2000) / 2000;
            
            // 원래 상태로 복원
            textObj.set({
                scaleX: textObj.originalProperties.scaleX,
                scaleY: textObj.originalProperties.scaleY,
                opacity: textObj.originalProperties.opacity,
                angle: textObj.originalProperties.angle,
                top: textObj.originalProperties.top,
                left: textObj.originalProperties.left,
                text: textObj.originalProperties.text
            });
            
            // 선택된 효과에 따라 애니메이션 적용
            switch (effect) {
                case 'fadeIn':
                    // 페이드인 효과 (투명 -> 불투명 반복)
                    textObj.set('opacity', progress);
                    break;
                    
                case 'bounceIn':
                    // 바운스 효과 (0.8배 -> 1.2배 반복)
                    const bounceScale = 0.8 + 0.4 * Math.sin(progress * Math.PI * 2);
                    textObj.set({
                        scaleX: textObj.originalProperties.scaleX * bounceScale,
                        scaleY: textObj.originalProperties.scaleY * bounceScale
                    });
                    break;
                    
                case 'slideUp':
                    // 슬라이드 효과 (위아래로 20px 이동)
                    const slideOffset = 20 * Math.sin(progress * Math.PI * 2);
                    textObj.set({
                        top: textObj.originalProperties.top + slideOffset
                    });
                    break;
                    
                case 'typewriter':
                    // 타이핑 효과 (텍스트 일부만 표시 후 다시 사라짐)
                    const fullText = textObj.originalProperties.text;
                    let visibleLength;
                    if (progress < 0.5) {
                        // 처음 절반은 점점 늘어남
                        visibleLength = Math.ceil(fullText.length * (progress * 2));
                    } else {
                        // 나머지 절반은 점점 줄어듦
                        visibleLength = Math.ceil(fullText.length * (2 - progress * 2));
                    }
                    textObj.set('text', fullText.substring(0, visibleLength));
                    break;
                    
                case 'pulse':
                    // 펄스 효과 (크기 변화)
                    const pulseScale = 1 + 0.2 * Math.sin(progress * Math.PI * 4);
                    textObj.set({
                        scaleX: textObj.originalProperties.scaleX * pulseScale,
                        scaleY: textObj.originalProperties.scaleY * pulseScale
                    });
                    break;
            }
            
            // 캔버스 업데이트
            canvas.renderAll();
            
            // 애니메이션 계속 유지
            textObj.animationId = requestAnimationFrame(animateEffect);
        }
        
        // 애니메이션 시작
        textObj.animationId = requestAnimationFrame(animateEffect);
    }
    
    // 미리보기 생성
    function createPreview() {
        if (!canvas || !backgroundImage) {
            alert('이미지를 먼저 업로드해 주세요.');
            return;
        }
        
        // 미리보기 컨테이너 초기화
        previewDisplay.innerHTML = '';
        
        // 프레임 생성을 위한 캔버스 복제
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        const previewCtx = previewCanvas.getContext('2d');
        
        // 애니메이션 설정
        const duration = parseFloat(animationDuration.value) * 1000; // 밀리초 단위로 변환
        const frames = parseInt(animationFrames.value);
        const frameDelay = duration / frames;
        
        // 이미지 객체 생성
        const previewImg = document.createElement('img');
        previewImg.style.maxWidth = '100%';
        previewImg.style.maxHeight = '300px';
        previewDisplay.appendChild(previewImg);
        
        // 프레임 시퀀스 생성
        let frameSequence = [];
        for (let i = 0; i < frames; i++) {
            // 현재 프레임의 진행도 (0~1)
            const progress = i / (frames - 1);
            
            // 캔버스 내용 복제
            const frameCanvas = cloneCanvas();
            
            // 배경 이미지에 효과 적용
            applyEffectToImage(frameCanvas, progress);
            
            // 텍스트에 애니메이션 적용
            applyTextAnimations(frameCanvas, progress);
            
            // 프레임 캡처
            frameSequence.push(frameCanvas.toDataURL());
        }
        
        // 첫 번째 프레임을 미리보기 이미지로 설정
        previewImg.src = frameSequence[0];
        
        // 프레임 시퀀스를 저장
        canvas.frameSequence = frameSequence;
        
        alert('미리보기가 준비되었습니다. GIF 생성 버튼을 눌러 애니메이션 GIF를 생성하세요.');
    }
    
    // 캔버스 복제 함수
    function cloneCanvas() {
        const cloneCanvas = document.createElement('canvas');
        cloneCanvas.width = canvas.width;
        cloneCanvas.height = canvas.height;
        const cloneCtx = cloneCanvas.getContext('2d');
        
        // 캔버스 배경색 설정
        cloneCtx.fillStyle = canvas.backgroundColor || '#ffffff';
        cloneCtx.fillRect(0, 0, cloneCanvas.width, cloneCanvas.height);
        
        // 캔버스 내용을 이미지로 변환하여 복제
        const dataURL = canvas.toDataURL('image/png');
        const img = new Image();
        img.src = dataURL;
        
        // 동기식으로 처리하기 위한 방법
        cloneCtx.drawImage(img, 0, 0);
        
        return cloneCanvas;
    }
    
    // 이미지에 효과 적용
    function applyEffectToImage(targetCanvas, progress) {
        const ctx = targetCanvas.getContext('2d');
        
        // 이미지 효과 적용
        switch (selectedEffect) {
            case 'fadeIn':
                ctx.globalAlpha = progress;
                break;
                
            case 'fadeOut':
                ctx.globalAlpha = 1 - progress;
                break;
                
            case 'zoomIn':
                // 줌인 효과 (0.5배에서 1배로)
                const zoomInScale = 0.5 + (0.5 * progress);
                applyZoom(ctx, targetCanvas.width / 2, targetCanvas.height / 2, zoomInScale);
                break;
                
            case 'zoomOut':
                // 줌아웃 효과 (1.5배에서 1배로)
                const zoomOutScale = 1.5 - (0.5 * progress);
                applyZoom(ctx, targetCanvas.width / 2, targetCanvas.height / 2, zoomOutScale);
                break;
                
            case 'slideUp':
                // 아래에서 위로 슬라이드
                const slideUpOffset = targetCanvas.height * (1 - progress);
                ctx.translate(0, slideUpOffset);
                break;
                
            case 'slideDown':
                // 위에서 아래로 슬라이드
                const slideDownOffset = -targetCanvas.height * (1 - progress);
                ctx.translate(0, slideDownOffset);
                break;
                
            case 'pulse':
                // 펄스 효과 (1배에서 1.2배까지 진동)
                const pulseScale = 1 + 0.2 * Math.sin(progress * Math.PI * 2);
                applyZoom(ctx, targetCanvas.width / 2, targetCanvas.height / 2, pulseScale);
                break;
                
            case 'shake':
                // 흔들림 효과
                const shakeAmount = 10 * Math.sin(progress * Math.PI * 8);
                ctx.translate(shakeAmount, 0);
                break;
                
            case 'rotate':
                // 회전 효과 (0도에서 360도)
                const angle = progress * 2 * Math.PI;
                ctx.translate(targetCanvas.width / 2, targetCanvas.height / 2);
                ctx.rotate(angle);
                ctx.translate(-targetCanvas.width / 2, -targetCanvas.height / 2);
                break;
                
            case 'blur':
                // 이 효과는 CSS 필터를 사용하는 것이 더 좋을 수 있지만
                // 캔버스에서는 직접적인 blur 필터 적용이 어려움
                // 실제 구현은 여기서 생략
                break;
                
            default:
                // 효과 없음
                break;
        }
    }
    
    // 줌 효과 적용 함수
    function applyZoom(ctx, centerX, centerY, scale) {
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
    }
    
    // 텍스트 애니메이션 적용
    function applyTextAnimations(targetCanvas, progress) {
        const ctx = targetCanvas.getContext('2d');
        
        // 텍스트 객체들에 애니메이션 적용
        canvas.getObjects('text').forEach((textObj, index) => {
            if (textObj === backgroundImage) return;
            
            // 원본 텍스트 속성 저장
            const originalLeft = textObj.left;
            const originalTop = textObj.top;
            const originalOpacity = textObj.opacity || 1;
            const originalScale = textObj.scaleX || 1;
            
            // 텍스트에 지정된 애니메이션 효과 적용
            const effect = textObj.animationEffect || 'none';
            
            switch (effect) {
                case 'fadeIn':
                    textObj.opacity = progress;
                    break;
                    
                case 'bounceIn':
                    // 바운스 효과
                    if (progress < 0.5) {
                        // 처음엔 빠르게 커짐
                        textObj.scaleX = textObj.scaleY = progress * 2;
                    } else {
                        // 그 다음 진동하며 정상 크기로
                        const bounce = 1 + 0.2 * Math.sin((progress - 0.5) * 2 * Math.PI * 2);
                        textObj.scaleX = textObj.scaleY = bounce;
                    }
                    break;
                    
                case 'slideUp':
                    // 아래에서 위로 슬라이드
                    textObj.top = originalTop + (targetCanvas.height * (1 - progress));
                    break;
                    
                case 'typewriter':
                    // 타이핑 효과 - 원본 텍스트를 progress에 따라 일부만 표시
                    const fullText = textObj.text;
                    const visibleLength = Math.floor(fullText.length * progress);
                    textObj.text = fullText.substring(0, visibleLength);
                    break;
                    
                case 'pulse':
                    // 펄스 효과
                    const pulseScale = 1 + 0.3 * Math.sin(progress * Math.PI * 2);
                    textObj.scaleX = textObj.scaleY = pulseScale;
                    break;
                    
                default:
                    // 효과 없음
                    break;
            }
        });
        
        // 변경된 상태로 캔버스 다시 렌더링
        canvas.renderAll();
    }
    
    // GIF 생성
    function createGIF() {
        // 모든 프레임 상태 저장 확인
        saveCurrentFrame();
        
        // GIF 라이브러리 확인
        if (!gifLibraryLoaded) {
            loadGifshot()
                .then(() => {
                    gifLibraryLoaded = true;
                    createGIF();
                })
                .catch(error => {
                    alert('GIF 생성 라이브러리를 로드할 수 없습니다. 다시 시도해 주세요.');
                    console.error('GIF 라이브러리 로드 실패:', error);
                });
            return;
        }
        
        // GIF 생성 시작 메시지
        createGifBtn.disabled = true;
        createGifBtn.textContent = 'GIF 생성 중...';
        
        // 애니메이션 설정
        const duration = parseFloat(animationDuration.value) * 1000; // 밀리초 단위로 변환
        const frameDelay = duration / frames.length;
        const loops = parseInt(loopCount.value);
        
        // 프레임 이미지 배열 생성
        const frameImages = frames.map(frame => frame.dataURL);
        
        // gifshot 라이브러리로 GIF 생성
        gifshot.createGIF({
            images: frameImages,
            gifWidth: canvas.width,
            gifHeight: canvas.height,
            interval: frameDelay / 1000, // 초 단위로 변환
            numFrames: frames.length,
            frameDuration: frameDelay,
            sampleInterval: 10, // 품질과 파일 크기의 균형을 위한 값
            progressCallback: function(progress) {
                console.log('GIF 생성 진행률:', Math.round(progress * 100) + '%');
            }
        }, function(obj) {
            if (!obj.error) {
                // GIF 생성 성공
                console.log('GIF 생성 완료');
                
                // 미리보기에 최종 GIF 표시
                const previewImg = previewDisplay.querySelector('img');
                if (previewImg) {
                    previewImg.src = obj.image;
                } else {
                    const newImg = document.createElement('img');
                    newImg.src = obj.image;
                    previewDisplay.innerHTML = '';
                    previewDisplay.appendChild(newImg);
                }
                
                // 다운로드 링크 설정
                downloadGifLink.href = obj.image;
                downloadGifLink.style.display = 'inline-block';
                
                // 버튼 상태 복원
                createGifBtn.disabled = false;
                createGifBtn.textContent = 'GIF 생성';
                
                alert('GIF가 생성되었습니다. 다운로드 버튼을 클릭하여 저장하세요.');
            } else {
                console.error('GIF 생성 실패:', obj.error);
                alert('GIF 생성 중 오류가 발생했습니다: ' + obj.error);
                
                // 버튼 상태 복원
                createGifBtn.disabled = false;
                createGifBtn.textContent = 'GIF 생성';
            }
        });
    }
    
    // 에디터 초기화
    function resetEditor() {
        if (canvas) {
            canvas.clear();
            canvas.backgroundColor = '#ffffff';
            canvas.renderAll();
        }
        
        // 배경 이미지 리셋
        backgroundImage = null;
        
        // 효과 리셋
        selectedEffect = 'none';
        selectedTextEffect = 'none';
        
        // 버튼 상태 리셋
        effectButtons.forEach(btn => btn.classList.remove('active'));
        textAnimButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('.effect-btn[data-effect="none"]').classList.add('active');
        document.querySelector('.text-anim-btn[data-effect="none"]').classList.add('active');
        
        // 텍스트 입력 필드 리셋
        textContent.value = '';
        boldBtn.classList.remove('active');
        italicBtn.classList.remove('active');
        underlineBtn.classList.remove('active');
        strokeBtn.classList.remove('active');
        
        // 미리보기 리셋
        previewDisplay.innerHTML = '<p class="no-preview">미리보기를 생성하려면 이미지를 업로드하고 효과를 선택한 후 미리보기 버튼을 클릭하세요.</p>';
        
        // 다운로드 링크 숨기기
        downloadGifLink.style.display = 'none';
        
        // 프레임 초기화
        frames = [];
        currentFrameIndex = 0;
        updateFramesContainer();
        updateFrameControls();
        
        // 재생 중지
        stopPlayback();
        
        // 안내 텍스트 추가
        const guideText = new fabric.Text('이미지를 업로드해 주세요', {
            left: canvas.width / 2,
            top: canvas.height / 2,
            fontSize: 20,
            originX: 'center',
            originY: 'center',
            fill: '#999999'
        });
        canvas.add(guideText);
        canvas.renderAll();
    }
    
    // 미디어 탭 전환 기능
    function setupMediaTabs() {
        mediaTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 모든 탭 비활성화
                mediaTabs.forEach(t => t.classList.remove('active'));
                mediaContents.forEach(c => c.classList.remove('active'));
                
                // 선택된 탭 활성화
                tab.classList.add('active');
                const tabId = tab.dataset.tab;
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }
    
    // 미디어 아이템 업로드 처리
    function handleMediaUpload(e) {
        const files = e.target.files;
        if (!files.length) return;
        
        for (const file of files) {
            if (!file.type.match('image.*')) continue;
            
            const reader = new FileReader();
            reader.onload = function(evt) {
                const imgURL = evt.target.result;
                
                // 미디어 아이템 객체 생성
                const mediaItem = {
                    id: 'media_' + Date.now() + '_' + mediaItems.length,
                    type: 'image',
                    url: imgURL,
                    filename: file.name,
                    added: new Date()
                };
                
                // 미디어 아이템 배열에 추가
                mediaItems.push(mediaItem);
                
                // UI에 미디어 아이템 추가
                addMediaItemToUI(mediaItem);
            };
            reader.readAsDataURL(file);
        }
    }
    
    // 미디어 아이템을 UI에 추가하는 함수
    function addMediaItemToUI(mediaItem) {
        const mediaItemEl = document.createElement('div');
        mediaItemEl.className = 'media-item';
        mediaItemEl.dataset.id = mediaItem.id;
        
        // 이미지 요소 생성
        const img = document.createElement('img');
        img.src = mediaItem.url;
        mediaItemEl.appendChild(img);
        
        // 컨트롤 요소 생성
        const controls = document.createElement('div');
        controls.className = 'media-item-controls';
        
        // 미리보기 버튼
        const previewBtn = document.createElement('button');
        previewBtn.className = 'media-item-btn preview-btn';
        previewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        previewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            previewMediaItem(mediaItem);
        });
        controls.appendChild(previewBtn);
        
        // 추가 버튼
        const addBtn = document.createElement('button');
        addBtn.className = 'media-item-btn add-btn';
        addBtn.innerHTML = '<i class="fas fa-plus"></i>';
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addMediaItemToCanvas(mediaItem);
        });
        controls.appendChild(addBtn);
        
        // 삭제 버튼
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'media-item-btn delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteMediaItem(mediaItem.id);
        });
        controls.appendChild(deleteBtn);
        
        mediaItemEl.appendChild(controls);
        
        // 클릭 이벤트 추가
        mediaItemEl.addEventListener('click', () => {
            addMediaItemToCanvas(mediaItem);
        });
        
        // 미디어 아이템 컨테이너에 추가
        mediaItemsContainer.appendChild(mediaItemEl);
    }
    
    // 미디어 아이템 삭제
    function deleteMediaItem(id) {
        // 배열에서 제거
        mediaItems = mediaItems.filter(item => item.id !== id);
        
        // UI에서 제거
        const itemEl = document.querySelector(`.media-item[data-id="${id}"]`);
        if (itemEl) {
            itemEl.remove();
        }
    }
    
    // 미디어 아이템 미리보기
    function previewMediaItem(mediaItem) {
        // 미리보기 영역에 이미지 표시
        const previewImg = previewDisplay.querySelector('img') || document.createElement('img');
        previewImg.src = mediaItem.url;
        
        // 미리보기 영역에 추가
        if (!previewDisplay.contains(previewImg)) {
            previewDisplay.innerHTML = '';
            previewDisplay.appendChild(previewImg);
        }
    }
    
    // 미디어 아이템을 캔버스에 추가
    function addMediaItemToCanvas(mediaItem) {
        if (!canvas) return;
        
        fabric.Image.fromURL(mediaItem.url, function(img) {
            // 캔버스 크기에 맞게 이미지 크기 조정
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            // 이미지 비율 유지하며 크기 조정
            if (img.width > img.height) {
                // 가로가 긴 이미지
                const scale = canvasWidth / img.width;
                img.scaleToWidth(canvasWidth * 0.8);
                if (img.getScaledHeight() > canvasHeight) {
                    img.scaleToHeight(canvasHeight * 0.8);
                }
            } else {
                // 세로가 긴 이미지
                const scale = canvasHeight / img.height;
                img.scaleToHeight(canvasHeight * 0.8);
                if (img.getScaledWidth() > canvasWidth) {
                    img.scaleToWidth(canvasWidth * 0.8);
                }
            }
            
            // 캔버스 중앙에 이미지 배치
            img.set({
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                originX: 'center',
                originY: 'center'
            });
            
            // 배경 이미지가 없을 경우 배경으로 설정
            if (!backgroundImage) {
                backgroundImage = img;
            }
            
            // 캔버스에 이미지 추가
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            
            // 프레임 상태 저장
            saveCurrentFrame();
        });
    }
    
    // 오디오 미리 듣기
    function previewAudio(index) {
        // 오디오 미리 듣기 구현 (예시)
        alert(`오디오 ${index+1} 미리 듣기 기능이 구현될 예정입니다.`);
    }
    
    // 오디오 추가
    function addAudioToTimeline(index) {
        // 타임라인에 오디오 추가 구현 (예시)
        alert(`오디오 ${index+1}가 타임라인에 추가될 예정입니다.`);
    }
    
    // 트랜지션 선택
    function selectTransition(type) {
        // 모든 트랜지션 비활성화
        transitionItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // 선택된 트랜지션 활성화
        const selectedItem = document.querySelector(`.transition-item[data-transition="${type}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // 선택된 트랜지션 저장
        selectedTransition = type;
        console.log(`트랜지션 선택: ${type}`);
    }
    
    // 이벤트 리스너 설정
    function setupEventListeners() {
        // 기존 이벤트 리스너
        if (imageUpload) {
            imageUpload.addEventListener('change', handleImageUpload);
        }
        
        if (addTextBtn) {
            addTextBtn.addEventListener('click', addText);
        }
        
        if (boldBtn) boldBtn.addEventListener('click', () => boldBtn.classList.toggle('active'));
        if (italicBtn) italicBtn.addEventListener('click', () => italicBtn.classList.toggle('active'));
        if (underlineBtn) underlineBtn.addEventListener('click', () => underlineBtn.classList.toggle('active'));
        if (strokeBtn) strokeBtn.addEventListener('click', () => strokeBtn.classList.toggle('active'));
        
        effectButtons.forEach(button => {
            button.addEventListener('click', () => setImageEffect(button.dataset.effect));
        });
        
        textAnimButtons.forEach(button => {
            button.addEventListener('click', () => setTextEffect(button.dataset.effect));
        });
        
        if (previewBtn) {
            previewBtn.addEventListener('click', createPreview);
        }
        
        if (createGifBtn) {
            createGifBtn.addEventListener('click', createGIF);
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', resetEditor);
        }
        
        if (addFrameBtn) {
            addFrameBtn.addEventListener('click', addFrame);
        }
        
        if (deleteFrameBtn) {
            deleteFrameBtn.addEventListener('click', deleteFrame);
        }
        
        if (duplicateFrameBtn) {
            duplicateFrameBtn.addEventListener('click', duplicateFrame);
        }
        
        if (playFramesBtn) {
            playFramesBtn.addEventListener('click', togglePlayback);
        }
        
        if (frameScrubber) {
            frameScrubber.addEventListener('input', function() {
                if (isPlaying) {
                    stopPlayback();
                }
                
                selectFrame(parseInt(this.value));
            });
        }
        
        if (canvas) {
            canvas.on('object:modified', () => saveCurrentFrame());
            canvas.on('object:added', () => saveCurrentFrame());
            canvas.on('object:removed', () => saveCurrentFrame());
        }
        
        // 추가 이벤트 리스너
        setupMediaTabs();
        setupAdditionalEventListeners();
    }
    
    // 페이지 초기화
    function init() {
        initCanvas();
        setupEventListeners();
        setupEffectSettingListeners();
        initMediaLibrary();
        
        // 기본 효과 선택
        setImageEffect('none');
        setTextEffect('none');
        
        // 프레임 컨트롤 초기화
        updateFrameControls();
    }
    
    // 미디어 라이브러리 초기화
    function initMediaLibrary() {
        // 기본 오디오 아이템 설정
        audioItems = [...defaultAudioItems];
        
        // 미디어 탭 설정
        setupMediaTabs();
        
        // 샘플 이미지 추가 (실제 구현 시 제거 또는 리소스 확인 후 추가)
        if (mediaItemsContainer && mediaItemsContainer.children.length === 0) {
            // 샘플 이미지가 실제로 있는 경우에만 추가
            console.log('미디어 라이브러리 초기화: 샘플 이미지 추가 준비됨');
        }
    }
    
    // 프레임 UI 컨테이너 업데이트
    function updateFramesContainer() {
        if (!framesContainer) return;
        
        framesContainer.innerHTML = '';
        
        frames.forEach((frame, index) => {
            const frameItem = document.createElement('div');
            frameItem.className = `frame-item ${index === currentFrameIndex ? 'active' : ''}`;
            frameItem.dataset.index = index;
            
            // 프레임 썸네일 이미지
            const frameImage = document.createElement('img');
            frameImage.src = frame.dataURL;
            frameItem.appendChild(frameImage);
            
            // 프레임 번호 표시
            const frameNumber = document.createElement('div');
            frameNumber.className = 'frame-number';
            frameNumber.textContent = index + 1;
            frameItem.appendChild(frameNumber);
            
            // 프레임 재생 시간 표시
            const frameDuration = document.createElement('div');
            frameDuration.className = 'frame-duration';
            frameDuration.textContent = (frame.duration || 0.1).toFixed(1) + 's';
            frameItem.appendChild(frameDuration);
            
            // 프레임 액션 버튼들
            const frameActions = document.createElement('div');
            frameActions.className = 'frame-actions';
            
            // 설정 버튼
            const settingsBtn = document.createElement('button');
            settingsBtn.className = 'frame-action-btn';
            settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const duration = prompt('프레임 지속 시간(초):', (frame.duration || 0.1).toFixed(1));
                if (duration !== null) {
                    setFrameDuration(index, parseFloat(duration));
                }
            });
            frameActions.appendChild(settingsBtn);
            
            frameItem.appendChild(frameActions);
            
            // 프레임 클릭 이벤트
            frameItem.addEventListener('click', () => {
                selectFrame(index);
            });
            
            // 드래그 앤 드롭 기능 (선택 사항)
            if (typeof frameItem.draggable !== 'undefined') {
                frameItem.draggable = true;
                
                frameItem.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', index.toString());
                    frameItem.classList.add('dragging');
                });
                
                frameItem.addEventListener('dragend', () => {
                    frameItem.classList.remove('dragging');
                });
                
                frameItem.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    frameItem.classList.add('drag-over');
                });
                
                frameItem.addEventListener('dragleave', () => {
                    frameItem.classList.remove('drag-over');
                });
                
                frameItem.addEventListener('drop', (e) => {
                    e.preventDefault();
                    frameItem.classList.remove('drag-over');
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    moveFrame(fromIndex, index);
                });
            }
            
            framesContainer.appendChild(frameItem);
        });
        
        // 프레임 수 표시 업데이트
        if (totalFramesEl) totalFramesEl.textContent = frames.length;
        if (currentFrameEl) currentFrameEl.textContent = currentFrameIndex + 1;
        
        // 스크러버 범위 업데이트
        if (frameScrubber) {
            frameScrubber.max = Math.max(1, frames.length - 1);
            frameScrubber.value = currentFrameIndex;
        }
    }
    
    // 프레임 위치 변경 (드래그 앤 드롭용)
    function moveFrame(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= frames.length || 
            toIndex < 0 || toIndex >= frames.length || 
            fromIndex === toIndex) {
            return;
        }
        
        // 현재 프레임 저장
        saveCurrentFrame();
        
        // 프레임 배열에서 이동
        const frameToMove = frames.splice(fromIndex, 1)[0];
        frames.splice(toIndex, 0, frameToMove);
        
        // 현재 프레임 인덱스 업데이트
        if (currentFrameIndex === fromIndex) {
            currentFrameIndex = toIndex;
        } else if (currentFrameIndex > fromIndex && currentFrameIndex <= toIndex) {
            currentFrameIndex--;
        } else if (currentFrameIndex < fromIndex && currentFrameIndex >= toIndex) {
            currentFrameIndex++;
        }
        
        // UI 업데이트
        updateFramesContainer();
    }
    
    // 미디어 라이브러리 탭 기능 설정
    function setupMediaTabs() {
        if (!mediaTabs || mediaTabs.length === 0) return;
        
        mediaTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 모든 탭 비활성화
                mediaTabs.forEach(t => t.classList.remove('active'));
                mediaContents.forEach(c => c.classList.remove('active'));
                
                // 선택된 탭 활성화
                tab.classList.add('active');
                const tabId = tab.dataset.tab + '-tab';
                const contentEl = document.getElementById(tabId);
                if (contentEl) {
                    contentEl.classList.add('active');
                }
            });
        });
    }
    
    // 이벤트 리스너 설정 업데이트
    function setupEventListeners() {
        // 기존 이벤트 리스너
        // 이미지 업로드
        if (imageUpload) {
            imageUpload.addEventListener('change', handleImageUpload);
        }
        
        // 미디어 라이브러리 이벤트 리스너
        if (mediaUploadInput) {
            mediaUploadInput.addEventListener('change', handleMediaUpload);
        }
        
        // 오디오 업로드 이벤트 리스너
        if (audioUploadInput) {
            audioUploadInput.addEventListener('change', (e) => {
                // 오디오 업로드 처리 (간단한 알림으로 대체)
                alert('오디오 업로드 기능이 구현될 예정입니다.');
            });
        }
        
        // 프레임 타임라인 버튼 이벤트 리스너
        if (addFrameBtn) {
            addFrameBtn.addEventListener('click', addFrame);
        }
        
        if (deleteFrameBtn) {
            deleteFrameBtn.addEventListener('click', deleteFrame);
        }
        
        if (duplicateFrameBtn) {
            duplicateFrameBtn.addEventListener('click', duplicateFrame);
        }
        
        if (playFramesBtn) {
            playFramesBtn.addEventListener('click', togglePlayback);
        }
        
        // 프레임 이동 버튼
        if (prevFrameBtn) {
            prevFrameBtn.addEventListener('click', () => {
                if (currentFrameIndex > 0) {
                    selectFrame(currentFrameIndex - 1);
                }
            });
        }
        
        if (nextFrameBtn) {
            nextFrameBtn.addEventListener('click', () => {
                if (currentFrameIndex < frames.length - 1) {
                    selectFrame(currentFrameIndex + 1);
                }
            });
        }
        
        if (goToStartBtn) {
            goToStartBtn.addEventListener('click', () => {
                if (frames.length > 0) {
                    selectFrame(0);
                }
            });
        }
        
        if (goToEndBtn) {
            goToEndBtn.addEventListener('click', () => {
                if (frames.length > 0) {
                    selectFrame(frames.length - 1);
                }
            });
        }
        
        // 텍스트 추가 버튼
        if (addTextBtn) {
            addTextBtn.addEventListener('click', addText);
        }
        
        // 이미지 효과 버튼
        effectButtons.forEach(button => {
            button.addEventListener('click', () => setImageEffect(button.dataset.effect));
        });
        
        // 텍스트 애니메이션 버튼
        textAnimButtons.forEach(button => {
            button.addEventListener('click', () => setTextEffect(button.dataset.effect));
        });
        
        // 미리보기 버튼
        if (previewBtn) {
            previewBtn.addEventListener('click', createPreview);
        }
        
        // GIF 생성 버튼
        if (createGifBtn) {
            createGifBtn.addEventListener('click', createGIF);
        }
        
        // 초기화 버튼
        if (resetBtn) {
            resetBtn.addEventListener('click', resetEditor);
        }
        
        // 미디어 탭 설정
        setupMediaTabs();
        
        // 트랜지션 선택 이벤트
        if (transitionItems && transitionItems.length > 0) {
            transitionItems.forEach(item => {
                item.addEventListener('click', () => {
                    transitionItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    selectedTransition = item.dataset.transition;
                    console.log('선택된 트랜지션:', selectedTransition);
                });
            });
        }
        
        // 오디오 기능 버튼 리스너
        if (audioPreviewBtns && audioPreviewBtns.length > 0) {
            audioPreviewBtns.forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    alert(`오디오 ${index + 1} 미리 듣기`);
                });
            });
        }
        
        if (audioAddBtns && audioAddBtns.length > 0) {
            audioAddBtns.forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    alert(`오디오 ${index + 1} 타임라인에 추가`);
                });
            });
        }
        
        // 스크러버 이벤트 리스너
        if (frameScrubber) {
            frameScrubber.addEventListener('input', function() {
                // 재생 중지
                if (isPlaying) stopPlayback();
                
                // 프레임 선택
                selectFrame(parseInt(this.value));
            });
        }
    }
    
    // 미디어 업로드 처리 함수
    function handleMediaUpload(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (file.type.startsWith('image/')) {
                // 이미지 파일 처리
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const imgURL = evt.target.result;
                    // 미디어 라이브러리에 추가
                    addToMediaLibrary(imgURL, file.name, 'image');
                };
                reader.readAsDataURL(file);
            }
        }
    }
    
    // 미디어 라이브러리에 아이템 추가
    function addToMediaLibrary(url, filename, type) {
        const mediaItem = {
            id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: type,
            url: url,
            filename: filename,
            added: new Date()
        };
        
        mediaItems.push(mediaItem);
        
        // UI에 추가
        addMediaItemToUI(mediaItem);
    }
    
    // 미디어 아이템을 UI에 추가
    function addMediaItemToUI(item) {
        if (!mediaItemsContainer) return;
        
        const mediaItemEl = document.createElement('div');
        mediaItemEl.className = 'media-item';
        mediaItemEl.dataset.id = item.id;
        
        if (item.type === 'image') {
            const mediaImg = document.createElement('img');
            mediaImg.src = item.url;
            mediaItemEl.appendChild(mediaImg);
            
            const controls = document.createElement('div');
            controls.className = 'media-item-controls';
            
            // 미리보기 버튼
            const previewBtn = document.createElement('button');
            previewBtn.className = 'media-item-btn';
            previewBtn.innerHTML = '<i class="fas fa-eye"></i>';
            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                previewMediaItem(item);
            });
            controls.appendChild(previewBtn);
            
            // 추가 버튼
            const addBtn = document.createElement('button');
            addBtn.className = 'media-item-btn';
            addBtn.innerHTML = '<i class="fas fa-plus"></i>';
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addMediaItemToCanvas(item);
            });
            controls.appendChild(addBtn);
            
            mediaItemEl.appendChild(controls);
            
            // 클릭 이벤트
            mediaItemEl.addEventListener('click', () => {
                addMediaItemToCanvas(item);
            });
        }
        
        mediaItemsContainer.appendChild(mediaItemEl);
    }
    
    // 미디어 라이브러리 초기화
    function initMediaLibrary() {
        // 기본 오디오 아이템 설정
        audioItems = [...defaultAudioItems];
        
        // 미디어 탭 설정
        setupMediaTabs();
    }
    
    // 애플리케이션 시작
    init();
}); 