const content = document.getElementById('content');
const mainContent = document.getElementById('main-content');
const toolbox = document.getElementById('toolbox');
const menuItems = document.querySelectorAll('.menuItem');
const toolButtons = document.querySelectorAll('.tool-button');
const nav = document.querySelector('nav');
const toggleNavButton = document.getElementById('toggle-nav-button');
const titleH1 = document.getElementById('title-h1');
let currentActiveMenu = 'home';

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
  currentActiveMenu = target;
  menuItems.forEach((item) => {
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

menuItems.forEach((item) => {
  item.addEventListener('click', () => {
    if (currentActiveMenu === item.dataset.target) return;

    currentActiveMenu = item.dataset.target;
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

toolButtons.forEach((button) => {
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

    if (button.classList.contains('inner-online-tool'))
      titleH1.innerText = button.innerText;
  });
});

window.addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'changeHeader':
      titleH1.innerHTML = event.data.text;
      break;
    case 'adjustIframeHeight':
      mainContent.style.height = event.data.height + 'px';
      break;
    case 'clearMainContentHeight':
      mainContent.style.removeProperty('height');
      break;
    case 'changeUrl':
      window.open(event.data.url, '_blank');
  }
});

toggleNavButton.addEventListener('click', () => {
  nav.classList.toggle('nav-hidden');
  toggleNavButton.innerHTML = nav.classList.contains('nav-hidden')
    ? '<span class="nf nf-md-close"></span>'
    : '<span class="nf nf-md-menu"></span>';
});
