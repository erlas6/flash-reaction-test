let trials = 0;
let startTime = 0;
let targetCell = null;
let timeoutId = null;  // ⭐ 노란불 타이머 저장용

const records = [];
const lastMousePos = { x: 0, y: 0 };

const directions = ["north", "east", "south", "west"];
const cells = {
  north: document.getElementById("north"),
  east: document.getElementById("east"),
  south: document.getElementById("south"),
  west: document.getElementById("west"),
};

// 마우스 위치 추적 (x, y 모두 업데이트)
document.addEventListener("mousemove", (e) => {
  lastMousePos.x = e.clientX;
  lastMousePos.y = e.clientY;
});

function resetColors() {
  directions.forEach((dir) => {
    cells[dir].style.backgroundColor = "white";
  });
}

function randomDelay() {
  return 1000 + Math.random() * 2000;
}

function randomDirection() {
  return directions[Math.floor(Math.random() * directions.length)];
}

function showCenterButton() {
  document.getElementById("centerButton").style.display = "block";
}

function hideCenterButton() {
  document.getElementById("centerButton").style.display = "none";
}

function showResults() {
  const avg =
    records.reduce((a, b) => a + b, 0) / (records.length || 1);
  document.getElementById("bigAvgTime").textContent = avg.toFixed(2);

  showFunResult(avg);

  const list = document.getElementById("timesList");
  records.forEach((rt, i) => {
    const li = document.createElement("li");
    li.textContent = `시도 ${i + 1}: ${rt.toFixed(2)} ms`;
    list.appendChild(li);
  });

  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");
  const max = Math.max(...records);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  records.forEach((rt, i) => {
    const barWidth = canvas.width / records.length;
    const barHeight = (rt / max) * canvas.height;
    const x = i * barWidth;
    const y = canvas.height - barHeight;

    ctx.fillRect(x, y, barWidth * 0.8, barHeight);
    ctx.strokeRect(x, y, barWidth * 0.8, barHeight);

    ctx.fillStyle = "#000";
    ctx.fillText(rt.toFixed(2), x + barWidth * 0.4, y + 5);
    ctx.fillStyle = "#fff";
  });

  document.getElementById("resultScreen").style.display = "flex";
}

function clearResults() {
  document.getElementById("timesList").innerHTML = "";
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function nextRound() {
  if (records.length >= trials) {
    showResults();
    return;
  }

  resetColors();
  hideCenterButton();
  targetCell = cells[randomDirection()];

  // 혹시 이전 라운드에서 남아 있던 타이머가 있으면 정리
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  timeoutId = setTimeout(() => {
    targetCell.style.backgroundColor = "yellow";
    startTime = performance.now();
  }, randomDelay());
}

function getReactionResult(avg) {
  const levels = [
    { max: 200, title: "⚡ 초인적인 반응속도", stars: 5, desc: "프로게이머 뺨치는 속도. 화면 뜨기 전에 이미 눌렀다." },
    { max: 230, title: "🔥 신들린 손가락", stars: 4.5, desc: "상대가 스킬 누르기 전에 네가 먼저 피한다." },
    { max: 260, title: "⭐ 반응의 귀재", stars: 4.5, desc: "평타도 플로 피함." },
    { max: 290, title: "🐉 고대 드래곤의 반사신경", stars: 4, desc: "말파이트 궁 안 보고도 피함." },
    { max: 320, title: "🦊 아리 매혹 99% 회피러", stars: 4, desc: "쓰레쉬 그랩 무시함." },
    { max: 350, title: "👨 일반 상위 게이머", stars: 3, desc: "인간 평균치 이상, 피지컬 상위권." },
    { max: 380, title: "🐧 펭귄 반응속도", stars: 2.5, desc: "몸은 느린데 머리는 빠름. 예측으로 극복 가능!" },
    { max: 410, title: "🐢 거북이 반응속도", stars: 2, desc: "애쉬 궁 정도는 피함~" },
    { max: 440, title: "⛓ CC기 걸린 속도", stars: 1.5, desc: "핑은 20인데 손이 200핑." },
    { max: Infinity, title: "🖱 마우스 끊김", stars: 1, desc: "상남자는 맞으면서 싸운다." }
  ];

  return levels.find(level => avg <= level.max);
}

function showFunResult(avg) {
  const r = getReactionResult(avg);
  const star = "★".repeat(Math.floor(r.stars)) + (r.stars % 1 ? "☆" : "");

  document.getElementById("funResult").innerHTML = `
    <div style="margin-top:15px; font-size:24px; font-weight:700;">
      ${r.title}
    </div>
    <div style="font-size:28px; color:#ffd86b; margin:5px 0;">
      ${star}
    </div>
    <div style="font-size:18px; opacity:0.9;">
      ${r.desc}
    </div>
  `;
}

document.getElementById("startBtn").addEventListener("click", () => {
  records.length = 0;
  trials = parseInt(
    document.querySelector('input[name="trials"]:checked').value,
    10
  );

  document.getElementById("remaining").textContent = trials;
  document.getElementById("reactionTime").textContent = "0";
  document.getElementById("averageTime").textContent = "0";

  clearResults();
  showCenterButton();
});

document.getElementById("centerButton").addEventListener("click", () => {
  hideCenterButton();
  nextRound();
});

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  // F/ㄹ 외의 키는 무시
  if (key !== "f" && key !== "ㄹ") {
    return;
  }

  // 노란불(타겟)이 켜지기 전에 누름
  if (!startTime) {
    alert("아직 시작되지 않았습니다! 노란색 칸이 켜진 후 눌러주세요.");

    // 진행 중이던 라운드 완전히 취소하고 다시 중앙 점부터 시작
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    resetColors();
    targetCell = null;
    startTime = 0;
    showCenterButton();

    return;
  }

  // 아래부터는 정상 입력 처리
  const elem = document.elementFromPoint(lastMousePos.x, lastMousePos.y);

  if (elem !== targetCell) {
    alert("올바른 방향에 마우스를 위치시킨 후 F키를 눌러주세요.");
    return;
  }

  const rt = performance.now() - startTime;
  records.push(rt);

  document.getElementById("reactionTime").textContent = rt.toFixed(2);
  document.getElementById("remaining").textContent =
    trials - records.length;
  document.getElementById("averageTime").textContent = (
    records.reduce((a, b) => a + b, 0) / records.length
  ).toFixed(2);

  startTime = 0;
  targetCell.style.backgroundColor = "white";
  showCenterButton();
});

document.getElementById("retryBtn").addEventListener("click", () => {
  location.reload();
});

// =======================
// 이메일 복사 버튼 기능
// =======================
const copyBtn = document.getElementById("copyEmailBtn");
const copyMsg = document.getElementById("copyEmailMsg");
const contactEmailEl = document.getElementById("contactEmail");

if (copyBtn && copyMsg && contactEmailEl) {
  const contactEmail = contactEmailEl.textContent.trim();

  copyBtn.addEventListener("click", async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(contactEmail);
      } else {
        // 지원 안 되는 브라우저용 폴백
        const tempInput = document.createElement("input");
        tempInput.value = contactEmail;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }

      copyMsg.textContent = "복사 완료!";
      setTimeout(() => {
        copyMsg.textContent = "";
      }, 1500);
    } catch (err) {
      copyMsg.textContent = "복사 실패 😢";
      setTimeout(() => {
        copyMsg.textContent = "";
      }, 1500);
    }
  });
}
