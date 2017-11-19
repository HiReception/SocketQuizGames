module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		browserify: {
			sotc_podiums: {
				src: "public/sotc/podiums.js",
				dest: "public/sotc/podiumsBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			feud_test: {
				src: "public/feud/test.js",
				dest: "public/feud/testBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			sotc_cashcard: {
				src: "public/sotc/cashcard.js",
				dest: "public/sotc/cashcardBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			jeopardy_player: {
				src: "public/jeopardy/player.js",
				dest: "public/jeopardy/playerBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			jeopardy_host: {
				src: "public/jeopardy/host.js",
				dest: "public/jeopardy/hostBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}],
						"brfs"
					]
				}
			},
			jeopardy_display: {
				src: "public/jeopardy/display.js",
				dest: "public/jeopardy/displayBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			genericquiz_player: {
				src: "public/genericquiz/player.js",
				dest: "public/genericquiz/playerBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			genericquiz_host: {
				src: "public/genericquiz/host.js",
				dest: "public/genericquiz/hostBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			genericquiz_display: {
				src: "public/genericquiz/display.js",
				dest: "public/genericquiz/displayBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			wof_board_display: {
				src: "public/wof-board/display.js",
				dest: "public/wof-board/displayBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			wof_board_host: {
				src: "public/wof-board/host.js",
				dest: "public/wof-board/hostBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			tpir_wheel_display: {
				src: "public/tpir-wheel/display.js",
				dest: "public/tpir-wheel/displayBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			tpir_plinko_display: {
				src: "public/tpir-plinko/display.js",
				dest: "public/tpir-plinko/displayBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			wof_wheel_display: {
				src: "public/wof-wheel/display.js",
				dest: "public/wof-wheel/displayBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			wwtbam_ff_player: {
				src: "public/wwtbam-ff/player.js",
				dest: "public/wwtbam-ff/playerBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			wwtbam_ff_host: {
				src: "public/wwtbam-ff/host.js",
				dest: "public/wwtbam-ff/hostBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}],
						"brfs"
					]
				}
			}
		},
		sass: {
			jeopardy: {
				options: {
					style: "compressed",
				},
				files: {
					"public/jeopardy/host.css": "public/jeopardy/host.scss",
					"public/jeopardy/player.css": "public/jeopardy/player.scss",
					"public/jeopardy/display.css": "public/jeopardy/display.scss",
				}
			}
		},
	});

	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-watchify");
	grunt.loadNpmTasks("grunt-newer");
	grunt.loadNpmTasks("grunt-contrib-sass");
	grunt.registerTask("default", ["browserify", "sass"]);
};