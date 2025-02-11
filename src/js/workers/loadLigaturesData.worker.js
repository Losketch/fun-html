self.addEventListener('message', async () => {
  try {
    const [decompositions, variations, namedSequences] = await Promise.all([
      import('../../data/decompositions.json'),
      import('../../data/variations.json'),
      import('../../data/named_sequences.json')
    ]);

    const result = [
      ...decompositions.default,
      ...variations.default,
      ...namedSequences.default
    ];

    self.postMessage(result);
  } catch (error) {
    self.postMessage({ error: error.message });
  }
});
