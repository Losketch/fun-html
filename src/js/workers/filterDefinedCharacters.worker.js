self.addEventListener('message', event => {
  const { characters, definedCharacterList } = event.data;
  const filteredCharacters = characters.filter(
    i => definedCharacterList.has(i) || Array.isArray(i)
  );
  self.postMessage(filteredCharacters);
});
