let trials = 0;
let startTime = 0;
let targetCell = null;
let timeoutId = null; // 노란불 타이머

const records = [];
const lastMousePos = { x: 0, y: 0 };

const directions = ["north", "east", "south", "west"];
const cells = {
  north: document.getElementById("north"),
  east: document.getElementById("east"),
  south: document.getElementById("south"),
  west: document.getElementById("west"),
};

// =======================
// 다국어(i18n) 설정
// =======================

let currentLang = localStorage.getItem("frt_lang") || "ko";

const i18n = {
  en: {
    title: "Flash Reaction Test",
    languageLabel: "Language",
    instruction1:
      "Move your mouse pointer to the yellow area and press F to measure your reaction time.",
    instruction2:
      "Click the center dot to continue to the next trial.",
    trialsLabel: "Trials:",
    startButton: "Start",
    remainingLabel: "Remaining trials:",
    lastTimeLabel: "Last reaction time:",
    avgTimeLabel: "Average reaction time:",
    resultAvgLabel: "Average reaction time:",
    retryButton: "Retry",
    contactLabel: "Contact:",
    copyEmail: "Copy"
  },
  ko: {
    title: "플래시 반응 속도 테스트",
    languageLabel: "Language",
    instruction1:
      "노란색 칸에 마우스 포인터를 이동시키고 F를 누르면 반응 속도가 측정됩니다.",
    instruction2:
      "중앙의 점을 클릭하여 다음 시도를 진행하세요.",
    trialsLabel: "시도 횟수:",
    startButton: "시작",
    remainingLabel: "남은 시도:",
    lastTimeLabel: "마지막 반응 시간:",
    avgTimeLabel: "평균 반응 시간:",
    resultAvgLabel: "평균 반응 시간:",
    retryButton: "다시하기",
    contactLabel: "문의:",
    copyEmail: "복사"
  }
};

// 경고/메시지 텍스트
const messages = {
  en: {
    startTooEarly:
      "The test has not started yet! Press F after the yellow area lights up.",
    wrongPosition:
      "Place your mouse over the correct yellow area and then press F.",
    copySuccess: "Copied!",
    copyFail: "Copy failed 😢",
    attemptLabel: "Attempt"
  },
  ko: {
    startTooEarly:
      "아직 시작되지 않았습니다! 노란색 칸이 켜진 후 눌러주세요.",
    wrongPosition:
      "올바른 방향에 마우스를 위치시킨 후 F키를 눌러주세요.",
    copySuccess: "복사 완료!",
    copyFail: "복사 실패 😢",
    attemptLabel: "시도"
  }
};

function applyTranslations() {
  const dict = i18n[currentLang];
  if (!dict) return;

  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}

// 언어 셀렉트 초기화
const langSelect = document.getElementById("langSelect");
if (langSelect) {
  langSelect.value = currentLang;
  langSelect.addEventListener("change", () => {
    currentLang = langSelect.value;
    localStorage.setItem("frt_lang", currentLang);
    applyTranslations();
  });
}
applyTranslations();

// =======================
// 마우스 위치 추적
// =======================
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

