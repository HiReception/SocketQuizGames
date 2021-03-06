var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var validator = require("express-validator");
var session = require("express-session");
var flash = require("connect-flash");
var pg = require("pg");
const crypto = require("crypto");
const {parse} = require("pg-connection-string");



/*var rooms = [
	{
		title: "Test Title",
		type: "jeopardy",
		gameCode: "ABCD",
		registeredNames: ["Michael"],
		state: {},
	}
];*/

//pg.defaults.ssl = true;
const dbConfig = Object.assign(parse(process.env.DATABASE_URL), {max: 9});
var pool = new pg.Pool(dbConfig);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(validator());
app.use(session({
	secret: "There were times when I thought I'd never live to see the Bulldogs win the Premiership...",
	resave: true,
	saveUninitialized: false
}));
app.use(flash());
app.use(express.static("icons"));



app.get("/", function(req, res) {
	res.sendFile(__dirname + "/public/index.html");
});

app.get("/start", function(req, res) {
	res.sendFile(__dirname + "/public/startgame.html");
});

app.post("/host", 
	function createGameAndRedirect(req, res, next) {
		var gameTitle = req.body.gametitle;
			
		// generate four-letter unique code for game
		var gameCode = generateGameCode();
		// add new room with given details
		pool.query("INSERT INTO rooms(gamecode, title, type, registerednames, state, password) VALUES($1,$2,$3,$4,$5,crypt($6, gen_salt($7, 8)))",
			[gameCode, gameTitle, req.body.format, [], {}, req.body.password, "bf"], (err) => {
				if (err) {
					next(err);
				} else {
					res.send("/" + req.body.format + "/host?gamecode=" + gameCode);
				}
			}
		);
		
	}
);

app.post("/hostresume",
	function checkRoomExists(req, res, next) {
		var roomCode = req.body.gamecode.toUpperCase();
		if (!roomCode || roomCode === "") {
			next("blankRoom");
		}
		pool.query("SELECT * FROM rooms WHERE gameCode = $1", [roomCode], (err, dbRes) => {
			if (err) {
				next(err);
			} else {
				if (dbRes.rows.length === 0) {
					next("roomNotFound");
				} else {
					next();
				}
			}
		});
	},

	function checkPassword(req, res, next) {
		pool.query("SELECT * FROM rooms WHERE gameCode = $1 AND password = crypt($2, password)",
			[req.body.gamecode.toUpperCase(), req.body.password], (err, dbRes) => {
				if (err) {
					next(err);
				} else {
					if (dbRes.rows.length === 0) {
						next("wrongPassword");
					} else {
						next();
					}
				}
			}
		);
		
	},

	function redirect(req, res, next) {
		pool.query("SELECT type FROM rooms WHERE gameCode = $1", [req.body.gamecode.toUpperCase()], (err, dbRes) => {
			if (err) {
				next(err);
			} else {
				if (dbRes.rows.length === 0) {
					next("roomNotFound");
				} else {
					var type = dbRes.rows[0].type;
					res.send("/" + type + "/host?gamecode=" + req.body.gamecode.toUpperCase());
				}
			}
		});
		
	},

	function handleErrors(err, req, res) {
		res.status(400).send(err);
	}
);

app.get("/join", function(req, res) {
	res.sendFile(__dirname + "/public/joingame.html");
});

