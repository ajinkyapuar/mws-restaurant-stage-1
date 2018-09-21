/* global google, fetchNeighborhoods, fetchCuisines, DBHelper, fillNeighborhoodsHTML, fillCuisinesHTML, updateRestaurants, resetRestaurants, fillRestaurantsHTML, createRestaurantHTML, addMarkersToMap */
/* eslint-env browser, es6 */

let restaurants,
	neighborhoods,
	cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", (event) => {
	fetchNeighborhoods();
	fetchCuisines();
	updateRestaurants();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
	DBHelper.fetchNeighborhoods()
		.then(neighborhoods => {
			self.neighborhoods = neighborhoods;
			fillNeighborhoodsHTML();
		})
		.catch(console.error);
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
	const select = document.getElementById("neighborhoods-select");
	neighborhoods.forEach(neighborhood => {
		const option = document.createElement("option");
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	});
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
	DBHelper.fetchCuisines()
		.then(cuisines => {
			self.cuisines = cuisines;
			fillCuisinesHTML();
		})
		.catch(console.error);
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
	const select = document.getElementById("cuisines-select");

	cuisines.forEach(cuisine => {
		const option = document.createElement("option");
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	});
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
	let loc = {
		lat: 40.722216,
		lng: -73.987501
	};
	self.map = new google.maps.Map(document.getElementById("map"), {
		zoom: 12,
		center: loc,
		scrollwheel: false
	});
	updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
	const cSelect = document.getElementById("cuisines-select");
	const nSelect = document.getElementById("neighborhoods-select");

	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;

	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;

	DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
		.then(restaurants => {
			resetRestaurants(restaurants);
			fillRestaurantsHTML();
		})
		.catch(console.error)
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
	// Remove all restaurants
	self.restaurants = [];
	const ul = document.getElementById("restaurants-list");
	ul.innerHTML = "";

	// Remove all map markers
	self.markers.forEach(m => m.setMap(null));
	self.markers = [];
	self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
	const ul = document.getElementById("restaurants-list");
	restaurants.forEach(restaurant => {
		ul.append(createRestaurantHTML(restaurant));
	});
	addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
	const li = document.createElement("div");

	const image = document.createElement("img");
	image.className = "restaurant-img";
	image.setAttribute("alt", restaurant.name);
	image.setAttribute("data-srcset", DBHelper.imageSrcsetForRestaurant(restaurant));
	li.append(image);

	const name = document.createElement("h2");
	name.innerHTML = restaurant.name;
	li.append(name);

	const neighborhood = document.createElement("p");
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);

	const address = document.createElement("p");
	address.innerHTML = restaurant.address;
	li.append(address);

	const more = document.createElement("a");
	more.setAttribute("aria-label", "View details of " + restaurant.name);
	more.innerHTML = "View Details";
	more.href = DBHelper.urlForRestaurant(restaurant);
	li.append(more)

	const fav = document.createElement("button");
	fav.classList.add("star");
	if (restaurant.is_favorite === "true") {
		fav.classList.add("favorite");
		fav.setAttribute("aria-label", "Remove " + restaurant.name + " from favorites");
	} else {
		fav.setAttribute("aria-label", "Add " + restaurant.name + " as favorite");
	}
	fav.dataset.id = restaurant.id;
	fav.dataset.name = restaurant.name;
	fav.setAttribute("onclick", "markFavorite(this)");
	fav.innerHTML = "&#x2605";
	li.append(fav);

	return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
	restaurants.forEach(restaurant => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
		try {
			google.maps.event.addListener(marker, "click", () => {
				window.location.href = marker.url
			});
		} catch(e) {
		}
		if (typeof marker !== "undefined") {
			self.markers.push(marker);
		}
	});
	lazyPics.update();
}

markFavorite = (el) => {
	if (el.classList.contains("favorite")) {
		DBHelper.favoriteStatus(el.dataset.id, false)
			.then(console.log)
			.catch(console.error);
		el.classList.remove("favorite");
		el.setAttribute("aria-label", "Add " + el.dataset.name + " as favorite");
	} else {
		DBHelper.favoriteStatus(el.dataset.id, true)
			.then(console.log)
			.catch(console.error);
		el.classList.add("favorite");
		el.setAttribute("aria-label", "Remove " + el.dataset.name + " from favorites");
	}
}

activateMap = (el) => {
	const mapEl = document.getElementById("map");
	el.classList.add("hide");
	el.setAttribute("aria-label", "Google Maps loaded");
	mapEl.classList.remove("hide");
	loadGM();
}

loadGM = () => {
	if (document.querySelectorAll("#map").length > 0) {
		let js_file = document.createElement("script");
		js_file.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA0lXs3wTok05cbwoEt2mikk2MSZv6_Muo&libraries=places&callback=initMap";
		document.getElementsByTagName("head")[0].appendChild(js_file);
	}
}
