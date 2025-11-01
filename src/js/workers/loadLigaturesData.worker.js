self.addEventListener('message', async () => {
  try {
    const [decompositions, variations, namedSequences] = await Promise.all([
      import('@data/mp.zlib/decompositions.mp.zlib'),
      import('@data/mp.zlib/variations.mp.zlib'),
      import('@data/mp.zlib/named_sequences.mp.zlib')
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
