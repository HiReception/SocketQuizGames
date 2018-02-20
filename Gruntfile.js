module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		browserify: {
			menu: {
				src: "js/menu.js",
				dest: "public/menuBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}]
					]
				}
			},
			sotc_podiums: {
				src: "js/sotc/podiums.js",
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
				src: "js/feud/test.js",
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
				src: "js/sotc/cashcard.js",
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
				src: "js/jeopardy/player.js",
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
				src: "js/jeopardy/host.js",
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
				src: "js/jeopardy/display.js",
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
				src: "js/genericquiz/player.js",
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
				src: "js/genericquiz/host.js",
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
				src: "js/genericquiz/display.js",
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
				src: "js/wof-board/display.js",
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
				src: "js/wof-board/host.js",
				dest: "public/wof-board/hostBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}],
						"brfs"
					]
				}
			},
			tpir_wheel_display: {
				src: "js/tpir-wheel/display.js",
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
				src: "js/tpir-plinko/display.js",
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
				src: "js/wof-wheel/display.js",
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
				src: "js/wwtbam-ff/player.js",
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
				src: "js/wwtbam-ff/host.js",
				dest: "public/wwtbam-ff/hostBundle.js",
				options: {
					transform: [
						["babelify", {
							presets: ["react", "es2015", "stage-1"]
						}],
						"brfs"
					]
				}
			},
			wwtbam_ff_display: {
				src: "js/wwtbam-ff/display.js",
				dest: "public/wwtbam-ff/displayBundle.js",
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
			menu: {
				options: {
					style: "compressed",
				},
				files : {
					"public/menu.css": "js/menu.scss",
				},
			},
			jeopardy: {
				options: {
					style: "compressed",
				},
				files: {
					"public/jeopardy/host.css": "js/jeopardy/host.scss",
					"public/jeopardy/player.css": "js/jeopardy/player.scss",
					"public/jeopardy/display.css": "js/jeopardy/display.scss",
				}
			},
			wwtbam_ff: {
				options: {
					style: "compressed",
				},
				files: {
					"public/wwtbam-ff/host.css": "js/wwtbam-ff/host.scss",
					"public/wwtbam-ff/player.css": "js/wwtbam-ff/player.scss",
					"public/wwtbam-ff/display.css": "js/wwtbam-ff/display.scss",
				}
			},
			genericquiz: {
				options: {
					style: "compressed",
				},
				files: {
					"public/genericquiz/host.css": "js/genericquiz/host.scss",
					"public/genericquiz/player.css": "js/genericquiz/player.scss",
					"public/genericquiz/display.css": "js/genericquiz/display.scss",
				}
			},
			wof_board: {
				options: {
					style: "compressed",
				},
				files: {
					"public/wof-board/host.css": "js/wof-board/host.scss",
					"public/wof-board/display.css": "js/wof-board/display.scss",
				}
			},
			sotc: {
				options: {
					style: "compressed",
				},
				files: {
					"public/sotc/cashcard.css": "js/sotc/cashcard.scss",
					"public/sotc/podiums.css": "js/sotc/podiums.scss",
				}
			},
			tpir_plinko: {
				options: {
					style: "compressed",
				},
				files: {
					"public/tpir-plinko/display.css": "js/tpir-plinko/display.scss",
				}
			},
			wof_wheel: {
				options: {
					style: "compressed",
				},
				files: {
					"public/wof-wheel/display.css": "js/wof-wheel/display.scss",
				}
			},
			tpir_wheel: {
				options: {
					style: "compressed",
				},
				files: {
					"public/tpir-wheel/display.css": "js/tpir-wheel/display.scss",
				}
			},
			feud: {
				options: {
					style: "compressed",
				},
				files: {
					"public/feud/test.css": "js/feud/test.scss",
				}
			}
		},
	});

	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-watchify");
	grunt.loadNpmTasks("grunt-newer");
	grunt.loadNpmTasks("grunt-sass");
	grunt.registerTask("default", ["browserify", "sass"]);
};