app.post("/play",
	function checkRoomExists(req, res, next) {
		var roomCode = req.body.gamecode.toUpperCase();
		if (!roomCode || roomCode === "") {
			next("blankRoom");
		}
		pool.query("SELECT * FROM rooms WHERE gameCode = $1", [roomCode], (err, dbRes) => {
			if (err) {
				next(err);
			} else {
				if (dbRes.rows.length === 0) {
					next("roomNotFound");
				} else {
					next();
				}
			}
		});
	},

	function checkNameNotTaken(req, res, next) {
		var screenName = req.body.name;
		if (screenName === "") {
			next("blankScreenName");
		} else {
			pool.query("SELECT * FROM rooms WHERE gameCode = $1", [req.body.gamecode.toUpperCase()], (err, dbRes) => {
				if (err) {
					next(err);
				} else {
					if (dbRes.rows.length === 0) {
						next("roomNotFound");
					} else {
						var registeredNames = dbRes.rows[0].registerednames;
						var currentNames = dbRes.rows[0].state.players.map(p => p.screenName);
						
						// check if any other user is using this name (this can include the same person reconnecting)
						var preExistingUserArray = registeredNames.filter(function(player) { return player === screenName; });
						if (preExistingUserArray.length === 0) {
							// no other users with this name, so continue on
							next();
						} else {
							// check if this user last played in the same room with the exact same name (i.e. left and came back in)
							var matchingString = dbRes.rows[0].gameCode + "|" + screenName;
							if (req.session.lastRoomAndName === matchingString) {
								if (currentNames.some(p => p.screenName == screenName)) {
									next();
								} else {
									// TODO user has entered once, had their screen name changed, left, and tried
									// to enter again using their original username.
									// This will now result in them being locked out, which should at least prevent
									// malicious circumventing of the change of username, but there has to be a better
									// way to handle this
									next("deadUsernameAttempt");
								}
								
								
							// if they didn't, reject them
							} else {
								next("screenNameTaken");
							}
						}
					}
				}
			});
		}
		
	},

	function assignCookieAndRedirect(req, res, next) {
		req.session.lastRoomAndName = req.body.gamecode + "|" + req.body.name;
		pool.query("SELECT type FROM rooms WHERE gameCode = $1", [req.body.gamecode.toUpperCase()], (err, dbRes) => {
			if (err) {
				next(err);
			} else {
				if (dbRes.rows.length === 0) {
					next("roomNotFound");
				} else {
					var type = dbRes.rows[0].type;
					res.send("/" + type + "/play?gamecode=" + req.body.gamecode.toUpperCase() + "&name=" + req.body.name);
				}
			}
		});
		
	},

	function handleErrors(err, req, res) {
		console.log("handleErrors called: " + err);
		res.status(400).send(err);
	}
);

app.get("/displaygame", function(req, res) {
	res.sendFile(__dirname + "/public/displaygame.html");
});

app.post("/display",
	function checkRoomExists(req, res, next) {
		var roomCode = req.body.gamecode.toUpperCase();
		if (!roomCode || roomCode === "") {
			next("blankRoom");
		}
		pool.query("SELECT * FROM rooms WHERE gameCode = $1", [roomCode], (err, dbRes) => {
			if (err) {
				next(err);
			} else {
				if (dbRes.rows.length === 0) {
					next("roomNotFound");
				} else {
					next();
				}
			}
		});
	},

	function redirect(req, res, next) {
		var roomCode = req.body.gamecode.toUpperCase();
		pool.query("SELECT type FROM rooms WHERE gameCode = $1", [roomCode], (err, dbRes) => {
			if (err) {
				next(err);
			} else {
				if (dbRes.rows.length === 0) {
					next("roomNotFound");
				} else {
					var type = dbRes.rows[0].type;
					res.send("/" + type + "/display?gamecode=" + roomCode);
				}
			}
		});
		
	},

	function handleErrors(err, req, res) {
		res.status(400).send(err);
	}
);

app.get("/minigames", function(req, res) {
	res.sendFile(__dirname + "/public/minigames.html");
});





app.get("/:game/host", function(req, res) {
	res.sendFile(__dirname + "/public/" + req.params.game + "/host.html");
});

app.get("/:game/play", function(req, res) {
	res.sendFile(__dirname + "/public/" + req.params.game + "/player.html");
});

app.get("/:game/display", function(req, res) {
	res.sendFile(__dirname + "/public/" + req.params.game + "/display.html");
});

app.use(express.static("public"));
app.use(express.static("icons"));

