const http = require('http');
const fs = require('fs');
const path = require('path');

// 서버 포트 설정 (환경 변수가 있으면 사용, 없으면 8080 기본값)
const PORT = process.env.PORT || 8080;

// MIME 타입 맵핑
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
};

// 서버 생성
const server = http.createServer((req, res) => {
    // URL에서 파일 경로 추출
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html'; // 기본 페이지
    }

    // 파일 확장자 추출
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // 파일 읽기
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 페이지를 찾을 수 없음
                fs.readFile('./404.html', (err, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // 서버 오류
                res.writeHead(500);
                res.end('서버 오류: ' + error.code);
            }
        } else {
            // 성공적으로 파일 반환
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// 서버 시작
server.listen(PORT, () => {
    console.log(`서버가 시작되었습니다: http://localhost:${PORT}`);
    console.log('서버를 종료하려면 Ctrl+C를 누르세요.');
}); 