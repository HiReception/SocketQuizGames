var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var validator = require("express-validator");
var session = require("express-session");
var flash = require("connect-flash");

var rooms = [
	{
		title: "Test Title",
		type: "jeopardy",
		gameCode: "ABCD",
		players: [
			{
				screenName: "",
				correctAnswers: 0,
				incorrectAnswers: 0,
				score: 0,
				active: true,
				secret: false,
				colour: "#898CFF"
			}
		],
		sockets: new Map(),
		questions: [
			{
				type: "multiple-choice",
				questionNo: 1,
				questionBody: "Test Multiple-Choice Question",
				options: [
					{answerKey: "A", body: "Option A"},
					{answerKey: "B", body: "Option B"},
					{answerKey: "C", body: "Option C"},
					{answerKey: "D", body: "Option D"}
				],
				correctOption: "A",
				open: false,
				answers: []
			},
			{
				type: "text",
				questionNo: 2,
				questionBody: "Test Text-based Question",
				open: true,
				answers: []
			}
		],
		hostSocket: false // use the socket of the user that creates the game
	}
];

app.use(bodyParser.urlencoded({extended: false}));
app.use(validator());
app.use(session({
	secret: "There were times when I thought I'd never live to see the Bulldogs win the Premiership...",
	resave: true,
	saveUninitialized: false
}));
app.use(flash());



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
		var gameSettings = {
			correctPoints: 1,
			incorrectPoints: 0
		};
		// add new room with given details
		var thisRoom = {
			title: gameTitle,
			type: req.body.format,
			gameCode: gameCode,
			settings: gameSettings,
			state: {},
			players: [],
			sockets: new Map(),
			questions: [],
			hostSocket: null
		};
		rooms.push(thisRoom);
		console.log("After push, rooms.length = " + rooms.length);
		res.redirect("/" + thisRoom.type + "/host?gamecode=" + thisRoom.gameCode);
	}
);

app.get("/join", function(req, res) {
	res.sendFile(__dirname + "/public/joingame.html");
});

app.post("/play",
	function checkRoomExists(req, res, next) {
		console.log("checkRoomExists called");
		var roomCode = req.body.gamecode.toUpperCase();
		console.log(roomCode);
		if (!roomCode || roomCode === "") {
			next("blankRoom");
		}
		var roomArray = rooms.filter(function(room) { return room.gameCode === roomCode; });
		if (roomArray.length > 0) {
			next();
		} else {
			next("roomNotFound");
		}
	},

	function checkNameNotTaken(req, res, next) {
		console.log("checkNameNotTaken called");
		var room = rooms.filter(function(room) { return room.gameCode === req.body.gamecode.toUpperCase(); })[0];
		var screenName = req.body.name;
		if (screenName === "") {
			next("blankScreenName");
		} else {
			// check if any other user is using this name (this can include the same person reconnecting)
			var preExistingUserArray = room.players.filter(function(player) { return player.screenName === screenName; });
			console.log("Number of current users with matching screenName of " + screenName + ": " + preExistingUserArray.length);
			if (preExistingUserArray.length === 0) {
				// no other users with this name, so continue on
				next();
			} else {
				// check if this user last played in the same room with the exact same name (i.e. left and came back in)
				var matchingString = room.gameCode + "|" + screenName;
				if (req.session.lastRoomAndName === matchingString) {
					next();
				// if they didn't, reject them
				} else {
					next("screenNameTaken");
				}
			}
		}

		
	},

	function assignCookieAndRedirect(req, res, next) {
		console.log("assignCookieAndRedirect called");
		req.session.lastRoomAndName = req.body.gamecode + "|" + req.body.name;
		var room = rooms.filter(function(room) { return room.gameCode === req.body.gamecode.toUpperCase(); })[0];
		res.redirect("/" + room.type + "/play?gamecode=" + room.gameCode + "&name=" + req.body.name);
	},

	function handleErrors(err, req, res, next) {
		console.log("handleErrors called");
		res.redirect("/join?err=" + err + "&gamecode=" + req.body.gamecode + "&name=" + req.body.name);
	}
);

app.get("/displaygame", function(req, res) {
	res.sendFile(__dirname + "/public/displaygame.html");
});

