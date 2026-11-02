class CanvasAnimation {
  constructor(block, config, frameUrls) {
    this.block = block;
    this.canvas = block.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.config = config;
    this.frameUrls = frameUrls;
    this.images = new Array(config.frameCount);
    this.init();
  }

  async init() {
    this.updateDimensions();
    this.setupCanvas();
    await this.loadAllPasses();
    this.bindScroll();
    this.bindResize();
  }

  updateDimensions() {
    this.isMobile = window.innerWidth <= 768;
  }

  async loadAllPasses() {
    await this.loadSequence(2, 0);
    this.render(0);
    await this.loadSequence(2, 1);
  }

  async loadSequence(step, offset) {
    const promises = [];

    for (let i = offset; i < this.config.frameCount; i += step) {
      if (!this.images[i] && this.frameUrls[i]) {
        const img = new Image();
        const promise = new Promise((res) => {
          img.onload = res;
          img.src = this.frameUrls[i];
        });
        this.images[i] = img;
        promises.push(promise);
      }
    }
    return Promise.all(promises);
  }

  render(index) {
    let img = this.images[index];
    if (!img) img = this.images[Math.floor(index / 2) * 2];
    if (!img) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.isMobile) {
      const zoom = 1.1;
      const sW = 1080 * zoom;
      const sH = 1080 * zoom;
      const sX = (1080 - sW) / 2;
      const sY = (1080 - sH) / 2;
      this.ctx.drawImage(img, sX, sY, sW, sH, 0, 0, 1080, 1080);
    } else {
      this.ctx.drawImage(img, 0, 0, 1080, 1080);
    }
  }

  bindScroll() {
    const track = this.block;
    const content1 = this.block.querySelector('.content-1');
    const content2 = this.block.querySelector('.content-2');
    const { c1Start, c2Start, fadeDuration, panStartFrame, panStartPos, panEndPos, frameCount } = this.config;

    window.addEventListener('scroll', () => {
      const rect = track.getBoundingClientRect();
      const scrollFraction = Math.max(0, Math.min(1, Math.abs(rect.top) / (rect.height - window.innerHeight)));
      const frameIndex = Math.floor(scrollFraction * frameCount);

      if (!this.isMobile) {
        if (frameIndex >= panStartFrame) {
          const panProgress = Math.max(0, Math.min(1, (frameIndex - panStartFrame) / (frameCount - panStartFrame)));

          const currentPan = panStartPos + panProgress * (panEndPos - panStartPos);
          this.canvas.style.transform = `translateX(${currentPan}%)`;
        } else {
          this.canvas.style.transform = `translateX(${panStartPos}%)`;
        }
      } else {
        this.canvas.style.transform = 'translateX(0%)';
      }

      if (c1Start) {
        const c1Fade = (frameIndex - c1Start) / fadeDuration;
        content1.style.opacity = frameIndex <= c1Start ? 1 : Math.max(0, 1 - c1Fade);
      }

      if (c2Start) {
        const c2Fade = (frameIndex - c2Start) / fadeDuration;
        content2.style.opacity = frameIndex <= c2Start ? 0 : Math.min(1, c2Fade);
      }

      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        requestAnimationFrame(() => this.render(frameIndex));
      }
    });
  }

  bindResize() {
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.updateDimensions();
      if (wasMobile !== this.isMobile) {
        this.setupCanvas();
        this.render(0);
      }
    });
  }

  setupCanvas() {
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = 1080 * ratio;
    this.canvas.height = 1080 * ratio;
    this.ctx.scale(ratio, ratio);
  }
}

export default async function decorate(block) {
  const rows = [...block.children];
  const getNum = (row) => (row ? parseInt(row.lastElementChild.textContent.trim(), 10) : 0);

  // 1. Fetch Fragment HTML
  const fragmentPath = rows[0].lastElementChild.textContent.trim();
  const resp = await fetch(`${fragmentPath}.plain.html`);
  let frameUrls = [];

  if (resp.ok) {
    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    frameUrls = [...doc.querySelectorAll('img')].map((img) => {
      const url = new URL(img.src, window.location.href);
      url.searchParams.set('width', '1080');
      url.searchParams.set('format', 'webply');
      url.searchParams.set('optimize', 'medium');
      return url.toString();
    });
  }

  const config = {
    frameCount: frameUrls.length,
    c1Start: getNum(rows[1]),
    c2Start: getNum(rows[2]),
    fadeDuration: getNum(rows[3]),
    panStartFrame: getNum(rows[4]),
    panStartPos: getNum(rows[5]) || 0,
    panEndPos: getNum(rows[6]) || 0,
  };

  const content1 = rows[7]?.lastElementChild.innerHTML;
  const content2 = rows[8]?.lastElementChild.innerHTML;

  const isDesktop = window.innerWidth > 768;
  const initialPan = isDesktop ? `style="transform: translateX(${config.panStartPos}%);"` : '';

  block.innerHTML = `
    <div class="spotlight-sticky-scene">
      <canvas ${initialPan}></canvas>
      ${content1 ? `<div class="spotlight-content content-1">${content1}</div>` : ''}
      ${content2 ? `<div class="spotlight-content content-2">${content2}</div>` : ''}
    </div>
  `;

  const animation = new CanvasAnimation(block, config, frameUrls);
  return animation;
}
