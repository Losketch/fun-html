const cvs = document.querySelector('#canvas');
const ctx = cvs.getContext('2d');

function init() {
  cvs.style.width = window.innerWidth + 'px';
  cvs.style.height = window.innerHeight + 'px';
  cvs.width = window.innerWidth * devicePixelRatio;
  cvs.height = window.innerHeight * devicePixelRatio;
}

init();

function getRandom(min, max, threshold = 0) {
  if (threshold >= Math.max(Math.abs(max), Math.abs(min)))
    threshold = Math.max(Math.abs(max), Math.abs(min)) - 1;
  let randomNum;

  do {
    randomNum = Math.random() * (max - min) + min;
  } while (Math.abs(randomNum) < threshold);

  return randomNum;
}

class Point {
  #lastDrawTime = null;

  constructor(vxSpan = [-50, 50, 10], vySpan = [-50, 50, 10], r = 6) {
    this.r = r;
    this.x = getRandom(this.r * 2, cvs.width - this.r);
    this.y = getRandom(this.r * 2, cvs.height - this.r);
    this.vx = getRandom(...vxSpan);
    this.vy = getRandom(...vySpan);
  }

  draw() {
    if (this.#lastDrawTime) {
      const deltaTime = (Date.now() - this.#lastDrawTime) / 1000;

      let x = this.x + this.vx * deltaTime;
      let y = this.y + this.vy * deltaTime;

      if (x <= this.r || x >= cvs.width - this.r) {
        this.vx *= -1;
      }
      if (y <= this.r || y >= cvs.height - this.r) {
        this.vy *= -1;
      }

      if (
        x > this.r &&
        x < cvs.width - this.r &&
        y > this.r &&
        y < cvs.height - this.r
      ) {
        this.x = x;
        this.y = y;
      }
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fill();

    this.#lastDrawTime = Date.now();
  }

  stop() {
    this.#lastDrawTime = null;
  }
}

class Graph {
  #stop;

  constructor(
    vxSpan = [-50, 50, 10],
    vySpan = [-50, 50, 10],
    maxDis = 300,
    pointNumber = 80,
    r = 6
  ) {
    this.maxDis = maxDis;
    this.r = r;
    this.#stop = false;
    this.points = new Array(pointNumber)
      .fill(0)
      .map(() => new Point(vxSpan, vySpan, r));
  }

  draw() {
    if (!this.#stop) {
      requestAnimationFrame(() => this.draw());
    } else {
      for (let p of this.points) {
        p.stop();
      }
      this.#stop = false;
      return;
    }
    ctx.fillStyle = 'rgb(55, 55, 55)';
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    for (let i = 0; i < this.points.length; i++) {
      const p1 = this.points[i];
      p1.draw();
      for (let j = i + 1; j < this.points.length; j++) {
        const p2 = this.points[j];
        const d = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        if (d > this.maxDis) {
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.strokeStyle = `rgba(200, 200, 200, ${1 - d / this.maxDis})`;
        ctx.stroke();
      }
    }
  }

  stop() {
    this.#stop = true;
  }
}

let g = new Graph();
g.draw();

const count = document.querySelector('#count');
const pointRadius = document.querySelector('#pointRadius');
const maxLen = document.querySelector('#maxLen');
const vxRange = document.querySelector('#vxRange');
const vyRange = document.querySelector('#vyRange');
const vxThreshold = document.querySelector('#vxThreshold');
const vyThreshold = document.querySelector('#vyThreshold');
const update = document.querySelector('#update');

vxRange.addEventListener('input', () => {
  vxThreshold.setAttribute('max',
    Math.max(
      Math.abs(vxRange.valueStart),
      Math.abs(vxRange.valueEnd)
    ) - 1
  );
});

vyRange.addEventListener('input', () => {
  vyThreshold.setAttribute('max',
    thresholdYMax = Math.max(
      Math.abs(vyRange.valueStart),
      Math.abs(vyRange.valueEnd)
    ) - 1
  );
});

update.addEventListener('click', () => {
  g.stop();
  try {
    g = new Graph(
      [vxRange.valueStart, vxRange.valueEnd, vxThreshold.value],
      [vyRange.valueStart, vyRange.valueEnd, vyThreshold.value],
      +maxLen.value,
      +count.value,
      +pointRadius.value
    );
  } catch (e) {
    alert(e)
  }
  g.draw();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    g.stop();
  } else {
    g.draw();
  }
});