app.post("/display",
	function checkRoomExists(req, res, next) {
		console.log("checkRoomExists called");
		var roomCode = req.body.gamecode.toUpperCase();
		console.log(roomCode);
		if (!roomCode || roomCode === "") {
			next("blankRoom");
		}
		var roomArray = rooms.filter(function(room) { return room.gameCode === roomCode; });
		if (roomArray.length > 0) {
			next();
		} else {
			next("roomNotFound");
		}
	},

	function redirect(req, res, next) {
		console.log("redirect called");
		var room = rooms.filter(function(room) { return room.gameCode === req.body.gamecode.toUpperCase(); })[0];
		res.redirect("/" + room.type + "/display?gamecode=" + room.gameCode);
	},

	function handleErrors(err, req, res, next) {
		console.log("handleErrors called");
		res.redirect("/displaygame?err=" + err + "&gamecode=" + req.body.gamecode);
	}
);





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
	console.log("User Connected");
	
	
	socket.on("join request", function(info) {
		var thisUser = {};
		var gameCode = "code unknown";
		var screenName = "screen name unknown";
		gameCode = info.gameCode.toUpperCase();
		screenName = info.screenName;
		console.log("Info: code " + gameCode + " name " + screenName);

		try {
			var room = rooms.find(function(room) { return room.gameCode === gameCode; });
			// check if this user is reconnecting from earlier
			var preExistingUserArray = room.players.filter(function(player) { return player.screenName === screenName; });
			console.log("Number of current users with matching screenName of " + screenName + ": " + preExistingUserArray.length);
			if (preExistingUserArray.length === 0) {
				// create a new user with the given data, plus a randomly-generated secret
				var newUser = {
					screenName: screenName,
					correctAnswers: 0,
					incorrectAnswers: 0,
					score: 0,
					active: true,
					colour: userColourList[room.players.length % userColourList.length]
				};
				room.players.push(newUser);
				room.sockets.set(screenName, socket);
				console.log("Added new player to list");
				room.hostSocket.emit("new player", newUser);
				console.log("Alerted host of new player");
				socket.join(gameCode);
				console.log("Joined player to room " + gameCode);
				thisUser = newUser;
				socket.emit("flag");
				socket.emit("accepted", newUser);
				console.log("sent message of acceptance to user");
				// send the latest question, or a welcome message if there aren't any
				if (room.questions.length > 0) {
					if (room.questions[room.questions.length-1].open) {
						console.log("sending open question");
						socket.emit("new question", room.questions[room.questions.length-1]);
					} else {
						socket.emit("new message", {
							primary: "Welcome to " + room.title + "!",
							secondary: "As soon as the next question is in, you'll see it here. Best of luck!"
						});
					}
				} else {
					socket.emit("new message", {
						primary: "Welcome to " + room.title + "!",
						secondary: "The first question will appear here when the host is ready. Best of luck!"
					});
				}
			} else {
				var preExistingUser = preExistingUserArray[0];
				thisUser = preExistingUser;
				room.sockets.set(thisUser.screenName, socket);
				socket.emit("accepted", preExistingUser);
				// send them the latest open question, ONLY if they haven't provided an answer to it yet
				if (room.questions.length > 0) {
					if (room.questions[room.questions.length-1].open) {
						var latestQuestion = room.questions[room.questions.length-1];
						console.log("sending open question");
						socket.emit("new question", latestQuestion);
					} else {
						// if the latest question is closed, send them a welcome back message
						socket.emit("new message", {
							primary: "Welcome Back!",
							secondary: "There is no open question at the moment. Stay tuned!"
						});
					}
				} else {
					// if there are still no questions at all, send them a welcome back message
					socket.emit("new message", {
						primary: "Welcome Back!",
						secondary: "You haven't missed anything, we're still waiting for the first question."
					});
				}
			}

			socket.on("send answer", function(details) {
				console.log("answer received:");
				console.log(details);
				console.log("from player: ");
				console.log(thisUser);

				var answer = {
					player: thisUser,
					answer: details.submittedAnswer,
					time: 0 // TODO keep time between receiving the question and submitting an answer
				};
				console.log("emitting new answer");
				room.hostSocket.emit("new answer", answer);
				
			});

			socket.on("send message to host", function(details) {
				console.log("player " + screenName + "has sent a private message to the host in room " + gameCode + ":");
				console.log(details);
				room.hostSocket.emit("new message", {
					player: thisUser,
					details: details
				});
			});
			
			socket.on("disconnect", function() {
				console.log("User " + screenName + " disconnected from room " + gameCode);
			});	
		} catch (err) {
			console.log("room not found");
			socket.emit("room not found");
		}

	});

	socket.on("display request", function(details) {
		var gameCode = "code unknown";
		gameCode = details.gameCode.toUpperCase();
		console.log("Display Request: code " + gameCode);

		var room = rooms.filter(function(room) { return room.gameCode === gameCode; })[0];
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
			socket.broadcast.to(details.gameCode).emit("new game state", room.state);
		});
	});
	

	socket.on("host request", function(details) {
		try {
			console.log(details);
			var thisRoom = rooms.find(function(r) {
				return r.gameCode === details.gameCode;
			});
			thisRoom.hostSocket = socket;
			socket.join(details.gameCode);
			// send the host back the details of this game
			socket.emit("game details", {
				gameTitle: thisRoom.title,
				gameCode: details.gameCode,
				gameSettings: thisRoom.settings,
				gameState: thisRoom.state
			});
			
			socket.on("send question", function(question) {
				// make sure last question in array is closed (if there is one)
				console.log("new question received");
				console.log(question);
				if (thisRoom.questions.length > 0) {
					var lastQuestion = thisRoom.questions[thisRoom.questions.length - 1];
					lastQuestion.open = false;
				}
				
				// add new question to list
				thisRoom.questions.push(question);
				// emit new question to players
				socket.broadcast.to(details.gameCode).emit("new question", question);
			});

			socket.on("send private message", function(messageDetails) {
				var userSocket = thisRoom.sockets.get(messageDetails.screenName);
				if (typeof userSocket === "undefined") {
					socket.emit("User not found");
				} else {
					userSocket.emit("new message", messageDetails.message);
				}
				
			});

			socket.on("set state", function(newState) {
				for (var propertyName in newState) {
					if (newState.hasOwnProperty(propertyName)) {
						thisRoom.state[propertyName] = newState[propertyName];
					}
				}
				console.log("new game state from host:");
				console.log(thisRoom.state);
				socket.broadcast.to(details.gameCode).emit("new game state", thisRoom.state);
			});


			socket.on("close question", function(questionNo) {
				// set corresponding question in array to "closed"
				var questionToClose = thisRoom.questions.find(function(q) {return q.questionNo === questionNo;});
				questionToClose.open = false;
				// emit "question closed" to all in this room
				socket.broadcast.to(details.gameCode).emit("question closed", questionNo);
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
		} catch (err) {
			console.log(err);
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

var userColourList = [
	"#898CFF","#FE89B5","#FFDC8A","#90D4F7",
	"#71DF96","#F5A26E","#658DE5","#ED6E79",
	"#59D0E4","#DA96DF","#CEF381","#FE96E3",
	"#BB96FF","#66EEBC"
];