console.log('e')

window.addEventListener('message', (e) => {
  e.ports[0].postMessage({
    do: 'fsable',
    val: false
  });

  setTimeout(() => e.ports[0].postMessage({
    do: 'close'
  }), 5000)
});
