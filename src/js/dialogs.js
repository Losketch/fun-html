(function () {
  let id = 1;
  const store = {};
  const isIframe = window === window.parent || window.opener ? false : true;

  function sendMessage(windowToSend, data) {
    windowToSend.postMessage(JSON.stringify(data), '*');
  }

  function processInteractiveDialog(data, callback) {
    sendMessage(parent, data);

    if (callback) store[data.id] = callback;
    else
      return new Promise(resolve => {
        store[data.id] = resolve;
      });
  }

  if (isIframe) {
    window.alert = function (message) {
      const data = { event: 'dialog', type: 'alert', message: message };
      sendMessage(parent, data);
    };

    window.confirm = function (message, callback) {
      const data = {
        event: 'dialog',
        type: 'confirm',
        id: id++,
        message: message
      };
      return processInteractiveDialog(data, callback);
    };

    window.prompt = function (message, value, callback) {
      const data = {
        event: 'dialog',
        type: 'prompt',
        id: id++,
        message: message,
        value: value || ''
      };
      return processInteractiveDialog(data, callback);
    };
  }

  window.addEventListener(
    'message',
    event => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (!data || typeof data !== 'object') return;

      if (data.event !== 'dialog' || !data.type) return;

      if (!isIframe) {
        if (data.type === 'alert') alert(data.message);
        else if (data.type === 'confirm') {
          data = {
            event: 'dialog',
            type: 'confirm',
            id: data.id,
            result: confirm(data.message)
          };
          sendMessage(event.source, data);
        } else if (data.type === 'prompt') {
          data = {
            event: 'dialog',
            type: 'prompt',
            id: data.id,
            result: prompt(data.message, data.value)
          };
          sendMessage(event.source, data);
        }
      } else {
        if (data.type === 'confirm') {
          store[data.id](data.result);
          delete store[data.id];
        } else if (data.type === 'prompt') {
          store[data.id](data.result);
          delete store[data.id];
        }
      }
    },
    false
  );
})();
