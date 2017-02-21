var Matter = require("matter-js");
var decomp = require("poly-decomp");

var React = require("react");
var ReactDOM = require("react-dom");
var $ = require("jquery");
var soundManager = require("soundmanager2").soundManager;

soundManager.setup({

	onready: function() {
		// SM2 has loaded, API ready to use e.g., createSound() etc.
		soundManager.createSound({id: "smallwin", url: "./sounds/smallwin.wav", autoLoad: true});
		soundManager.createSound({id: "bigwin", url: "./sounds/bigwin.wav", autoLoad: true});
		soundManager.createSound({id: "buzzer", url: "./sounds/buzzer.wav", autoLoad: true});
		soundManager.createSound({id: "plink", url: "./sounds/click.wav", autoLoad: true});
	},

	ontimeout: function() {
		// Uh-oh. No HTML5 support, SWF missing, Flash blocked or other issue
	}

});


var valueDecided = false;
var playerTotal = 0;
var spaceArray = [500, 1000, 2500, 0, 10000, 0, 2500, 1000, 500];
var colourArray = ["#E21E5E", "#5CB6D0", "#E5218A", "#E21E5E", "#5CB6D0", "#E21E5E", "#E5218A", "#5CB6D0", "#E21E5E"];

// module aliases
var Engine = Matter.Engine,
	Render = Matter.Render,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Events = Matter.Events,
	Vertices = Matter.Vertices;

// create an engine
var engine = Engine.create();

var pegGap = 32;
var dividerHeight = 30;

var chipRadius = 13;
var boardHeight = 13 * pegGap + dividerHeight;
var boardWidth = pegGap * 9;


var dropZoneHeight = boardHeight/4;

document.getElementById("scoreboard-container").style.height = boardHeight * 1.5 + "px";
document.getElementById("scoreboard-container").style.minHeight = boardHeight * 1.5 + "px";
document.getElementById("scoreboard-container").style.width = boardWidth * 1.5 + "px";
document.getElementById("scoreboard-container").style.minWidth = boardWidth * 1.5 + "px";

// create a renderer
var render = Render.create({
	element: document.getElementById("board"),
	engine: engine,
	options: {
		width: boardWidth,
		height: boardHeight + dropZoneHeight,
		hasBounds: true,
		wireframes: false,
		background: "white",
	}
	
});

var chip;

var chipSpawnConstraint = Matter.MouseConstraint.create(engine, {});

Events.on(chipSpawnConstraint, "mousedown", function(event) {
	if (chip) {
		World.remove(engine.world, chip);
	}
	console.log("(" + event.mouse.position.x + "," + event.mouse.position.x);
	var rect = document.getElementById("board").getBoundingClientRect();
	chip = Bodies.circle(event.mouse.position.x - rect.left, event.mouse.position.y - rect.top, chipRadius, {
		restitution: 0.6,
		friction: 0.05,
		render: {
			sprite: {
				texture: "chipswatch.png",
				xScale: (chipRadius * 2)/50,
				yScale: (chipRadius * 2)/50,
			}
		}
	});

	World.add(engine.world, chip);
	valueDecided = false;
});







var leftmostPeg = pegGap/2;
var topmostPeg = dropZoneHeight;

var i;

function handleValue(value) {
	valueDecided = true;
	console.log("$" + value);
	playerTotal += value;
	console.log("Total: $" + playerTotal);
	$("#scoreboard").text("$" + playerTotal.toLocaleString("en-US"));
	switch (value) {
	case 0:
		soundManager.play("buzzer", {
			multiShotEvents: true
		});
		break;
	case 500:
	case 1000:
	case 2500:
		soundManager.play("smallwin", {
			multiShotEvents: true
		});
		break;
	case 10000:
		soundManager.play("bigwin", {
			multiShotEvents: true
		});
		break;
	}
}



for (var r = 0; r < 13; r++) {
	if (r % 2 != 0) {
		for (i = 0; i < 9; i++) {
			World.add(engine.world, Bodies.circle((i*pegGap + leftmostPeg), (topmostPeg + r * pegGap), 2, {
				isStatic: true,
				render: {
					fillStyle: "black"
				}
			}));
		}
		var leftBankVerts = Vertices.fromPath([
			leftmostPeg, (topmostPeg + r * pegGap),
			leftmostPeg - pegGap/2, (topmostPeg + (r-1) * pegGap),
			leftmostPeg - pegGap/2, (topmostPeg + (r+1) * pegGap)
		].join(" "));
		World.add(engine.world, Bodies.fromVertices(leftmostPeg - pegGap/4 - 3, (topmostPeg + r * pegGap), leftBankVerts, {
			isStatic: true,
			render: {
				fillStyle: "grey"
			}
		}));
		var rightBankVerts = Vertices.fromPath([
			leftmostPeg + (pegGap * 8), (topmostPeg + r * pegGap),
			leftmostPeg + (pegGap * 8) + pegGap/2, (topmostPeg + (r-1) * pegGap),
			leftmostPeg + (pegGap * 8) + pegGap/2, (topmostPeg + (r+1) * pegGap)
		].join(" "));
		World.add(engine.world, Bodies.fromVertices(leftmostPeg + (pegGap * 8) + pegGap/4 + 3, (topmostPeg + r * pegGap), rightBankVerts, {
			isStatic: true,
			render: {
				fillStyle: "grey"
			}		
		}));
	} else {
		for (i = 0; i < 8; i++) {
			World.add(engine.world, Bodies.circle((i*pegGap + leftmostPeg + (pegGap/2)), (topmostPeg + r * pegGap), 2, {
				isStatic: true,
				render: {
					fillStyle: "black"
				}
			}));
		}
	}
}



for (i = 0; i < 10; i++) {
	World.add(engine.world, Bodies.rectangle((i*pegGap + leftmostPeg - (pegGap/2)), topmostPeg + 13 * pegGap + dividerHeight/2,
		2, dividerHeight, {
			isStatic: true,
			render: {
				fillStyle: "black"
			}
		}
	));
	if (i <= 8) {
		World.add(engine.world, Bodies.rectangle(i*pegGap + leftmostPeg,
			topmostPeg + 13 * pegGap + 5*(dividerHeight/2) + 5,
			pegGap, pegGap * 3, {
				slotValue: spaceArray[i],
				isStatic: true,
				render: {
					fillStyle: colourArray[i],
					strokeStyle: "yellow",
					lineWidth: 2
				}
			}
		));
	}
}

// an example of using collisionStart event on an engine
Events.on(engine, "collisionStart", function(event) {
	console.log("plink");
	soundManager.play("plink", {
		multiShotEvents: true
	});
	var pairs = event.pairs;
	for (var pair in pairs) {
		if (!valueDecided) {
			if (typeof pairs[pair].bodyA.slotValue !== "undefined") {
				handleValue(pairs[pair].bodyA.slotValue);
			}
			if (typeof pairs[pair].bodyB.slotValue !== "undefined") {
				handleValue(pairs[pair].bodyB.slotValue);
			}
		}
		
	}
});

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);