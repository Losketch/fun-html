const content = document.getElementById('content');
const mainContent = document.getElementById('mainContent');
const toolbox = document.getElementById('toolbox');
const menuItems = document.querySelectorAll('.menuItem');
const toolButtons = document.querySelectorAll('.tool-button');
const nav = document.querySelector('nav');
const toggleNavButton = document.getElementById('toggleNavButton');
const titleH1 = document.getElementById('titleH1');

function animateContent() {
  content.style.transition = 'none';
  content.style.transform = 'translateY(20px)';
  content.style.opacity = '0';

  setTimeout(() => {
    content.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    content.style.transform = 'translateY(0)';
    content.style.opacity = '1';
  }, 50);
}

function updateActiveMenuItem(target) {
  menuItems.forEach(item => {
    if (item.dataset.target === target) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function loadContent(url) {
  const timestamp = new Date().getTime();
  mainContent.src = `${url}?t=${timestamp}`;
}

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    updateActiveMenuItem(item.dataset.target);
    animateContent();

    setTimeout(() => {
      if (item.dataset.target === 'home') {
        mainContent.style.display = 'block';
        toolbox.style.display = 'none';
      } else if (item.dataset.target === 'toolbox') {
        mainContent.style.display = 'none';
        toolbox.style.display = 'grid';
      }
    }, 50);
  });
});

toolButtons.forEach(button => {
  if (button.classList.contains('online-tool')) {
    button.addEventListener('click', () => {
      window.location.href = button.dataset.url;
    });

    return;
  }

  button.addEventListener('click', () => {
    animateContent();

    setTimeout(() => {
      loadContent(button.dataset.url);
      mainContent.style.display = 'block';
      mainContent.style.removeProperty('height');
      toolbox.style.display = 'none';
      updateActiveMenuItem('home');
    }, 50);

    if (button.classList.contains('inner-online-tool')) titleH1.innerText = button.innerText;
  });
});

window.addEventListener('message', function(event) {
  switch (event.data.type) {
    case 'adjustIframeHeight':
      if (mainContent) {
        mainContent.style.height = event.data.height + 'px';
      }
      break;
    case 'clearMainContentHeight':
      if (mainContent) {
        mainContent.style.removeProperty('height');
      }
      break;
    case 'changeHeader':
      titleH1.innerText = event.data.text;
      break;
  }
});

toggleNavButton.addEventListener('click', () => {
  nav.classList.toggle('nav-hidden');
  toggleNavButton.innerHTML = nav.classList.contains('nav-hidden') ?
    '<span class="material-icons">close</span>' :
    '<span class="material-icons">menu</span>';
});


let currentZoom = 1;
let initialPinchDistance = null;
let initialZoom = 1;
let lastZoom = 1;
let zoomUpdateTimeout = null;
let isZooming = false;

function zoomPage(scale, immediate = false) {
  scale = Math.max(1, Math.min(20, scale));
  currentZoom = scale;

  const transform = `scale(${scale})`;
  const width = `${100/scale}%`;
  const height = `${100/scale}%`;

  if (immediate) {
    document.body.style.transition = 'none';
  } else {
    document.body.style.transition = 'transform 0.1s ease-out';
  }

  document.body.style.transform = transform;
  document.body.style.width = width;
  document.body.style.height = height;
  document.body.style.transformOrigin = 'top left';

  document.body.style.display = 'none';
  document.body.offsetHeight;
  document.body.style.display = '';

  updateViewport(scale);
  saveZoomPreference(scale);
  updateZoomInfo();
}

function updateViewport(scale) {
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  viewport.content = `width=device-width, initial-scale=${1/scale}, maximum-scale=${1/scale}, user-scalable=no`;
}

function saveZoomPreference(scale) {
  localStorage.setItem('pageZoom', scale);
}

function loadZoomPreference() {
  return parseFloat(localStorage.getItem('pageZoom')) || 1;
}

function zoomIn() {
  zoomPage(currentZoom * 1.1);
}

function zoomOut() {
  zoomPage(currentZoom / 1.1);
}

function resetZoom() {
  zoomPage(1);
}

function updateZoomInfo() {
  const zoomInfo = document.getElementById('zoomInfo');
  if (zoomInfo) {
    zoomInfo.textContent = `当前缩放: ${(currentZoom * 100).toFixed(0)}%`;
  }
}

function smoothZoom(newZoom) {
  cancelAnimationFrame(zoomUpdateTimeout);
  zoomPage(newZoom, true);
}

document.addEventListener('DOMContentLoaded', () => {
  const savedZoom = loadZoomPreference();
  zoomPage(savedZoom, true);

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    }
  });

  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  }, {
    passive: false
  });
});

document.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    isZooming = true;
    initialPinchDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
    initialZoom = currentZoom;
    lastZoom = currentZoom;
  }
}, {
  passive: false
});

document.addEventListener('touchmove', (e) => {
  if (isZooming && e.touches.length === 2) {
    e.preventDefault();
    const currentDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    );
    if (initialPinchDistance) {
      const newZoom = initialZoom * (currentDistance / initialPinchDistance);
      smoothZoom(newZoom);
      lastZoom = newZoom;
    }
  }
}, {
  passive: false
});

document.addEventListener('touchend', () => {
  isZooming = false;
  initialPinchDistance = null;
});

document.addEventListener('dblclick', (e) => {
  e.preventDefault();
}, {
  passive: false
});
