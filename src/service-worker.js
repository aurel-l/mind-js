/* jshint worker:true */
/* global caches:false */
/* global fetch:false */

'use strict';
importScripts('bower_components/cache-polyfill/dist/serviceworker-cache-polyfill.js');

const CACHE_NAME = 'cache-v1';

//install
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log(cache);
        console.log('openened cache');
      })
  );
});

//intercepted fetch
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request)
      .then(function(res) {
        if (res) {
          return res;
        }

        let fetchReq = e.request.clone();
        return fetch(fetchReq).then(function(res) {
          if (!res || res.status !== 200 || res.type !== 'basic') {
            return res;
          }

          let resToCache = res.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              let cacheReq = e.request.clone();
              cache.put(cacheReq, resToCache);
            });
          return res;
        });
      })
  );
});
