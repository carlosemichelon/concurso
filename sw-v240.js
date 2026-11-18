/* Root-scope worker intentionally disabled: NEVER intercept the production portal. */
self.addEventListener('install',e=>e.waitUntil(self.registration.unregister()));