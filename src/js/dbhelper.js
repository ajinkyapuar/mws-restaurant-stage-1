/* global google */
/* eslint-env browser, es6 */

/**
 * Common database helper functions.
 */
class DBHelper {

	/**
	 * Database URL.
	 * Change this to restaurants.json file location on your server.
	 */
	static get DATABASE_URL() {
		const port = 1337 // Change this to your server port
		return `http://localhost:${port}`;
	}

	/**
	 * Fetch all restaurants.
	 */

	static fetchRestaurants() {
		return new Promise((resolve, reject) => {
			idb.open("restaurant-reviews", 1, upgradeDb => {
				upgradeDb.createObjectStore("restaurants", {
					keyPath: "id"
				});
			}).then(db => {
				fetch(DBHelper.DATABASE_URL + "/restaurants")
					.then(response => response.json())
					.then(restaurants => {
						restaurants.forEach(restaurant => {
							let restaurantStore = db.transaction("restaurants", "readwrite").objectStore("restaurants");
							restaurantStore.put(restaurant);
						})
						resolve(restaurants);
					})
					.catch(err => {
						let restaurants = db.transaction("restaurants").objectStore("restaurants").getAll();
						if (restaurants.length = 0) {
							reject(err);
						} else {
							resolve(restaurants);
						}
					})
			})
		})
	}

	/**
	 * Fetch a restaurant by its ID.
	 */
	static fetchRestaurantById(id) {
		return new Promise((resolve, reject) => {
			// fetch all restaurants with proper error handling.
			DBHelper.fetchRestaurants()
				.then(restaurants => {
					const restaurant = restaurants.find(r => r.id === id);
					if (restaurant) { // Got the restaurant
						resolve(restaurant);
					} else { // Restaurant does not exist in the database
						reject("Restaurant does not exist");
					}
				})
				.catch(reject)
		})
	}

	/**
	 * Fetch restaurant reviews by ID
	 */

	static fetchRestaurantReviewsById(id) {
		return new Promise((resolve, reject) => {
			idb.open("restaurant_id" + id, 1, upgradeDb => {
				upgradeDb.createObjectStore("reviews", {
					keyPath: "id"
				});
			}).then(db => {
				fetch(this.DATABASE_URL + "/reviews/?restaurant_id=" + id)
					.then(response => response.json())
					.then(reviews => {
						reviews.forEach(review => {
							let reviewStore = db.transaction("reviews", "readwrite").objectStore("reviews");
							reviewStore.put(review);
						});
						resolve(reviews);
					})
					.catch(err => {
						let reviews = db.transaction("reviews").objectStore("reviews").getAll();
						if (reviews.length = 0) {
							reject(err);
						} else {
							resolve(reviews);
						}
					})
			});
		});
	}

	/**
	 * Toggle favorite status
	 */

	static favoriteStatus(id, status) {
		return new Promise((resolve, reject) => {
			fetch(this.DATABASE_URL + "/restaurants/" + id + "/?is_favorite=" + status, {
				method: "PUT"
			}).then(resolve).catch(reject);
		})
	}

	/**
	 * Add new review
	 */

	static addReview(review) {
		return new Promise((resolve, reject) => {
			fetch(this.DATABASE_URL + "/reviews/", {
				body: JSON.stringify(review),
				headers: {
					"content-type": "application/json"
				},
				method: "POST"
			})
				.then(resolve)
				.catch(reject);
		})
	}

	static cacheReview(review) {
		if (!navigator.online) {
			window.localStorage.setItem("cache-review-" + review.restaurant_id, JSON.stringify(review));
			this.watchReview(review.restaurant_id);
		}
	}

	static watchReview(id) {
		if (!navigator.online) {
			window.addEventListener("online", event => {
				if (window.localStorage.getItem("cache-review-" + id) !== null) {
					this.clearOffline(id);
				}
			});
		} else {
			this.clearOffline(id);
		}
	}