// =======================
// 반응 속도 레벨(별점) 한/영
// =======================
const reactionLevels = {
  en: [
    {
      max: 195,
      title: "⚡ Faster than light",
      stars: 7,
      desc: "Careful, people might suspect you're using scripts!"
    },
    {
      max: 210,
      title: "🔥 Skill-dodging predictor",
      stars: 6.5,
      desc: "You even dodge auto attacks."
    },
    {
      max: 225,
      title: "👀 Skill animation watcher",
      stars: 6.5,
      desc: "You can react to Cassiopeia's ultimate with ease."
    },
    {
      max: 240,
      title: "🐱 Cat-like reflexes",
      stars: 6,
      desc: "You dodge Renekton flash-Q consistently."
    },
    {
      max: 255,
      title: "🦊 Charm dodger",
      stars: 5.5,
      desc: "Almost every Ahri charm misses you."
    },
    {
      max: 270,
      title: "🧙 Prophetic plays",
      stars: 5,
      desc: "You even react to bush Malphite ultimates."
    },
    {
      max: 285,
      title: "👨 Pro-level reactions",
      stars: 4.5,
      desc: "Among your friends, you're definitely the fastest."
    },
    {
      max: 300,
      title: "🌠 Very fast",
      stars: 4,
      desc: "You dodge Jinx ult just from the sound."
    },
    {
      max: 315,
      title: "🏎 Pretty quick",
      stars: 3.5,
      desc: "Ashe's arrow almost never hits you."
    },
    {
      max: 330,
      title: "🦅 Human average",
      stars: 3,
      desc: "You're right around the average. Not bad!"
    },
    {
      max: 345,
      title: "🖱 Mouse malfunction?",
      stars: 2.5,
      desc: "Maybe it's time to consider a new mouse."
    },
    {
      max: 360,
      title: "📉 CPU at 100°C",
      stars: 2,
      desc: "Even Yuumi is thinking of leaving you."
    },
    {
      max: 375,
      title: "🕸 Hands crowd-controlled",
      stars: 1.8,
      desc: "You teleport after the teamfight ends."
    },
    {
      max: 390,
      title: "🦥 Sloth tempo",
      stars: 1.5,
      desc: "You miss 4 out of 6 minions."
    },
    {
      max: 410,
      title: "💀 Reaction vanished",
      stars: 1,
      desc: "By the time you react, you're already grey-screened."
    }
  ],
  ko: [
    {
      max: 195,
      title: "⚡ 빛보다 빠른 손",
      stars: 7,
      desc: "헬퍼로 의심받지 않기 위해 조심!!"
    },
    {
      max: 210,
      title: "🔥 스킬 예지 회피자",
      stars: 6.5,
      desc: "평타도 피해버리는 실력!!"
    },
    {
      max: 225,
      title: "👀 스킬 모션 감시자",
      stars: 6.5,
      desc: "카시오페아 궁 반응 마스터."
    },
    {
      max: 240,
      title: "🐱 고양이 반사신경",
      stars: 6,
      desc: "레넥톤 플Q 반응으로 피함."
    },
    {
      max: 255,
      title: "🦊 아리 매혹 회피러",
      stars: 5.5,
      desc: "아리 매혹을 모두 회피하는 감각."
    },
    {
      max: 270,
      title: "🧙 예언자 플레이",
      stars: 5,
      desc: "부쉬 말파이트 궁도 반응해버리는 편."
    },
    {
      max: 285,
      title: "👨 프로게이머 급",
      stars: 4.5,
      desc: "나 정도면 친구들 중 최강!"
    },
    {
      max: 300,
      title: "🌠 매우 빠른 반응 속도",
      stars: 4,
      desc: "징크스 궁은 소리만 듣고 피하지~"
    },
    {
      max: 315,
      title: "🏎 나 정도면 빠르지",
      stars: 3.5,
      desc: "애쉬 궁은 눈 감고도 피함."
    },
    {
      max: 330,
      title: "🦅 인간계 평균",
      stars: 3,
      desc: "평균은 했으니까 됐지~"
    },
    {
      max: 345,
      title: "🖱 마우스 상태 이슈",
      stars: 2.5,
      desc: "마우스 갈아야 하나 고민되는 구간."
    },
    {
      max: 360,
      title: "📉 CPU 온도 100도",
      stars: 2,
      desc: "유미가 버리고 도망감."
    },
    {
      max: 375,
      title: "🕸 손에 CC걸림",
      stars: 1.8,
      desc: "한타 끝나고 텔레포트 누름."
    },
    {
      max: 390,
      title: "🦥 나무늘보 템포",
      stars: 1.5,
      desc: "미니언 6개 중에 4개 놓침."
    },
    {
      max: 410,
      title: "💀 반응속도 사라짐",
      stars: 1,
      desc: "전투 시작하면 이미 회색 화면."
    }
  ]
};

function getReactionResult(avg) {
  const list = reactionLevels[currentLang] || reactionLevels.en;
  // 평균보다 큰 경우를 대비해 마지막 레벨 반환
  return list.find((level) => avg <= level.max) || list[list.length - 1];
}

function showFunResult(avg) {
  const r = getReactionResult(avg);
  const star =
    "★".repeat(Math.floor(r.stars)) + (r.stars % 1 ? "☆" : "");

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

// =======================
// 결과/그래프
// =======================
function showResults() {
  const avg =
    records.reduce((a, b) => a + b, 0) / (records.length || 1);
  document.getElementById("bigAvgTime").textContent = avg.toFixed(2);

  showFunResult(avg);

  const listEl = document.getElementById("timesList");
  const attemptLabel = messages[currentLang].attemptLabel;

  records.forEach((rt, i) => {
    const li = document.createElement("li");
    li.textContent = `${attemptLabel} ${i + 1}: ${rt.toFixed(2)} ms`;
    listEl.appendChild(li);
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

  // 이전 타이머 정리
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  timeoutId = setTimeout(() => {
    targetCell.style.backgroundColor = "yellow";
    startTime = performance.now();
  }, randomDelay());
}

// =======================
// 이벤트 바인딩
// =======================
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
    alert(messages[currentLang].startTooEarly);

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

  const elem = document.elementFromPoint(
    lastMousePos.x,
    lastMousePos.y
  );

  if (elem !== targetCell) {
    alert(messages[currentLang].wrongPosition);
    return;
  }

  const rt = performance.now() - startTime;
  records.push(rt);

  document.getElementById("reactionTime").textContent =
    rt.toFixed(2);
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
        const tempInput = document.createElement("input");
        tempInput.value = contactEmail;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }

      copyMsg.textContent = messages[currentLang].copySuccess;
      setTimeout(() => {
        copyMsg.textContent = "";
      }, 1500);
    } catch (err) {
      copyMsg.textContent = messages[currentLang].copyFail;
      setTimeout(() => {
        copyMsg.textContent = "";
      }, 1500);
    }
  });
}
