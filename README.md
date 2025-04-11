# GIF 4등분 분할기

움직이는 GIF 파일을 업로드하면 가로세로 격자로 4등분하여 각 부분을 개별 GIF로 저장할 수 있는 웹 애플리케이션입니다.

## 기능

- GIF 파일 업로드 및 미리보기
- 애니메이션 GIF를 가로세로 격자로 4등분 분할
- 각 부분별 GIF 파일 개별 다운로드
- 모든 분할된 GIF 파일 한 번에 다운로드

## 사용 기술

- HTML, CSS, JavaScript
- 프레임워크 없이 순수 웹 기술 사용
- gif.js 라이브러리: GIF 인코딩을 위한 JavaScript 라이브러리
- gif-frames 라이브러리: GIF 프레임 추출을 위한 JavaScript 라이브러리

## 사용 방법

1. 웹페이지 접속
2. "GIF 파일 업로드" 버튼을 클릭하여 GIF 파일 선택
3. 업로드된 GIF 파일이 미리보기에 표시됨
4. 자동으로 GIF가 4등분으로 분할되어 표시됨
5. 각 부분별로 "다운로드" 버튼을 클릭하여 개별 다운로드
6. 또는 "모두 다운로드" 버튼을 클릭하여 모든 부분 한 번에 다운로드

## 로컬에서 실행하기

1. 리포지토리 복제
   ```
   git clone https://github.com/yourusername/image_cut.git
   cd image_cut
   ```

2. 간단한 웹 서버 실행 (예: Python의 SimpleHTTPServer)
   ```
   # Python 3
   python -m http.server
   
   # Python 2
   python -m SimpleHTTPServer
   ```

3. 브라우저에서 `http://localhost:8000` 접속

## 라이선스

MIT License

## 주의사항

- 대용량 GIF 파일의 경우 처리 시간이 오래 걸릴 수 있습니다.
- 브라우저 성능에 따라 처리 속도가 달라질 수 있습니다.
- 모든 브라우저에서 테스트되지 않았으므로 최신 Chrome, Firefox, Safari 등의 브라우저 사용을 권장합니다. 