io.on("connection", function(socket) {
	
	
	socket.on("join request", function(info) {
		var gameCode = "code unknown";
		var screenName = "screen name unknown";
		gameCode = info.gameCode.toUpperCase();
		screenName = info.screenName;

		try {
			pool.query("SELECT * FROM rooms WHERE gameCode = $1", [gameCode], (err, dbRes) => {
				if (err) {
					socket.emit("room not found");
				} else {
					if (dbRes.rows.length === 0) {
						socket.emit("room not found");
					} else {
						const room = dbRes.rows[0];
						var id;
						// check if this user is reconnecting from earlier
						var preExistingUserArray = room.registerednames.filter(function(player) { return player === screenName; });
						if (preExistingUserArray.length === 0) {
							// Generate random ID for player
							id = crypto.randomBytes(8).toString("hex");
							// Safeguard against the same random ID being generated twice in the same game
							while (room.state.players.some(p => p.id === id)) {
								id = crypto.randomBytes(8).toString("hex");
							}
							
							room.registerednames.push(screenName);
							pool.query("UPDATE rooms SET registerednames = $1 WHERE gamecode = $2", [room.registerednames, room.gamecode]);
							
							socket.broadcast.to(room.gamecode).emit("new player", {screenName: screenName, id: id});
							socket.join(gameCode);
							socket.emit("accepted", {state: room.state, id: id});
						} else {
							if (room.state.players.some(p => p.screenName == screenName)) {
								id = room.state.players.find(p => p.screenName == screenName).id;
								socket.emit("accepted", {state: room.state, id: id});
								socket.join(gameCode);
							} else {
								// TODO user has entered once, had their screen name changed, left, and tried
								// to enter again using their original username.
								// This will now result in them being locked out, which should at least prevent
								// malicious circumventing of the change of username, but there has to be a better
								// way to handle this
								socket.emit("dead username attempt");
							}
						}

						socket.on("send answer", function(details) {

							var answer = {
								player: id,
								answer: details.submittedAnswer,
								time: details.timeTaken,
							};
							socket.broadcast.to(room.gamecode).emit("new answer", answer);
							
						});

						socket.on("send message to host", function(details) {
							socket.broadcast.to(room.gamecode).emit("new message", {
								player: id,
								details: details
							});
						});
						
						socket.on("disconnect", function() {
							console.log("User " + id + " disconnected from room " + gameCode);
						});
					}
				}
			});
		} catch (err) {
			socket.emit("room not found");
		}

	});

	socket.on("display request", function(details) {
		var gameCode = "code unknown";
		gameCode = details.gameCode.toUpperCase();
		console.log("Display Request: code " + gameCode);

		pool.query("SELECT * FROM rooms WHERE gameCode = $1", [gameCode], (err, dbRes) => {
			if (err) {
				console.log(err);
			} else {
				if (dbRes.rows.length === 0) {
					console.log("room not found");
				} else {
					const room = dbRes.rows[0];
					socket.join(gameCode);
					socket.emit("accepted");
					socket.emit("new game state", room.state);

					socket.on("set state", function(newState) {
						for (var propertyName in newState) {
							if (newState.hasOwnProperty(propertyName)) {
								room.state[propertyName] = newState[propertyName];
							}
						}
						console.log("new game state from display:");
						console.log(room.state);
						pool.query("UPDATE rooms SET state = $1 WHERE gamecode = $2", [room.state, room.gamecode]);
						socket.broadcast.to(details.gameCode).emit("new game state", room.state);
					});
				}
			}
		});
	});
	

	socket.on("host request", function(details) {
		try {
			pool.query("SELECT * FROM rooms WHERE gamecode = $1", [details.gameCode], (err, dbRes) => {
				if (err) {
					console.log(err);
				} else {
					if (dbRes.rows.length === 0) {
						console.log("room not found");
					} else {
						const thisRoom = dbRes.rows[0];
						console.log(thisRoom);
						socket.join(details.gameCode);
						// send the host back the details of this game
						socket.emit("game details", {
							gameTitle: thisRoom.title,
							gameCode: details.gameCode,
							gameSettings: thisRoom.settings,
							gameState: thisRoom.state
						});

						socket.on("send private message", function(messageDetails) {
							socket.broadcast.to(details.gameCode).emit("private message", messageDetails);
						});

						socket.on("set state", function(newState) {
							for (var propertyName in newState) {
								if (newState.hasOwnProperty(propertyName)) {
									thisRoom.state[propertyName] = newState[propertyName];
								}
							}
							pool.query("UPDATE rooms SET state = $1 WHERE gamecode = $2", [thisRoom.state, thisRoom.gamecode]);
							socket.broadcast.to(details.gameCode).emit("new game state", thisRoom.state);
						});

						socket.on("end game", function() {
							console.log("host has ended game in room " /* + gameCode */);
							
							// send message to all players that game has ended
							socket.broadcast.to(details.gameCode).emit("game over", {});
							// TODO remove this room from list
						});

						socket.on("play sound", function(id) {
							socket.broadcast.to(details.gameCode).emit("play sound", id);
						});
						
						socket.on("update settings", function(newSettings) {
							thisRoom.settings = newSettings;
						});
					}
				}
			});
		} catch (err) {
			socket.emit(err);
		}		
	});
});

var listenPort = process.env.PORT || 3000;

http.listen(listenPort, function() {
	console.log("SocketBuzzer server is listening on port " + listenPort);
});

var s = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateGameCode() {
	return Array(4).join().split(",").map(function() { return s.charAt(Math.floor(Math.random() * s.length)); }).join("");
}