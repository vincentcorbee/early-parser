const assets = ['/']

self.addEventListener('install', (event) => {
  console.log('V1 installing…');

  event.waitUntil(caches.open('assets').then(cache => cache.addAll(assets)))
});

self.addEventListener('activate', event => {
  console.log('V1 now ready to handle fetches!');
});

const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$')

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  if (request.mode !== 'navigate') return

  if(url.pathname.match(fileExtensionRegexp)) return

  if (url.pathname.startsWith('/_')) return

  // StaleWhileRevalidate
  event.respondWith(caches.match(request).then(resource => {
    const fetchedResource = fetch(request.clone()).then(response =>
      caches.open().then(cache => cache.put(request, response.clone()))
    )

    return resource || fetchedResource
  }))

  // event.respondWith()

  // event.respondWith(new Response('hoi'))
});