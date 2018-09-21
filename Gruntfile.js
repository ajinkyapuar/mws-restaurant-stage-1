/* eslint-env node */

module.exports = function(grunt) {
	require("load-grunt-tasks")(grunt);

	grunt.initConfig({
		responsive_images: {
			dev: {
				options: {
					engine: "im",
					sizes: [{
						width: 800,
						suffix: "_large_1x",
						quality: 50
					},{
						width: 400,
						suffix: "_small_1x",
						quality: 50
					}]
				},
				files: [{
					expand: true,
					src: ["*.{gif,jpg,png}"],
					cwd: "images_src/",
					dest: "images_src/responsive/"
				}]
			}
		},
		webp: {
			options: {
				preset: "photo",
				verbose: true,
				quality: 60,
				alphaQuality: 60,
				compressionMethod: 6,
				segments: 4,
				psnr: 42,
				sns: 50,
				filterStrength: 40,
				filterSharpness: 3,
				simpleFilter: true,
				partitionLimit: 50,
				analysisPass: 6,
				multiThreading: true,
				lowMemory: false,
				alphaMethod: 0,
				alphaFilter: "best",
				alphaCleanup: true,
				noAlpha: false,
				lossless: false
			},
			files: {
				expand: true,
				src: "*.{jpg,png}",
				cwd: "images_src/responsive/",
				dest: "img/"
			}
		},
		uglify: {
			options: {
				sourceMap: true
			},
			main: {
				files: {
					"js/main.min.js": ["src/js/lazyload.min.js", "src/js/idb.js", "src/js/dbhelper.js", "src/js/main.js"]
				}
			},
			restaurant: {
				files: {
					"js/restaurant.min.js": ["src/js/lazyload.min.js", "src/js/idb.js", "src/js/dbhelper.js", "src/js/restaurant_info.js"]
				}
			}
		}
	});

	grunt.registerTask("default", ["responsive_images", "webp"]);
	grunt.registerTask("images", ["responsive_images", "webp"]);
	grunt.registerTask("js", ["uglify:main", "uglify:restaurant"]);
};
