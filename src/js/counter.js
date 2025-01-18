(function () {
  Object.defineProperty(String.prototype, 'codePointLength_', {
    get() {
      let len = 0;
      for (let i = 0; i < this.length; ) {
        const codePoint = this.codePointAt(i);
        i += codePoint > 0xffff ? 2 : 1;
        len++;
      }
      return len;
    },
    enumerable: false,
    configurable: false
  });

  const counterContainers = document.querySelectorAll('.counter-container');
  for (let counterContainer of counterContainers) {
    const input =
      counterContainer.querySelector('input') ||
      counterContainer.querySelector('textarea');
    const counter = counterContainer.querySelector('.counter');
    counter.innerText = input.value.codePointLength_.toString();
    input.addEventListener('input', () => {
      counter.innerText = input.value.codePointLength_.toString();
    });
  }
})();
