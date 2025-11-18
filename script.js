let trials = 0;
let startTime = 0;
let targetCell = null;

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

  const list = document.getElementById("timesList");
  records.forEach((rt, i) => {
    const li = document.createElement("li");
    // 🔧 여기 원래 문자열이 깨져 있었음 → 템플릿 리터럴로 수정
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

  setTimeout(() => {
    targetCell.style.backgroundColor = "yellow";
    startTime = performance.now();
  }, randomDelay());
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
  if (!targetCell || !startTime) return;

  const key = e.key.toLowerCase();
  if (key === "f" || key === "ㄹ") {
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
  }
});

document.getElementById("retryBtn").addEventListener("click", () => {
  location.reload();
});
