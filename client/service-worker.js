// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-final-1';
var filesToCache = [
  '/',
  '/index.html',
  //'/client/crud.js',
  '/dist/bundle.js',
  '/manifest.json',
  '/service-worker.js',
  //'http://localhost:8080/api/goals'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});


self.addEventListener('fetch', function(e) {
 // console.log('[Service Worker] Fetch', e.request.url);
  
  var dataUrl = 'http://localhost:8080/api/goals';
  if (e.request.url.indexOf(dataUrl) > -1) {

    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
		if (e.request.method !== 'POST')	
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {

    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});

/*
self.addEventListener('fetch', function (event) {
	 //console.log('[Service Worker] Fetch', event.request.url);
  event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request.clone()).then(function (response) {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          var responseCache = response.clone();
          caches.open(cacheName).then(function (cache) {
            cache.put(event.request, responseCache);
          });
          return response;
        });
      })
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});*/