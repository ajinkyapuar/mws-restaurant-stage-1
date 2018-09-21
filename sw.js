/* global idb */
/* eslint-env browser, es6 */


/* Register service worker if browser support found */
if ("serviceWorker" in navigator) {
	window.addEventListener("load", function() {
		navigator.serviceWorker.register("/sw.js")
			.then(registration => {
				console.log("Root registered on scope", registration.scope);
			}).catch(err => {
				console.log("Registration failed:", err);
			})
	});
}

const cacheName = "restaurant-review-v2";

/* Install service worker and cache files */
self.addEventListener("install", event => {
	event.waitUntil(

		caches.open(cacheName)
			.then(function(cache) {
				return cache.addAll([
					"/",
					"index.html",
					"restaurant.html?id=1",
					"restaurant.html?id=2",
					"restaurant.html?id=3",
					"restaurant.html?id=4",
					"restaurant.html?id=5",
					"restaurant.html?id=6",
					"restaurant.html?id=7",
					"restaurant.html?id=8",
					"restaurant.html?id=9",
					"restaurant.html?id=10",
					"sw.js",
					"css/styles.css",
					"js/main.min.js",
					"js/restaurant.min.js",
					"img/1-400_small_1x.webp",
					"img/1-800_large_1x.webp",
					"img/2-400_small_1x.webp",
					"img/2-800_large_1x.webp",
					"img/3-400_small_1x.webp",
					"img/3-800_large_1x.webp",
					"img/4-400_small_1x.webp",
					"img/4-800_large_1x.webp",
					"img/5-400_small_1x.webp",
					"img/5-800_large_1x.webp",
					"img/6-400_small_1x.webp",
					"img/6-800_large_1x.webp",
					"img/7-400_small_1x.webp",
					"img/7-800_large_1x.webp",
					"img/8-400_small_1x.webp",
					"img/8-800_large_1x.webp",
					"img/9-400_small_1x.webp",
					"img/9-800_large_1x.webp",
					"img/10-400_small_1x.webp",
					"img/10-800_large_1x.webp"
				]);
			}).catch(err => {
				console.log("Error with caching", err);
			})
	);
});

/* Only keep latest cache version */
self.addEventListener("activate", event => {
	event.waitUntil(
		caches.keys()
			.then(cacheList => {
				Promise.all(
					cacheList.filter(cacheItem => {
						return cacheItem.startsWith("restaurant-review") && cacheItem !== cacheName;
					}).map(cacheItem => {
						return caches.delete(cacheItem);
					}));
			})
	);
});

self.addEventListener("fetch", event => {
	const url = new URL(event.request.url);
	/* Show only placeholder for google maps if offline */
	if (event.request.url.startsWith("https://maps.googleapis.com/maps/api/js?key=")) {
		event.respondWith(
			fetch(event.request)
				.then(response => {
					return response;
				}).catch(err => {
					return new Response("if(location.pathname === \"/\") {updateRestaurants();} else {fetchRestaurantFromURL((error, restaurant) => {if (error) {console.error(error);} else {fillBreadcrumb();}});}document.getElementById(\"map-container\").style.display=\"none\"");
				})
		)
	/* Offer/update cache files */
	} else if (event.request.url.endsWith(".webp") || location.pathname === "/restaurant.html") {
		event.respondWith(
			caches.open(cacheName)
				.then(cache => {
					return cache.match(event.request)
						.then(response => {
							return response || fetch(event.request)
								.then(response => {
									cache.put(event.request, response.clone());
									return response;
								})
						})
				})
		)
	} else {
		event.respondWith(
			caches.match(event.request)
				.then(response => {
					return response || fetch(event.request);
				}).catch(err => {
					console.log("Error with request", err);
				})
		);
	}
});
