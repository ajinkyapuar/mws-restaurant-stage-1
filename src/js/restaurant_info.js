/* global google, fetchRestaurantFromURL, fillBreadcrumb, DBHelper, getParameterByName, fillRestaurantHTML, fillRestaurantHoursHTML, fillReviewsHTML, createReviewHTML */
/* eslint-env browser, es6 eqeqeq: 0*/

let restaurant;
var map;

document.addEventListener("DOMContentLoaded", (event) => {
	loadGM();
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.map = new google.maps.Map(document.getElementById("map"), {
				zoom: 16,
				center: restaurant.latlng,
				scrollwheel: false
			});
			fillBreadcrumb();
			DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
		}
	});
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
	if (self.restaurant) { // restaurant already fetched!
		callback(null, self.restaurant)
		return;
	}
	const id = getParameterByName("id");
	if (!id) { // no id found in URL
		const error = "No restaurant id in URL"
		callback(error, null);
	} else {
		DBHelper.fetchRestaurantById(Number(id))
			.then(restaurant => {
				self.restaurant = restaurant;
				fillRestaurantHTML();
				callback(null, restaurant)

			})
			.catch(err => {
				console.error(err);
				return;
			});
	}
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
	const name = document.getElementById("restaurant-name");
	name.innerHTML = restaurant.name;

	const address = document.getElementById("restaurant-address");
	address.innerHTML = restaurant.address;

	const image = document.getElementById("restaurant-img");
	image.setAttribute("alt", restaurant.name);
	image.className = "restaurant-img"
	// image.src = DBHelper.imageUrlForRestaurant(restaurant);
	image.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);

	const cuisine = document.getElementById("restaurant-cuisine");
	cuisine.setAttribute("aria-label", restaurant.cuisine_type + " cuisine");
	cuisine.innerHTML = restaurant.cuisine_type;

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}
	// fill reviews
	const id = getParameterByName("id");
	DBHelper.fetchRestaurantReviewsById(Number(id))
		.then(reviews => {
			self.restaurant.reviews = reviews;
			fillReviewsHTML();
		})
		.catch(err => {
			console.error(err);
			return;
		});
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
	const hours = document.getElementById("restaurant-hours");
	for (let key in operatingHours) {
		const row = document.createElement("tr");

		const day = document.createElement("td");
		day.innerHTML = key;
		row.appendChild(day);

		const time = document.createElement("td");
		time.innerHTML = operatingHours[key];
		row.appendChild(time);

		hours.appendChild(row);
	}
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
	const container = document.getElementById("reviews-container");
	const title = document.createElement("h3");
	title.setAttribute("tabindex", "0");
	title.innerHTML = "Reviews";
	container.appendChild(title);

	if (!reviews) {
		const noReviews = document.createElement("p");
		noReviews.innerHTML = "No reviews yet!";
		container.appendChild(noReviews);
		return;
	}
	const ul = document.getElementById("reviews-list");
	reviews.forEach(review => {
		ul.insertBefore(createReviewHTML(review), ul.firstChild);
	});
	container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review, offline = false) => {
	const li = document.createElement("li");

	const reviewHeader = document.createElement("div");
	reviewHeader.classList.add("review-header");
	li.appendChild(reviewHeader);

	const name = document.createElement("div");
	name.setAttribute("tabindex", "0");
	name.classList.add("review-name");
	name.innerHTML = review.name;
	reviewHeader.appendChild(name);

	const date = document.createElement("div");
	date.setAttribute("tabindex", "0");
	date.classList.add("review-date");
	if (offline) {
		date.classList.add("offline");
		date.innerHTML = "OFFLINE";
	} else {
		date.innerHTML = new Date(review.createdAt).toLocaleString("en-US");
	}
	reviewHeader.appendChild(date);

	const rating = document.createElement("div");
	rating.setAttribute("tabindex", "0");
	rating.classList.add("review-rating");
	rating.innerHTML = `RATING: ${review.rating}`;
	li.appendChild(rating);

	const comments = document.createElement("p");
	comments.setAttribute("tabindex", "0");
	comments.innerHTML = review.comments;
	li.appendChild(comments);

	return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
	const breadcrumb = document.getElementById("breadcrumb");
	const li = document.createElement("li");
	li.innerHTML = restaurant.name;
	breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
	if (!url)
	{url = window.location.href;}
	name = name.replace(/[\[\]]/g, "\\$&");
	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results)
	{return null;}
	if (!results[2])
	{return "";}
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

sendReview = () => {
	event.preventDefault();

	const restaurant_id = getParameterByName("id");
	const name = document.getElementById("name").value;
	const rating = document.getElementById("rating").value;
	const comments = document.getElementById("comment").value;

	const newReview = {
		restaurant_id,
		name,
		rating,
		comments
	};

	DBHelper.addReview(newReview).then(response => {
		newReview.createdAt = new Date().toLocaleString("en-US");
		let reviewList = document.getElementById("reviews-list");
		reviewList.insertBefore(createReviewHTML(newReview), reviewList.firstChild);
		document.getElementById("review-form").reset();
	})
		.catch(err => {
			console.error(err);
			let reviewList = document.getElementById("reviews-list");
			reviewList.insertBefore(createReviewHTML(newReview, true), reviewList.firstChild);
			DBHelper.cacheReview(newReview);
			document.getElementById("review-form").reset();
		});
}

loadGM = () => {
	if (document.querySelectorAll("#map").length > 0) {
		let js_file = document.createElement("script");
		js_file.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA0lXs3wTok05cbwoEt2mikk2MSZv6_Muo&libraries=places&callback=initMap";
		document.getElementsByTagName("head")[0].appendChild(js_file);
	}
}