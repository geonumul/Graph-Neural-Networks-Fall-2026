# GNN 회독 스터디

그래프 신경망(2026 가을) 개인 공부용 정적 사이트입니다. 빌드 없이 그대로 배포합니다.

- 주차별 강의 회독: 1회독 큰 그림, 2회독 자세히, 3회독 기출, 4회독 코드
- 정리 슬라이드, 용어 카드, 기출 스타일 문제은행(기본, 심화), 모의고사, 오답노트
- 공부 기록은 이 브라우저(localStorage)에 저장됩니다. 기기를 옮길 때는 오답노트 화면의 "기록 내보내기, 가져오기"를 쓰세요.

## 배포 (Vercel)
1. Vercel 에서 이 저장소를 Import
2. Framework Preset: Other, Build Command: 비움, Output Directory: 비움(루트)
3. Deploy

`data/`, `assets/`, `img/` 는 원본 작업 폴더의 `build_site.py` 가 생성합니다.