	static clearOffline(id) {
		try {
			this.addReview(JSON.parse(window.localStorage.getItem("cache-review-" + id)))
				.then(response => {
					window.localStorage.removeItem("cache-review-" + id);
					document.querySelectorAll(".offline").forEach(review => {
						review.classList.remove("offline");
						review.innerHTML = new Date().toLocaleString("en-US");
					});
				})
				.catch(console.error);
		} catch (e) {
			console.error(e);
		}
	}

	/**
	 * Fetch restaurants by a cuisine type with proper error handling.
	 */
	static fetchRestaurantByCuisine(cuisine) {
		return new Promise((resolve, reject) => {
			// Fetch all restaurants  with proper error handling
			DBHelper.fetchRestaurants()
				.then(restaurants => {
					// Filter restaurants to have only given cuisine type
					const results = restaurants.filter(r => r.cuisine_type === cuisine);
					resolve(results);
				})
				.catch(reject)
		})
	}

	/**
	 * Fetch restaurants by a neighborhood with proper error handling.
	 */
	static fetchRestaurantByNeighborhood(neighborhood) {
		return new Promise((resolve, reject) => {
			// Fetch all restaurants
			DBHelper.fetchRestaurants()
				.then(restaurants => {
					// Filter restaurants to have only given neighborhood
					const results = restaurants.filter(r => r.neighborhood === neighborhood);
					resolve(results);
				})
				.catch(reject)
		})
	}

	/**
	 * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
	 */
	static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
		return new Promise((resolve, reject) => {
			// Fetch all restaurants
			DBHelper.fetchRestaurants()
				.then(restaurants => {
					let results = restaurants
					if (cuisine !== "all") { // filter by cuisine
						results = results.filter(r => r.cuisine_type === cuisine);
					}
					if (neighborhood !== "all") { // filter by neighborhood
						results = results.filter(r => r.neighborhood === neighborhood);
					}
					resolve(results);
				})
				.catch(reject)
		})
	}

	/**
	 * Fetch all neighborhoods with proper error handling.
	 */
	static fetchNeighborhoods() {
		return new Promise((resolve, reject) => {
			// Fetch all restaurants
			DBHelper.fetchRestaurants()
				.then(restaurants => {
					// Get all neighborhoods from all restaurants
					const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
					// Remove duplicates from neighborhoods
					const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) === i)
					resolve(uniqueNeighborhoods);
				})
				.catch(reject)
		})
	}

	/**
	 * Fetch all cuisines with proper error handling.
	 */
	static fetchCuisines() {
		return new Promise((resolve, reject) => {
			// Fetch all restaurants
			DBHelper.fetchRestaurants()
				.then(restaurants => {
					// Get all cuisines from all restaurants
					const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
					// Remove duplicates from cuisines
					const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) === i)
					resolve(uniqueCuisines);
				})
				.catch(reject)
		})
	}

	/**
	 * Restaurant page URL.
	 */
	static urlForRestaurant(restaurant) {
		return (`./restaurant.html?id=${restaurant.id}`);
	}

	/**
	 * Restaurant image URL.
	 */
	static imageUrlForRestaurant(restaurant) {
		return (`/img/${restaurant.id}-800_large_1x.webp`);
	}

	static imageSrcsetForRestaurant(restaurant) {
		return (`/img/${restaurant.id}-400_small_1x.webp 400w, /img/${restaurant.id}-800_large_1x.webp 800w`);
	}
	/**
	 * Map marker for a restaurant.
	 */
	static mapMarkerForRestaurant(restaurant, map) {
		try {
			const marker = new google.maps.Marker({
				position: restaurant.latlng,
				title: restaurant.name,
				url: DBHelper.urlForRestaurant(restaurant),
				map: map,
				animation: google.maps.Animation.DROP
			});
			return marker;
		} catch (e) {}
	}

}