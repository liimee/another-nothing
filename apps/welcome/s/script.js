console.log('e')

window.addEventListener('message', (e) => {
  e.ports[0].postMessage({
    do: 'fsable',
    val: false
  });
});
