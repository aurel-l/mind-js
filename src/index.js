'use strict';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/mind-js/service-worker.js', {scope: '/mind-js/'})
    .then(function(registration) {
      console.log('Successful service worker registration with scope: ', registration.scope);
    }).catch(function(err) {
      console.warn('Service worker registration failed, no offline mode. ', err);
    });
}
