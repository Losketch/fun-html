const content = document.getElementById('content');
const mainContent = document.getElementById('main-content');
const toolbox = document.getElementById('toolbox');
const tabs = document.querySelector('md-tabs');
const toolButtons = document.querySelectorAll('.tool-button');
const toggleNavButton = document.getElementById('toggle-nav-button');
const titleH1 = document.getElementById('title-h1');

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

function loadContent(url) {
  const timestamp = new Date().getTime();
  mainContent.src = `${url}?t=${timestamp}`;
}

tabs.addEventListener('change', () => {
  const index = tabs.activeTabIndex;
  animateContent();
  setTimeout(() => {
    if (index === 0) {
      mainContent.style.display = 'block';
      toolbox.style.display = 'none';
    } else if (index === 1) {
      mainContent.style.display = 'none';
      toolbox.style.display = 'grid';
    }
  }, 50);
});

toolButtons.forEach(button => {
  if (button.classList.contains('online-tool')) {
    button.addEventListener('click', () => {
      window.open(button.dataset.url, '_blank');
    });
    return;
  }

  button.addEventListener('click', () => {
    animateContent();
    loadContent(button.dataset.url);

    setTimeout(() => {
      tabs.activeTabIndex = 0;
      mainContent.style.display = 'block';
      toolbox.style.display = 'none';
    }, 50);
  });
});

window.addEventListener('message', event => {
  switch (event.data.type) {
    case 'changeHeader':
      titleH1.innerHTML = event.data.text;
      break;
    case 'changeUrl':
      window.open(event.data.url, '_blank');
  }
});

toggleNavButton.addEventListener('click', () => {
  tabs.classList.toggle('tabs-hidden');
});
