// Prevent FOUT: body starts with opacity:0, fades in when fonts load
(function() {
    var s = document.createElement('style');
    s.textContent = 'body:not(.fonts-loaded){opacity:0;transition:opacity 0.2s ease}';
    document.head.appendChild(s);
    document.fonts.ready.then(function() {
        document.body.classList.add('fonts-loaded');
    });
})();
