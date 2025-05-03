window.parent.postMessage(
  {
    type: 'changeHeader',
    text: document.title
  },
  '*'
);
