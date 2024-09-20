// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
window.requestAnimationFrame = (function () {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (/* function */ callback, /* DOMElement */ element) {
			window.setTimeout(callback, 1000 / 60);
		};
})();


function Timer() {
	this.gameTime = 0;
	this.maxStep = 0.05;
	this.wallLastTimestamp = 0;
}
;

Timer.prototype.tick = function () {
	var wallCurrent = Date.now();
	var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
	this.wallLastTimestamp = wallCurrent;

	var gameDelta = Math.min(wallDelta, this.maxStep);
	this.gameTime += gameDelta;
	return gameDelta;
};

function GameEngine() {
	this.entities = [];
	this.showOutlines = false;
	this.ctx = null;
	this.click = null;
	this.mouse = null;
	this.wheel = null;
	this.surfaceWidth = null;
	this.surfaceHeight = null;
	this.KBeenHandled = false;
}
;

GameEngine.prototype.init = function (ctx) {
	this.ctx = ctx;
	this.surfaceWidth = this.ctx.canvas.width;
	this.surfaceHeight = this.ctx.canvas.height;
	this.startInput();
	this.timer = new Timer();
	//	console.log('game initialized');
};

GameEngine.prototype.start = function () {
	//	console.log("starting game");
	var that = this;
	(function gameLoop() {
		that.loop();
		requestAnimationFrame(gameLoop, that.ctx.canvas);
	})();
};

GameEngine.prototype.startInput = function () {
	//	console.log('Starting input');
	var that = this;

	this.ctx.canvas.addEventListener("keydown", function (e) {
		if (String.fromCharCode(e.which) === 'A')
			that.a = true;
		if (String.fromCharCode(e.which) === 'W')
			that.w = true;
		if (String.fromCharCode(e.which) === 'S')
			that.s = true;
		if (String.fromCharCode(e.which) === 'D')
			that.d = true;
		if (String.fromCharCode(e.which) === ' ') {
			that.j = true;
			e.preventDefault();
		}
		if (e.keyCode >= 37 && e.keyCode <= 40)
			e.preventDefault();
	}, false);

	this.ctx.canvas.addEventListener("keyup", function (e) {
		if (String.fromCharCode(e.which) === 'A')
			that.a = false;
		if (String.fromCharCode(e.which) === 'W')
			that.w = false;
		if (String.fromCharCode(e.which) === 'S')
			that.s = false;
		if (String.fromCharCode(e.which) === 'D')
			that.d = false;
		if (String.fromCharCode(e.which) === ' ')
			that.j = false;
		if (e.keyCode === 37)
			that.left = true;
		if (e.keyCode === 38)
			that.up = true;
		if (e.keyCode === 39)
			that.right = true;
		if (e.keyCode === 40)
			that.down = true;
	}, false);

	//	console.log('Input started');
};

GameEngine.prototype.addEntity = function (entity) {
	//	console.log('added entity');
	this.entities.push(entity);
};

GameEngine.prototype.draw = function () {
	this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	this.ctx.save();
	var transX = -(this.camera.x - this.camera.width / 2);
	var transY = -(this.camera.y - this.camera.height / 2);
	this.ctx.translate(transX, transY);
	this.map.draw(this.ctx);
	for (var i = 0; i < this.entities.length; i++) {
		if (this.entities[i] && (this.camera.onScreen(this.entities[i]) ||
			this.entities[i] instanceof Map ||
			this.entities[i] instanceof PlayerInfo)) {
			
			this.entities[i].draw(this.ctx);
		}
	}
	this.playerInfo.draw(this.ctx);
	
	this.ctx.restore();
};

GameEngine.prototype.update = function () {
	var entitiesCount = this.entities.length;

	for (var i = 0; i < entitiesCount; i++) {
		var entity = this.entities[i];
		// console.log(entity);
		if (entity && !entity.removeFromWorld) {
			entity.update();
		}
	}
	
	this.entities.sort(function(a, b) {
		if (a instanceof FlatTerrain) return -1;
		if (b instanceof FlatTerrain) return 1;
		return (a.y + a.height) - (b.y + b.height);
	});
	
	for (var i = this.entities.length - 1; i >= 0; --i) {
		if (!this.entities[i] || this.entities[i].removeFromWorld) {
			if (this.entities[i] instanceof Enemy)
				this.entities[i].update();
			this.entities.splice(i, 1);
		}
	}
	this.playerInfo.update();
};

GameEngine.prototype.loop = function () {
	this.clockTick = this.timer.tick();
	this.update();
	this.draw();
	this.space = null;
};

function Entity(game, x, y) {
	this.game = game;
	this.x = x;
	this.y = y;
	this.removeFromWorld = false;
}
;

Entity.prototype.update = function () {
};

Entity.prototype.draw = function (ctx) {
	if (this.game.showOutlines && this.radius) {
		ctx.strokeStyle = "red";
		ctx.strokeRect(this.x, this.y, this.width, this.height);
		ctx.beginPath();
		ctx.strokeStyle = "green";
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.stroke();
		ctx.closePath();
	}
};

Entity.prototype.collide = function (other) {
	return (this.x < other.x + other.width &&
	this.x + this.width > other.x &&
	this.y < other.y + other.height &&
	this.height + this.y > other.y);
}

Entity.prototype.rotateAndCache = function (image, angle) {
	var offscreenCanvas = document.createElement('canvas');
	var size = Math.max(image.width, image.height);
	offscreenCanvas.width = size;
	offscreenCanvas.height = size;
	var offscreenCtx = offscreenCanvas.getContext('2d');
	offscreenCtx.save();
	offscreenCtx.translate(size / 2, size / 2);
	offscreenCtx.rotate(angle);
	offscreenCtx.translate(0, 0);
	offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
	offscreenCtx.restore();
	//offscreenCtx.strokeStyle = "red";
	//offscreenCtx.strokeRect(0,0,size,size);
	return offscreenCanvas;
};
function AssetManager() {
	this.successCount = 0;
	this.errorCount = 0;
	this.cache = [];
	this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
	//	console.log("Queueing " + path);
	this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
	return this.downloadQueue.length === this.successCount + this.errorCount;
}

AssetManager.prototype.downloadAll = function (callback) {
	for (var i = 0; i < this.downloadQueue.length; i++) {
		var img = new Image();
		var that = this;

		var path = this.downloadQueue[i];
		//		console.log(path);

		img.addEventListener("load", function () {
			//			console.log("Loaded " + this.src);
			that.successCount++;
			if (that.isDone())
				callback();
		});

		img.addEventListener("error", function () {
			//			console.log("Error loading " + this.src);
			that.errorCount++;
			if (that.isDone())
				callback();
		});

		img.src = path;
		this.cache[path] = img;
	}
}

AssetManager.prototype.getAsset = function (path) {
	return this.cache[path];
}

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
	this.spriteSheet = spriteSheet;
	this.startX = startX;
	this.startY = startY;
	this.frameWidth = frameWidth;
	this.frameDuration = frameDuration;
	this.frameHeight = frameHeight;
	this.frames = frames;
	this.totalTime = frameDuration * frames;
	this.elapsedTime = 0;
	this.loop = loop;
	this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
	var scaleBy = scaleBy || 1;
	this.elapsedTime += tick;
	if (this.loop) {
		if (this.isDone()) {
			this.elapsedTime = 0;
		}
	} else if (this.isDone()) {
		return;
	}
	var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
	var vindex = 0;
	while ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
		index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
		vindex++;
	}

	var locX = x;
	var locY = y;
	ctx.drawImage(this.spriteSheet,
		index * this.frameWidth + this.startX,
		vindex * this.frameHeight + this.startY, // source from sheet
		this.frameWidth, this.frameHeight,
		locX, locY,
		this.frameWidth * scaleBy,
		this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
	return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
	return (this.elapsedTime >= this.totalTime);
}
function PlayerInfo(game) {
	Entity.call(this, game);
	this.heartSheet = ASSET_MANAGER.getAsset("img/heartspritesheet.png");
	this.hearts = [new Animation(this.heartSheet, 0, 0, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 58, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 116, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 174, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 232, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 290, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 348, 186, 58, 0.2, 1, true, false)
	];
	this.createButton = true;
	this.minimap = new MiniMap(game);
}


PlayerInfo.prototype = new Entity();
PlayerInfo.prototype.constructor = PlayerInfo;

PlayerInfo.prototype.update = function() {
	if (this.game.hero.lives <= 0) {
		this.game.hero.lives = -Infinity;
		this.game.entities.forEach(function(d) { if (d) d.removeFromWorld = true; });
	}
	
}

PlayerInfo.prototype.draw = function (ctx) {
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	var camera = this.game.camera;
	if (this.game.hero.lives <= 0) {
		var img = ASSET_MANAGER.getAsset("img/game-over-screen.png");
		ctx.drawImage(img, 0, 0, camera.width, camera.height);
		if (this.createButton) {
			document.getElementById('resetButton').style.display = "inline";
			this.createButton = false;
		}
	} else if (this.game.drDarkabolical.dead) {
		var img = ASSET_MANAGER.getAsset("img/win-screen.png");
		ctx.drawImage(img, 0, 0, camera.width, camera.height);
		if (this.createButton) {
			document.getElementById('resetButton').style.display = "inline";
			this.createButton = false;
		}
	} else {
		// ctx.textAlign = "right";
		// ctx.font = "30px Arial";
		// ctx.fillStyle = "black"
		// ctx.font = "24pt Impact";
		// ctx.fillText("Lives: ", camera.width - 100, 30);
		
		this.game.hero.currentWeapon.animation.drawFrame(this.game.clockTick, ctx, camera.width - 30, 40);

		this.hearts[this.game.hero.lives * 2].drawFrame(this.game.clockTick, ctx, camera.width - 100, 5, 0.5);

		this.game.hero.keys.forEach(function (key) {
			if (key.pickedUp) {
				var i = key.whichKey;
				key.animations[i].drawFrame(key.game.clockTick, ctx, camera.width - 25, (i + 2) * 40);
			}
		});
		this.minimap.draw(ctx);
	}
	ctx.restore();
}
function EnemyInfo(game, x, y) {
	Entity.call(this, game);
	this.x = x;
	this.y = y;
	this.width = 30;
	this.height = 10;
	
	this.greenWidth = this.width;
}


EnemyInfo.prototype = new Entity();
EnemyInfo.prototype.constructor = EnemyInfo;


EnemyInfo.prototype.draw = function (ctx) {
//	console.log("hello");
	ctx.fillStyle = "red";
	ctx.fillRect(this.x, this.y, this.width, this.height);
	ctx.fillStyle = "green";
	ctx.fillRect(this.x, this.y, this.greenWidth, this.height);

	Entity.prototype.draw.call(this);
}
function Map(game) {
	Entity.call(this, game, 0, 0);
	this.sheet = ASSET_MANAGER.getAsset("img/META4map.gif");
	this.bounds = {x1: 335, y1: 335, x2: 6065, y2: 6065}
	this.boundRects = [
		{x: 2600, y: 2600, width: 490, height: 280, rotation: Math.PI / 4, bottom: true, right: true},
		{x: 2600, y: 3800, width: 490, height: 280, rotation: 3 * Math.PI / 4, top: true, right: true},
		{x: 3800, y: 3800, width: 490, height: 280, rotation: 5 * Math.PI / 4, top: true, left: true},
		{x: 3800, y: 2600, width: 490, height: 280, rotation: 7 * Math.PI / 4, bottom: true, left: true},
		{x: 3200, y: 2380, width: 1060, height: 100, rotation: 0, bottom: true},
		{x: 2380, y: 3200, width: 100, height: 1060, rotation: 0, right: true},
		{x: 4020, y: 3200, width: 100, height: 1060, rotation: 0, left: true},
		{x: 2925, y: 4025, width: 500, height: 100, rotation: 0, top: true},
		{x: 3475, y: 4025, width: 500, height: 100, rotation: 0, top: true},
		{x: 2800, y: 2800, width: 1090, height: 100, rotation: Math.PI / 4, top: true, left: true},
		{x: 3600, y: 2800, width: 1090, height: 100, rotation: 7 * Math.PI / 4, top: true, right: true},
		{x: 2760, y: 3560, width: 1090, height: 100, rotation: 3 * Math.PI / 4, bottom: true, left: true},
		{x: 3640, y: 3560, width: 1090, height: 100, rotation: 5 * Math.PI / 4, bottom: true, right: true},
		{x: 3150, y: 3990, width: 70, height: 165, rotation: 0, left: true},
		{x: 3250, y: 3990, width: 70, height: 165, rotation: 0, right: true},
		{x: 3180, y: 4075, width: 10, height: 5, rotation: 0, top: true, left: true},
		{x: 3220, y: 4075, width: 10, height: 5, rotation: 0, top: true, right: true},
	];

	this.debug = false;

	if (this.debug) {
		for (var i = 0; i < this.boundRects.length; i++) {
			this.boundRects[i].color =
				"rgb(" + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ")";
		}
	}
}


Map.prototype = new Entity();
Map.prototype.constructor = Map;


Map.prototype.draw = function (ctx) {
	ctx.drawImage(this.sheet,
		0, 0,
		6400, 6400,
		0, 0, 6400, 6400);

	if (this.debug) {
		for (var i = 0; i < this.boundRects.length; i++) {
			var rect = this.boundRects[i];
			ctx.save();
			ctx.translate(rect.x, rect.y);
			ctx.fillStyle = rect.color;
			ctx.rotate(-rect.rotation);
			ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
			ctx.restore();
		}
	}
}
function MiniMap(game) {
	Entity.call(this, game, 0, 0);
	this.sheet = ASSET_MANAGER.getAsset("img/META4map-mini.gif");
	
}

MiniMap.prototype = new Entity();
MiniMap.prototype.constructor = MiniMap;

MiniMap.prototype.draw = function (ctx) {
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	
	ctx.globalAlpha = 0.7;
	var padding = 5;
	
	//draw map
	ctx.drawImage(this.sheet, 0, 0, 200, 200, padding, padding, 100, 100);
	
	//draw hero dot
	ctx.fillStyle = "red";
	ctx.beginPath();
	var x = padding + (this.game.hero.x + this.game.hero.width / 2 - this.game.map.bounds.x1) / 5730 * 100;
	var y = padding + (this.game.hero.y + this.game.hero.height - this.game.map.bounds.y1) / 5730 * 100;
	ctx.arc(x, y, 3, 0, 2 * Math.PI);
	ctx.fill();
	
	
	//draw key locations
	ctx.fillStyle = "white";
	var bosses = game.enemies.filter(function(d) { return d instanceof Boss && !(d instanceof DrDarkabolical); });
	for (var i = 0; i < bosses.length; i++) {
		var boss = bosses[i];
		ctx.beginPath();
		var x = padding + (boss.x + boss.width / 2 - this.game.map.bounds.x1) / 5730 * 100;
		var y = padding + (boss.y + boss.height - this.game.map.bounds.y1) / 5730 * 100;
		ctx.arc(x, y, 2, 0, 2 * Math.PI);
		ctx.fill();		
	}
	
	ctx.restore();
}
function Camera(game, width, height) {
	Entity.call(this, game, game.hero.x || 0, game.hero.y || 0);
	this.width = width;
	this.height = height;
}


Camera.prototype = new Entity();
Camera.prototype.constructor = Camera;


Camera.prototype.update = function () {
	this.x = this.game.hero.x + this.game.hero.width / 2;
	this.y = this.game.hero.y + this.game.hero.height / 2;
};

Camera.prototype.getBounds = function () {
	return {
		x1: this.x - this.width / 2,
		x2: this.x + this.width / 2,
		y1: this.y - this.height / 2,
		y2: this.y + this.height / 2,
	};
}

Camera.prototype.onScreen = function (entity) {
	bounds = this.getBounds();
	return (entity.x + entity.width > bounds.x1 &&
			entity.x < bounds.x2 &&
			entity.y + entity.width > bounds.y1 &&
			entity.y < bounds.y2);
}
function PlaceEnemies(game, num) {
	this.game = game;
	this.num = num;
	this.placeBasics();
	this.placeHuman();
	this.placeTomb();
	this.placeUndead();
	this.placeGoblin();
	this.game.drDarkabolical = new DrDarkabolical(this.game, 3200, 3200);
	this.game.drDarkabolical.lifeMeter = new EnemyInfo(this.game, this.game.drDarkabolical.x, this.game.drDarkabolical.y - 15);
	this.game.addEntity(this.game.drDarkabolical.lifeMeter);
	this.game.enemies.push(this.game.drDarkabolical);
	this.game.addEntity(this.game.drDarkabolical);
}

PlaceEnemies.prototype = new Entity();
PlaceEnemies.prototype.constructor = PlaceEnemies;

PlaceEnemies.prototype.placeBasics = function () {
	this.placeBasicsAtlocation(1950, 4450, 4500, 6050); //Bottom
	this.placeBasicsAtlocation(1950, 4450, 350, 2300); //Top
	this.placeBasicsAtlocation(350, 2300, 1950, 4450); //Left
	this.placeBasicsAtlocation(4100, 6050, 1950, 4450); //Right
}

PlaceEnemies.prototype.placeBasicsAtlocation = function (xMin, xMax, yMin, yMax) {
	for (var i = 0; i < this.num; i++) {
		var location = this.getlocation(xMin, xMax, yMin, yMax);
		var basic;
		var which = getRandomNumber(0, 2);
		if (which === 0)
			basic = new Dog(this.game, location.x, location.y);
		else if (which === 1)
			basic = new BlackRat(this.game, location.x, location.y);
		else if (which === 2)
			basic = new BrownRat(this.game, location.x, location.y);
		this.game.enemies.push(basic);
		this.game.addEntity(basic);
	}
}

PlaceEnemies.prototype.placeHuman = function () {
	var blackKnight = new BlackKnight(this.game, 500, 500);
	blackKnight.lifeMeter = new EnemyInfo(blackKnight.game, blackKnight.x, blackKnight.y - 15);
	this.game.addEntity(blackKnight.lifeMeter);
	this.game.enemies.push(blackKnight);
	this.game.addEntity(blackKnight);
	for (var i = 0; i < this.num; i++) {
		var location = this.getlocation(400, 1900, 350, 1910);
		var human;
		var which = getRandomNumber(0, 2);
		if (which === 0)
			human = new Stitches(this.game, location.x, location.y);
		else if (which === 1)
			human = new Eyepatch(this.game, location.x, location.y);
		else if (which === 2)
			human = new Viking(this.game, location.x, location.y);
		this.game.enemies.push(human);
		this.game.addEntity(human);
	}
}

PlaceEnemies.prototype.placeTomb = function () {
	var skeletonKing = new SkeletonKing(this.game, 500, 5900);
	skeletonKing.lifeMeter = new EnemyInfo(skeletonKing.game, skeletonKing.x, skeletonKing.y - 15);
	this.game.addEntity(skeletonKing.lifeMeter);
	this.game.enemies.push(skeletonKing);
	this.game.addEntity(skeletonKing);

	for (var i = 0; i < this.num; i++) {
		var location = this.getlocation(400, 1900, 4475, 6040);
		var tomb;
		var which = getRandomNumber(0, 1);
		if (!which)
			tomb = new Skeleton(this.game, location.x, location.y);
		else
			tomb = new Mummy(this.game, location.x, location.y);
		this.game.enemies.push(tomb);
		this.game.addEntity(tomb);
	}
}

PlaceEnemies.prototype.placeUndead = function () {
	var death = new Death(this.game, 5820, 500);
	death.lifeMeter = new EnemyInfo(death.game, death.x, death.y - 15);
	this.game.addEntity(death.lifeMeter);
	this.game.enemies.push(death);
	this.game.addEntity(death);

	for (var i = 0; i < this.num; i++) {
		var location = this.getlocation(4475, 6040, 350, 1910);
		var undead;
		var which = getRandomNumber(0, 2);
		if (which === 0)
			undead = new SuitZombie(this.game, location.x, location.y);
		else if (which === 1)
			undead = new BlondeZombie(this.game, location.x, location.y);
		else if (which === 2)
			undead = new SuburbanZombie(this.game, location.x, location.y);
		this.game.enemies.push(undead);
		this.game.addEntity(undead);
	}
}

PlaceEnemies.prototype.placeGoblin = function () {
	var armoredGoblin = new ArmoredGoblin(this.game, 5820, 5900);
	armoredGoblin.lifeMeter = new EnemyInfo(armoredGoblin.game, armoredGoblin.x, armoredGoblin.y - 15);
	this.game.addEntity(armoredGoblin.lifeMeter);
	this.game.enemies.push(armoredGoblin);
	this.game.addEntity(armoredGoblin);

	for (var i = 0; i < this.num; i++) {
		var location = this.getlocation(4475, 6040, 4475, 6040);
		var goblin;
		var which = getRandomNumber(0, 1);
		if (!which)
			goblin = new WizardGoblin(this.game, location.x, location.y);
		else
			goblin = new HelmetGoblin(this.game, location.x, location.y);
		this.game.enemies.push(goblin);
		this.game.addEntity(goblin);
	}
}

function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1.0)) + min;
}

PlaceEnemies.prototype.getlocation = function(xMin, xMax, yMin, yMax) {
	var location = {};
	var newXY = true;
	while (newXY) {
		newXY = false;
		location = {
			x: getRandomNumber(xMin, xMax),
			y: getRandomNumber(yMin, yMax)
		}
		for (var i = 0; i < this.game.terrain.length; i++) {
			if (getDistance(this.game.terrain[i], location) <= 500) {
				newXY = true;
				i = this.game.terrain.length;
			}
		}
	}
	return location;
}
function PlaceTerrain(game, num) {
	this.game = game;
	this.num = num;
	game.gate = new Gate(game, 3170, 4010);
	game.addEntity(game.gate);
	this.placeTrees();
	this.placeSnowTrees(); 
	this.placeTombs();
	this.placeRocks();
	this.placeTrap();
}

PlaceTerrain.prototype = new Entity();
PlaceTerrain.prototype.constructor = PlaceTerrain;

PlaceTerrain.prototype.placeTrees = function () {
	this.placeTreesAtlocation(1950, 4150, 4300, 5900); //Bottom
	this.placeTreesAtlocation(1950, 4150, 550, 2050); //Top
	this.placeTreesAtlocation(550, 2000, 1950, 4300); //Left
	this.placeTreesAtlocation(4400, 5900, 1950, 4150); //Right
}

PlaceTerrain.prototype.placeTreesAtlocation = function (xMin, xMax, yMin, yMax) {
	for (var i = 0; i < this.num; i++) {
		var location = this.getlocation(xMin, xMax, yMin, yMax);
		var trees;
		trees = new Tree(this.game, location.x, location.y);
		this.game.terrain.push(trees);
		this.game.addEntity(trees);
	}
}

PlaceTerrain.prototype.placeTombs = function () {
	for (var i = 0; i < this.num; i++) {
		var location = this.getlocation(400, 1400, 4475, 5540);
		var which = getRandomNumber(0, 1);
		var tombs;
		if (which === 0) tombs = new Tombstone(this.game, location.x, location.y);
		else tombs = new FalseFloorTomb(this.game, location.x, location.y);
		this.game.terrain.push(tombs);
		this.game.addEntity(tombs);
	}
}

PlaceTerrain.prototype.placeSnowTrees = function () {
	for (var i = 0; i < this.num; i++) {
		var location = this.getlocation(4975, 5640, 4675, 5640);
		var which = getRandomNumber(0, 1);
		var snowtrees;
		if (which === 0) snowtrees = new SnowTree(this.game, location.x, location.y);
		else snowtrees = new FalseFloorSnow(this.game, location.x, location.y);
		this.game.terrain.push(snowtrees);
		this.game.addEntity(snowtrees);
	}
}

PlaceTerrain.prototype.placeRocks = function () {
	for (var i = 0; i < this.num; i++) {
		var location = this.getlocation(400, 1500, 350, 1510);
		var rocks;
		var which = getRandomNumber(0, 1);
		if (which === 0) rocks = new Rock(this.game, location.x, location.y);
		else rocks = new FalseFloorHuman(this.game, location.x, location.y);
		this.game.terrain.push(rocks);
		this.game.addEntity(rocks);
	}
}

PlaceTerrain.prototype.placeTrap = function () {
	for (var i = 0; i < this.num; i++) {
		var location = this.getlocation(4775, 5840, 350, 1510);
		var pits;
		pits = new FalseFloorZombie(this.game, location.x, location.y); 
		//	pits = new Pit(this.game, location.x, location.y);
		this.game.terrain.push(pits);
		this.game.addEntity(pits);
	}
}

PlaceTerrain.prototype.getlocation = function(xMin, xMax, yMin, yMax) {
	var location = {};
	var newXY = true;
	while (newXY) {
		newXY = false;
		location = {
			x: getRandomNumber(xMin, xMax),
			y: getRandomNumber(yMin, yMax)
		}
		for (var i = 0; i < this.game.terrain.length; i++) {
			if (getDistance(this.game.terrain[i], location) <= 100) {
				newXY = true;
				i = this.game.terrain.length;
			}
		}
	}
	return location;
}
function Player(game, x, y, width, height, radius) {
	Entity.call(this, game, x, y);
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.radius = radius;

	this.animation;
	this.downAnimation;
	this.upAnimation;
	this.leftAnimation;
	this.rightAnimation;

	this.down = false;
	this.up = false;
	this.left = false;
	this.right = false;
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.canSee = function (other) {
	//Check the distance from the center of the circle to the enemies four corners
	var otherLeft = other.x;
	var otherRight = other.x + other.width;
	var otherTop = other.y;
	var otherBottom = other.y + other.height;

	var midX = this.x + this.width / 2;
	var midY = this.y + this.height / 2;

	var distanceC1 = Math.sqrt(((otherLeft - midX) * (otherLeft - midX)) + ((otherTop - midY) * (otherTop - midY)));
	var distanceC2 = Math.sqrt(((otherRight - midX) * (otherRight - midX)) + ((otherTop - midY) * (otherTop - midY)));
	var distanceC3 = Math.sqrt(((otherLeft - midX) * (otherLeft - midX)) + ((otherBottom - midY) * (otherBottom - midY)));
	var distanceC4 = Math.sqrt(((otherRight - midX) * (otherRight - midX)) + ((otherBottom - midY) * (otherBottom - midY)));
	return (distanceC1 < this.radius || distanceC2 < this.radius || distanceC3 < this.radius || distanceC4 < this.radius);
}

Player.prototype.draw = function (ctx) {
	if (!this.invincible || this.num % 10 === 0) {
		if (this.down) {
			this.downAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
		} else if (this.up) {
			this.upAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.left) {
			this.leftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else if (this.right) {
			this.rightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else {
			this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		}
	}
	Entity.prototype.draw.call(this);
}
function Enemy(game, x, y, frameWidth, frameHeight) {
	Player.call(this, game, x, y, frameWidth, frameHeight, 200);
	//this.radius = Math.max(this.game.camera.width / 2, this.game.camera.height / 2);
	this.speed = 1;
	this.hitpoints = 40;
	
	this.startingX = this.x;
	this.startingY = this.y;
	
	this.atStarting = true;
	this.attackedTime = 0;
}

Enemy.prototype = new Player();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function () {

	if (this.removeFromWorld) {
		var num = getRandomNumber(0, 9);
		if (num === 4) {
			this.game.addEntity(new Heart(this.game, this.x, this.y));
		}
	}
	this.down = false;
	this.up = false;
	this.left = false;
	this.right = false;

	var v = {x: -this.x, y: -this.y};
	if (this.canSee(this.game.hero)) {
		v.x += this.game.hero.x;
		v.y += this.game.hero.y;
	} else {
		v.x += this.startingX;
		v.y += this.startingY;
	}

	var magn = Math.sqrt(v.x * v.x + v.y * v.y);
	if (magn) {
		v.x *= this.speed / magn;
		v.y *= this.speed / magn;
	}

	if (v.x != 0 || v.y != 0) {
		if (Math.abs(v.x) > 0.75 * Math.abs(v.y)) {
			if (v.x > 0)
				this.right = true;
			else
				this.left = true;
		} else {
			if (v.y < 0)
				this.up = true;
			else
				this.down = true;
		}
	}

	if (this.attackedTime > 0) {
		this.attackedTime -= 100;
		v.x *= -4;
		v.y *= -4;
	}

	v.x = Math.round(v.x);
	v.y = Math.round(v.y);

	this.x += v.x;
	this.y += v.y;

	Player.prototype.update.call(this);
}

function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1.0)) + min;
}
function Boss(game, x, y, frameWidth, frameHeight) {
	Enemy.call(this, game, x, y, frameWidth, frameHeight);
	this.hitpoints = 300;
	this.startingHitpoints = 300;
}

Boss.prototype = new Enemy();
Boss.prototype.constructor = Boss;

Boss.prototype.update = function () {
	Enemy.prototype.update.call(this);
	
	if (!(this instanceof DrDarkabolical))
		this.lifeMeter.greenWidth = (this.hitpoints / this.startingHitpoints) * this.lifeMeter.width;
	else 
		this.lifeMeter.greenWidth = this.lifeMeter.width - ((this.game.drDarkabolical.currentRound - 1) * (this.lifeMeter.width / 3));
	this.lifeMeter.x = this.x;
	this.lifeMeter.y = this.y - 15;

	if (this.removeFromWorld) {
		this.lifeMeter.removeFromWorld = true;
		var key = new Key(this.game, this.x, this.y, this.game.hero.keys.length);
		this.game.addEntity(key);
		this.game.bossesKilled++;
		var weapon;

		switch (this.game.bossesKilled) {
			case 1:
				weapon = new Sword2(this.game, this.x + 25, this.y);
				break;
			case 2:
				weapon = new Bow2(this.game, this.x + 25, this.y);
				break;
			case 3:
				weapon = new Sword3(this.game, this.x + 25, this.y);
				break;
			case 4:
				weapon = new Bow3(this.game, this.x + 25, this.y);
				break;
		}

		this.game.addEntity(weapon);

	}

	Entity.prototype.update.call(this);
}
function Hero(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet5.png");
	var frameWidth = 33.3;
	var frameHeight = 32;
	Player.call(this, game, x, y, frameWidth, frameHeight, 200);
	
	this.animation = new Animation(sheet, 94, 128, frameWidth, frameHeight, 0.02, 1, true, false);
	
	this.downAnimation = new Animation(sheet, 94, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 94.5, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 94, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 94, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.speed = 3;
	this.lives = 3;
	this.invincible = false;
	this.timeBeingInvincible = 0;
	this.num = 0;

	this.weapons = [];
	this.weapons[0] = new Sword1(this.game, x, y, true);
	this.weapons[1] = new Bow1(this.game, x, y, true);
	this.currentWeapon = this.weapons[0];

	this.keys = [];
}

Hero.prototype = new Player();
Hero.prototype.constructor = Hero;

Hero.prototype.pickUp = function (item) {
	if (item instanceof Sword) {
		this.currentWeapon = this.weapons[0] = item;
	} else if (item instanceof Bow) {
		this.currentWeapon = this.weapons[1] = item;
	} else if (item instanceof Key) {
		this.keys.push(item);
	} else if (item instanceof Heart) {
		if (this.lives <= 2.5)
			this.lives += 0.5;
	}
}

Hero.prototype.update = function () {
	var velocity = {x:0, y:0};
	
	if (this.invincible) {
		if (this.timeBeingInvincible < 1000) {
			this.timeBeingInvincible += 20;
			this.num++;
		} else {
			this.invincible = false;
			this.timeBeingInvincible = 0;
			this.speed *= 3 / 4;
		}
	}
	
	if (this.game.j) {
		this.currentWeapon = this.weapons[(this.weapons.indexOf(this.currentWeapon) + 1) % 2];
		this.game.j = false;
	}

	if (this.game.a) {
		this.left = true;
		velocity.x -= this.speed;
	} else {
		this.left = false;
	}

	if (this.game.w) {
		this.up = true;
		velocity.y -= this.speed;

	} else
		this.up = false;

	if (this.game.s) {
		this.down = true;
		velocity.y += this.speed;
	} else
		this.down = false;

	if (this.game.d) {
		this.right = true;
		velocity.x += this.speed;
	} else {
		this.right = false;
	}

	var attacking = this.game.left || this.game.right || this.game.up || this.game.down;
	
	if (attacking && this.currentWeapon.attackingTime <= 0) {
		this.currentWeapon.attacking = true;
		this.currentWeapon.attackingTime = this.currentWeapon.attackDelay;
		this.currentWeapon.up = this.game.up;
		this.currentWeapon.down = this.game.down;
		this.currentWeapon.left = this.game.left;
		this.currentWeapon.right = this.game.right;
		this.game.up = false;
		this.game.down = false;
		this.game.left = false;
		this.game.right = false;
	} else if (this.currentWeapon.attackingTime <= 0) {
		this.currentWeapon.attacking = false;
		this.currentWeapon.up = false;
		this.currentWeapon.down = false;
		this.currentWeapon.left = false;
		this.currentWeapon.right = false;
	} else {
		this.currentWeapon.attackingTime -= 100;
	}
	
	this.x += velocity.x;
	this.y += velocity.y;
	
	//edge of island collisions
	var bounds = this.game.map.bounds;
	var feetX = this.x + this.width / 2;
	var feetY = this.y + this.height;

	if (feetX < bounds.x1)
		feetX = bounds.x1;
	if (feetY < bounds.y1)
		feetY = bounds.y1;
	if (feetX > bounds.x2)
		feetX = bounds.x2;
	if (feetY > bounds.y2)
		feetY = bounds.y2;

	//reset position
	this.x = feetX - this.width / 2;
	this.y = feetY - this.height;

	//"wall" collision
	for (var i = 0; i < this.game.map.boundRects.length; i++) {
		var rect = this.game.map.boundRects[i];
		if (rect.all && collideCircleWithRotatedRectangle({
				x: this.x + this.width / 2,
				y: this.y + this.height,
				radius: 5
			}, rect)) {
			this.x -= velocity.x;
			this.y -= velocity.y;
		} else {
			while (collideCircleWithRotatedRectangle({
				x: this.x + this.width / 2,
				y: this.y + this.height,
				radius: 5
			}, rect)) {
				if (rect.top)
					this.y++;
				if (rect.bottom)
					this.y--;
				if (rect.left)
					this.x++;
				if (rect.right)
					this.x--;
			}
		}
	}
	
	//enemy collision
	for (var i = 0; i < this.game.enemies.length; i++) {
		var enemy = this.game.enemies[i];
		if (!this.invincible && !enemy.removeFromWorld && this.collide(enemy)) {
			this.lives -= 0.5;
			this.invincible = true;
			this.speed *= 4 / 3;
			this.num++;
			if (this.lives <= 0) {
				this.removeFromWorld = true;
				if (enemy.x !== enemy.startingX && enemy.y !== enemy.startingY) {
					enemy.walkTowardX = enemy.startingX;
					enemy.walkTowardY = enemy.startingY;
					enemy.atStarting = false;
				}
			}
		}
	}
	
	var hero = this;
	if (this.game.entities.filter(function(d) { return d instanceof Pit && d.collide(hero); }).length > 0) {
		if (!this.invincible) this.lives--;
		this.invincible = true;
	}
	
	Player.prototype.update.call(this);
	this.currentWeapon.update();
}

Hero.prototype.draw = function (ctx) {
	if ((this.currentWeapon.up || this.currentWeapon.left) && this.currentWeapon instanceof Sword) {
		this.upAnimation.elapsedTime = 0;
		this.leftAnimation.elapsedTime = 0;
		this.currentWeapon.draw(ctx);
	}

	if (!this.invincible || this.num % 10 === 0) {
		if (this.currentWeapon instanceof Bow) {
			Player.prototype.draw.call(this, ctx);
		} else {
			var attacking = this.currentWeapon.attackingTime >= this.currentWeapon.attackDelay / 2;
			if (this.down || (this.currentWeapon.down && attacking)) {
				this.downAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
			} else if (this.up || (this.currentWeapon.up && attacking)) {
				this.upAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
			} else if (this.left || (this.currentWeapon.left && attacking)) {
				this.leftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
			} else if (this.right || (this.currentWeapon.right && attacking)) {
				this.rightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
			} else {
				this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
			}
		}
	}
	Entity.prototype.draw.call(this);

	if ((this.currentWeapon.down || this.currentWeapon.right) && this.currentWeapon instanceof Sword) {
		this.downAnimation.elapsedTime = 0;
		this.rightAnimation.elapsedTime = 0;
		this.currentWeapon.draw(ctx);
	}

	if (this.currentWeapon instanceof Bow) {
		this.currentWeapon.draw(ctx);
	}
}

//from https://gist.github.com/snorpey/8134c248296649433de2 
function collideCircleWithRotatedRectangle(circle, rect) {
	var rectCenterX = rect.x;
	var rectCenterY = rect.y;

	var rectX = rectCenterX - rect.width / 2;
	var rectY = rectCenterY - rect.height / 2;

	var rectReferenceX = rectX;
	var rectReferenceY = rectY;

	// Rotate circle's center point back
	var unrotatedCircleX = Math.cos(rect.rotation) * (circle.x - rectCenterX) - Math.sin(rect.rotation) * (circle.y - rectCenterY) + rectCenterX;
	var unrotatedCircleY = Math.sin(rect.rotation) * (circle.x - rectCenterX) + Math.cos(rect.rotation) * (circle.y - rectCenterY) + rectCenterY;

	// Closest point in the rectangle to the center of circle rotated backwards(unrotated)
	var closestX, closestY;

	// Find the unrotated closest x point from center of unrotated circle
	if (unrotatedCircleX < rectReferenceX) {
		closestX = rectReferenceX;
	} else if (unrotatedCircleX > rectReferenceX + rect.width) {
		closestX = rectReferenceX + rect.width;
	} else {
		closestX = unrotatedCircleX;
	}

	// Find the unrotated closest y point from center of unrotated circle
	if (unrotatedCircleY < rectReferenceY) {
		closestY = rectReferenceY;
	} else if (unrotatedCircleY > rectReferenceY + rect.height) {
		closestY = rectReferenceY + rect.height;
	} else {
		closestY = unrotatedCircleY;
	}

	// Determine collision
	var collision = false;
	var distance = getDistance({x:unrotatedCircleX, y:unrotatedCircleY},
							   {x:closestX, y:closestY});

	if (distance < circle.radius) {
		collision = true;
	} else {
		collision = false;
	}
	return collision;
}

function getDistance(a, b) {
	var dX = Math.abs(a.x - b.x);
	var dY = Math.abs(a.y - b.y);
	return Math.sqrt((dX * dX) + (dY * dY));
}
function DrDarkabolical(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet5.png");
	var frameWidth = 33.3;
	var frameHeight = 32;
	Boss.call(this, game, x, y, frameWidth, frameHeight);
	this.radius = 250;
	this.speed = 2;

	this.animation = new Animation(sheet, 192 + 32, 128, 32, 32, 0.05, 1, true, false);
	this.upAnimation = new Animation(sheet, 192, 128 + 96, 32, 32, 0.2, 3, true, false);
	this.downAnimation = new Animation(sheet, 192, 128, 32, 32, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 192, 128 + 32, 32, 32, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 192, 128 + 64, 32, 32, 0.2, 3, true, false);

	this.telOutAnimation = new Animation(sheet, 192 + 96, 128, 32, 32, 0.05, 9, false, true);
	this.telInAnimation = new Animation(sheet, 192 + 96, 128, 32, 32, 0.05, 9, false, false);

	this.telIn = false;
	this.telOut = false;

	this.currentRound = 0;
	this.minionsAlive = 0;
	this.vulnerable = false;
	this.dead = false;

	this.attackingTime = 0;
	this.attackDelay = 2000;
}

DrDarkabolical.prototype = new Boss();
DrDarkabolical.prototype.constructor = DrDarkabolical;

DrDarkabolical.prototype.update = function () {
	if (this.dead) {
		this.removeFromWorld = true;
	} else {
		Boss.prototype.update.call(this);
		
		if (this.canSee(this.game.hero) && this.vulnerable && this.attackingTime <= 0) {
			this.attackingTime = this.attackDelay;
			var v = {x: -this.x, y: -this.y};
			v.x += this.game.hero.x;
			v.y += this.game.hero.y;
			var magn = Math.sqrt(v.x * v.x + v.y * v.y);
			if (magn) {
				v.x *= 5 / magn;
				v.y *= 5 / magn;
			}
			v.x = Math.round(v.x);
			v.y = Math.round(v.y);
			var purpleOrb = new PurpleOrb(this.game, this.x, this.y, v.x, v.y);
			this.game.addEntity(purpleOrb);
		} else if (this.attackingTime > 0)
			this.attackingTime -= 50;
		
		if (this.canSee(this.game.hero) && !this.vulnerable) {
			this.telOut = true;
		}
		if (this.minionsAlive === 0 && this.canSee(this.game.hero) && !this.vulnerable) {
			this.currentRound++;
			this.telOut = true;
			placeDark(3 + this.currentRound * 2);
		}

		if (this.telOut) {
			if (this.telOutAnimation.isDone()) {
				this.telOutAnimation.elapsedTime = 0;
				this.telOut = false;
				this.telIn = true;
				this.x += getRandomNumber(-250, 250);
				this.y += getRandomNumber(-250, 250);
			}
		} else if (this.telIn) {
			if (this.telInAnimation.isDone()) {
				this.telInAnimation.elapsedTime = 0;
				this.telIn = false;
			}
		}
	}
}

DrDarkabolical.prototype.draw = function (ctx) {
	if (this.telOut) {
		this.telOutAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else if (this.telIn) {
		this.telInAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else if (this.up) {
		this.upAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else if (this.down) {
		this.downAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else if (this.left) {
		this.leftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else if (this.right) {
		this.rightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else {
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	}
}

function placeDark(num) {
	while (true) {
		var locations = [
			getlocationDark(2500, 3200, 2500, 3200, 1), //quadrant 1
			getlocationDark(3200, 3900, 2500, 3200, 2), //quadrant 2
			getlocationDark(2500, 3200, 3200, 3800, 3), //quadrant 3
			getlocationDark(3200, 3900, 3200, 3800, 4) //quadrant 4
		];

		for (var j = 0; j < 4; j++) {
			var dark;
			var which = getRandomNumber(0, 1);
			if (!which)
				dark = new Scarf(this.game, locations[j].x, locations[j].y);
			else
				dark = new Hood(this.game, locations[j].x, locations[j].y);
			this.game.enemies.push(dark);
			this.game.addEntity(dark);
			this.game.drDarkabolical.minionsAlive++;
			if (this.game.drDarkabolical.minionsAlive === num)
				return;
		}
	}
}

function getlocationDark(xMin, xMax, yMin, yMax, quandrant) {
	var location = {};
	var newXY = true;
	while (true) {
		if (newXY) {
			location = {
				x: getRandomNumber(xMin, xMax),
				y: getRandomNumber(yMin, yMax)
			};
		}
		newXY = false;
		switch (quandrant) {
			case 1:
				if (!(location.x + location.y >= 5700 && location.x + location.y <= 6400))
					newXY = true;
				break;
			case 2:
				if (!(location.x - location.y >= 0 && location.x - location.y <= 700))
					newXY = true;
				break;
			case 3:
				if (!(location.x - location.y >= -700 && location.x - location.y <= 0))
					newXY = true;
				break;
			case 4:
				if (!(location.x + location.y >= 6400 && location.x + location.y <= 7100))
					newXY = true;
				break;
		}
		if (!newXY) {
			for (var j = 0; j < this.game.enemies.length; j++) {
				if (getDistance(this.game.enemies[j], location) <= 100)
					newXY = true;
			}
		}
		if (!newXY)
			break;
	}
	return location;
}
function ArmoredGoblin(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet3.png");
	var frameWidth = 33.3;
	var frameHeight = 32;
	Boss.call(this, game, x, y, frameWidth, frameHeight);

	this.animation = new Animation(sheet, 94, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 94, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 94.5, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 94, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 94, 192, frameWidth, frameHeight, 0.2, 3, true, false);
}

ArmoredGoblin.prototype = new Boss();
ArmoredGoblin.prototype.constructor = ArmoredGoblin;
function BlackKnight(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet7.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Boss.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 0, 0, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 0, 0, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 0, 96, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 0, 32, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 0, 64, frameWidth, frameHeight, 0.2, 3, true, false);
}

BlackKnight.prototype = new Boss();
BlackKnight.prototype.constructor = BlackKnight;
function BlackRat(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet6.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 96, 0, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 96, 0, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 96, 96, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 96, 32, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 96, 64, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 20;
}

BlackRat.prototype = new Enemy();
BlackRat.prototype.constructor = BlackRat;
function BlondeZombie(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet6.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 192, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 192, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 192, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 192, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 192, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 40;
}

BlondeZombie.prototype = new Enemy();
BlondeZombie.prototype.constructor = BlondeZombie;
function BrownRat(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet6.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 0, 0, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 0, 0, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 0, 96, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 0, 32, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 0, 64, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 20;
}

BrownRat.prototype = new Enemy();
BrownRat.prototype.constructor = BrownRat;
function Death(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet6.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Boss.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 288, 0, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 288, 0, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 288, 96, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 288, 32, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 288, 64, frameWidth, frameHeight, 0.2, 3, true, false);
}

Death.prototype = new Boss();
Death.prototype.constructor = Death;
function Dog(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet2.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 0, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 0, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 0, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 0, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 0, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 40;
}

Dog.prototype = new Enemy();
Dog.prototype.constructor = Dog;
function Eyepatch(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet4.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 0, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 0, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 0, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 0, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 0, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 70;
}

Eyepatch.prototype = new Enemy();
Eyepatch.prototype.constructor = Eyepatch;
function HelmetGoblin(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet3.png");
	var frameWidth = 33;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 192, 0, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 192, 0, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 192, 96, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 192, 32, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 192, 64, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 40;
}

HelmetGoblin.prototype = new Enemy();
HelmetGoblin.prototype.constructor = HelmetGoblin;
function Hood(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet4.png");
	var frameWidth = 32.3;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);
	this.animation = new Animation(sheet, 287, 0, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 287, 0, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 287, 96, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 287, 32, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 287, 64, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 100;
}

Hood.prototype = new Enemy();
Hood.prototype.constructor = Hood;
function Mummy(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet3.png");
	var frameWidth = 33.3;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 192, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 192, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 192, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 192, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 192, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 80;
}

Mummy.prototype = new Enemy();
Mummy.prototype.constructor = Mummy;
function Scarf(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet4.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);
	this.animation = new Animation(sheet, 192, 0, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 192, 0, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 192, 96, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 192, 32, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 192, 64, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 150;
}

Scarf.prototype = new Enemy();
Scarf.prototype.constructor = Scarf;
function Skeleton(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet2.png");
	var frameWidth = 33.3;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 192, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 192, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 190, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 190, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 190, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 50;
	this.attackingTime = 0;
	this.attackDelay = 3000;
}

Skeleton.prototype = new Enemy();
Skeleton.prototype.constructor = Skeleton;

Skeleton.prototype.update = function () {
	Enemy.prototype.update.call(this);

	if (this.canSee(this.game.hero) && this.attackingTime <= 0) {
		this.attackingTime = this.attackDelay;
		var v = {x: -this.x, y: -this.y};
		v.x += this.game.hero.x;
		v.y += this.game.hero.y;


		var magn = Math.sqrt(v.x * v.x + v.y * v.y);
		if (magn) {
			v.x *= 2 / magn;
			v.y *= 2 / magn;
		}

		v.x = Math.round(v.x);
		v.y = Math.round(v.y);
		var bone = new Bone(this.game, this.x, this.y, v.x, v.y);
		this.game.addEntity(bone);

	} else if (this.attackingTime > 0)
		this.attackingTime -= 50;

	Entity.prototype.update.call(this);
}
function SkeletonKing(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet6.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Boss.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 192, 0, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 192, 0, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 192, 96, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 192, 32, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 192, 64, frameWidth, frameHeight, 0.2, 3, true, false);
}

SkeletonKing.prototype = new Boss();
SkeletonKing.prototype.constructor = SkeletonKing;
function Stitches(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet2.png");
	var frameWidth = 31;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 290, 0, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 290, 0, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 290, 96, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 290, 32, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 290, 64, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 40;
	this.attackingTime = 0;
	this.attackDelay = 3000;
}

Stitches.prototype = new Enemy();
Stitches.prototype.constructor = Stitches;

Stitches.prototype.update = function() {
	Enemy.prototype.update.call(this);

	if (this.canSee(this.game.hero) && this.attackingTime <= 0) {
		this.attackingTime = this.attackDelay;
		var v = {x: -this.x, y: -this.y};
		v.x += this.game.hero.x;
		v.y += this.game.hero.y;


		var magn = Math.sqrt(v.x * v.x + v.y * v.y);
		if (magn) {
			v.x *= 2 / magn;
			v.y *= 2 / magn;
		}

		v.x = Math.round(v.x);
		v.y = Math.round(v.y);
		var ninjaStar = new NinjaStar(this.game, this.x, this.y, v.x, v.y);
		this.game.addEntity(ninjaStar);

	} else if (this.attackingTime > 0)
		this.attackingTime -= 50;

	Entity.prototype.update.call(this);	
	
	
}
function SuburbanZombie(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet6.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 288, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 288, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 288, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 288, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 288, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 40;
}

SuburbanZombie.prototype = new Enemy();
SuburbanZombie.prototype.constructor = SuburbanZombie;
function SuitZombie(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet6.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 96, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 96, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 96, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 96, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 96, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 40;
}

SuitZombie.prototype = new Enemy();
SuitZombie.prototype.constructor = SuitZombie;
function Viking(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet6.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 0, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 0, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 0, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 0, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 0, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 100;
}

Viking.prototype = new Enemy();
Viking.prototype.constructor = Viking;
function WizardGoblin(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet3.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 0, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 0, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 0, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 0, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 0, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 70;
	this.attackingTime = 0;
	this.attackDelay = 3000;

}

WizardGoblin.prototype = new Enemy();
WizardGoblin.prototype.constructor = WizardGoblin;

WizardGoblin.prototype.update = function () {
	Enemy.prototype.update.call(this);

	if (this.canSee(this.game.hero) && this.attackingTime <= 0) {
		this.attackingTime = this.attackDelay;
		var v = {x: -this.x, y: -this.y};
		v.x += this.game.hero.x;
		v.y += this.game.hero.y;


		var magn = Math.sqrt(v.x * v.x + v.y * v.y);
		if (magn) {
			v.x *= 2 / magn;
			v.y *= 2 / magn;
		}

		v.x = Math.round(v.x);
		v.y = Math.round(v.y);
		var blueOrb = new BlueOrb(this.game, this.x, this.y, v.x, v.y);
		this.game.addEntity(blueOrb);

	} else if (this.attackingTime > 0)
		this.attackingTime -= 50;

	Entity.prototype.update.call(this);
}
function Item(game, x, y) {
	Entity.call(this, game, x, y);
	this.pickedUp = false;
}

Item.prototype = new Entity();
Item.prototype.constructor = Item;

Item.prototype.update = function () {
	this.flipped = this.game.d;
	if (!this.pickedUp && this.collide(this.game.hero)) {
		this.pickedUp = true;
		this.game.hero.pickUp(this);
		this.removeFromWorld = true;
	}
	Entity.prototype.update.call(this);
};

Item.prototype.draw = function (ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
}
function Weapon(game, x, y, pickedUp) {
	Entity.call(this, game, x, y);
	this.attacking = false;
	this.attackingTime = 0;
	this.pickedUp = pickedUp;
}

Weapon.prototype = new Item();
Weapon.prototype.constructor = Weapon;

Weapon.prototype.update = function () {
	Item.prototype.update.call(this);

	if (this.pickedUp) {
		this.x = this.game.hero.x;
		this.y = this.game.hero.y;
	}
};

Weapon.prototype.draw = function (ctx) {
	if (!this.pickedUp) {
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else if (this.attacking || this instanceof Bow) {
		this.animation.drawFrame(this.game.clockTick, ctx, this.game.hero.x - this.width, this.game.hero.y);
	}
};
function Sword(game, x, y, pickedUp) {
	Weapon.call(this, game, x, y, pickedUp);
	this.attackDelay = 5000;
	this.width = 28;
	this.height = 25;
	this.offX = 15;
	this.offY = 5;
}

Sword.prototype = new Weapon();
Sword.prototype.constructor = Sword;

Sword.prototype.update = function () {
	Weapon.prototype.update.call(this);
	if (this.pickedUp) {
		if (this.left) {
			this.x -= this.offX;
			this.y += this.offY;
		} else if (this.right) {
			this.x += this.offX;
			this.y += this.offY;
		} else if (this.up) {
			this.y -= this.offY;
		} else if (this.down) {
			this.y += this.game.hero.height / 2 + this.offY;
		}
	}

	if (this.attacking && this.pickedUp && this.attackingTime >= this.attackDelay / 2) {
		for (var i = 0; i < this.game.enemies.length; i++) {
			var enemy = this.game.enemies[i];
			if (this.collide(enemy)) {
				if (enemy instanceof DrDarkabolical) {
					if (this.game.drDarkabolical.vulnerable && this.game.drDarkabolical.currentRound === 3) {
						this.game.drDarkabolical.dead = true;
					}
					if (this.game.drDarkabolical.vulnerable)
						this.game.drDarkabolical.vulnerable = false;
				} else {
					enemy.hitpoints -= this.damage;
					enemy.attackedTime = 1000;
					if (enemy.hitpoints <= 0) {
						if (enemy instanceof Scarf || enemy instanceof Hood) {
							this.game.drDarkabolical.minionsAlive--;
							if (this.game.drDarkabolical.minionsAlive === 0)
								this.game.drDarkabolical.vulnerable = true;
						}
						this.game.enemies.splice(i, 1);
						i--;
						enemy.removeFromWorld = true;
					}
				}
			}
		}
	}
}

Weapon.prototype.draw = function (ctx) {
	ctx.save();
	if (!this.pickedUp) {
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else if ((this.attacking && this.attackingTime >= this.attackDelay / 2)|| this instanceof Bow) {
		ctx.translate(this.game.camera.x, this.game.camera.y + 5);
		var offX = 0, offY = 0;
		if (this.up) {
			offY = -5;
			offX = 18;
			ctx.scale(1, 1);
		}
		if (this.down) {
			offY = 0;
			offX = 18;
			ctx.scale(-1, -1);
		}
		if (this.left) {
			offX = 5;
			offY = 10;
			ctx.scale(1, 1);
		}
		if (this.right) {
			offX = 5;
			offY = 10;
			ctx.scale(-1, 1);
		}
		this.animation.drawFrame(this.game.clockTick, ctx, -this.width + offX, -this.height + offY);
	}
	ctx.restore();
};
function Sword1(game, x, y, pickedUp) {
	Sword.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/weaponsheet2.png");
	this.animation = new Animation(sheet, 68, 132, 20, 25, 0.2, 1, true, false);
	this.damage = 30;
	this.offX = 10;
}

Sword1.prototype = new Sword();
Sword1.prototype.constructor = Sword1;
function Sword2(game, x, y, pickedUp) {
	Sword.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/weaponsheet2.png");
	this.animation = new Animation(sheet, 0, 163, 28, 25, 0.2, 1, true, false);
	this.damage = 55;
}

Sword2.prototype = new Sword();
Sword2.prototype.constructor = Sword2;

function Sword3(game, x, y, pickedUp) {
	Sword.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/weaponsheet2.png");
	this.animation = new Animation(sheet, 33, 163, 28, 25, 0.2, 1, true, false);
	this.damage = 70;
}

Sword3.prototype = new Sword();
Sword3.prototype.constructor = Sword3;

function Bow(game, x, y, pickedUp) {
	Weapon.call(this, game, x, y, pickedUp);
	this.attackDelay = 2000;
	this.width = 25;
	this.height = 25;
	this.offX = 10;
	this.offY = 0;
}

Bow.prototype = new Weapon();
Bow.prototype.constructor = Bow;

Bow.prototype.update = function () {
	Weapon.prototype.update.call(this);
	if (this.attackingTime <= 0 && this.pickedUp) {
		if (this.left)
			this.game.addEntity(new Arrow(this.game, this.x, this.y, this.damage, 0));
		else if (this.down)
			this.game.addEntity(new Arrow(this.game, this.x, this.y, this.damage, 1));
		else if (this.right)
			this.game.addEntity(new Arrow(this.game, this.x, this.y, this.damage, 2));
		else if (this.up)
			this.game.addEntity(new Arrow(this.game, this.x, this.y, this.damage, 3));
	}
}

Bow.prototype.draw = function (ctx) {
	if (!this.pickedUp) {
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else if ((this.attacking || this instanceof Bow) && this.flipped) {
		ctx.save();
		ctx.scale(-1, 1);
		this.animation.drawFrame(this.game.clockTick, ctx, -this.x - this.width - this.offX, this.y);
		ctx.restore();
	} else if (this.attacking || this instanceof Bow) {
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	}
}
function Bow1(game, x, y, pickedUp) {
	Bow.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/bows.png");
	this.animation = new Animation(sheet, 1, 2, 13, 33, 0.2, 1, true, false);
	this.damage = 15;
}

Bow1.prototype = new Bow();
Bow1.prototype.constructor = Bow1;
function Bow2(game, x, y, pickedUp) {
	Bow.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/bows.png");
	this.animation = new Animation(sheet, 36, 0, 16, 36, 0.2, 1, true, false);
	this.damage = 25;
}

Bow2.prototype = new Bow();
Bow2.prototype.constructor = Bow2;

function Bow3(game, x, y, pickedUp) {
	Bow.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/bows.png");
	this.animation = new Animation(sheet, 72, 3, 15, 32, 0.2, 1, true, false);
	this.damage = 35;
}

Bow3.prototype = new Bow();
Bow3.prototype.constructor = Bow3;

function Arrow(game, x, y, damage, dir) {
	Entity.call(this, game, x, y);
	var sheet = ASSET_MANAGER.getAsset("img/arrow.png");
	this.animations = [new Animation(sheet, 0, 4, 32, 11, 0.2, 1, true, false),
		new Animation(sheet, 38, 0, 11, 29, 0.2, 1, true, false),
		new Animation(sheet, 71, 10, 32, 11, 0.2, 1, true, false),
		new Animation(sheet, 53, 0, 11, 29, 0.2, 1, true, false),
	];
	this.damage = damage;
	this.dir = dir;

	if (dir % 2) {
		this.width = 32;
		this.height = 11;
	} else {
		this.width = 11;
		this.height = 29;
	}
}

Arrow.prototype = new Entity();
Arrow.prototype.constructor = Arrow;

Arrow.prototype.update = function () {
	var bounds = this.game.camera.getBounds();
	if (!this.game.camera.onScreen(this) || this.collide(this.game.gate))
		this.removeFromWorld = true;

	for (var i = 0; i < this.game.enemies.length; i++) {
		var enemy = this.game.enemies[i];
		if (this.collide(enemy)) {
			if (enemy instanceof DrDarkabolical) {
				if (this.game.drDarkabolical.vulnerable && this.game.drDarkabolical.currentRound === 3) {
					this.game.drDarkabolical.dead = true;
				}
				if (this.game.drDarkabolical.vulnerable)
					this.game.drDarkabolical.vulnerable = false;
			} else {
				enemy.radius = 300;
				enemy.hitpoints -= this.damage;
				if (enemy.hitpoints <= 0) {
					if (enemy instanceof Scarf || enemy instanceof Hood) {
						this.game.drDarkabolical.minionsAlive--;
						if (this.game.drDarkabolical.minionsAlive === 0)
							this.game.drDarkabolical.vulnerable = true;
					}
					this.game.enemies.splice(i, 1);
					i--;
					enemy.removeFromWorld = true;
				}
				this.removeFromWorld = true;
			}
		}
	}

	if (this.dir == 0)
		this.x -= 6;
	else if (this.dir == 1)
		this.y += 6;
	else if (this.dir == 2)
		this.x += 6;
	else if (this.dir == 3)
		this.y -= 6;

	Entity.prototype.update.call(this);
};

Arrow.prototype.draw = function (ctx) {
	this.animations[this.dir].drawFrame(this.game.clockTick, ctx, this.x, this.y);
	Entity.prototype.draw.call(this);
};
function BlueOrb(game, x, y, deltaX, deltaY) {
	Entity.call(this, game, x, y);
	var sheet = ASSET_MANAGER.getAsset("img/projectiles.png");
	this.animation = new Animation(sheet, 438, 192, 21, 21, 0.2, 1, true, false);

	this.width = 21;
	this.height = 21;

	this.deltaX = deltaX;
	this.deltaY = deltaY;

}

BlueOrb.prototype = new Entity();
BlueOrb.prototype.constructor = BlueOrb;

BlueOrb.prototype.update = function () {
	if (!this.game.camera.onScreen(this) || this.collide(this.game.gate))
		this.removeFromWorld = true;

	if (this.collide(this.game.hero) && !this.game.hero.invincible) {
		this.game.hero.lives -= 0.5;
		this.game.hero.invincible = true;
		this.game.hero.speed *= 4 / 3;
		this.game.hero.num++;
		this.removeFromWorld = true;
		if (this.game.hero.lives <= 0)
			this.game.hero.removeFromWorld = true;
	}

	this.x += this.deltaX;
	this.y += this.deltaY;

	Entity.prototype.update.call(this);
};

BlueOrb.prototype.draw = function (ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	Entity.prototype.draw.call(this);
};
function Bone(game, x, y, deltaX, deltaY) {
	Entity.call(this, game, x, y);
	var sheet = ASSET_MANAGER.getAsset("img/throwingBone.gif");
	this.animation = new Animation(sheet, 0, 0, 18, 17, 0.2, 4, true, false);

	this.width = 18;
	this.height = 17;

	this.deltaX = deltaX;
	this.deltaY = deltaY;
}

Bone.prototype = new Entity();
Bone.prototype.constructor = Bone;

Bone.prototype.update = function () {
	if (!this.game.camera.onScreen(this) || this.collide(this.game.gate))
		this.removeFromWorld = true;

	if (this.collide(this.game.hero) && !this.game.hero.invincible) {
		this.game.hero.lives -= 0.5;
		this.game.hero.invincible = true;
		this.game.hero.speed *= 4 / 3;
		this.game.hero.num++;
		this.removeFromWorld = true;
		if (this.game.hero.lives <= 0)
			this.game.hero.removeFromWorld = true;
	}

	this.x += this.deltaX;
	this.y += this.deltaY;

	Entity.prototype.update.call(this);
};

Bone.prototype.draw = function (ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	Entity.prototype.draw.call(this);
};
function PurpleOrb(game, x, y, deltaX, deltaY) {
	Entity.call(this, game, x, y);
	var sheet = ASSET_MANAGER.getAsset("img/purpleOrb.png");
	this.animation = new Animation(sheet, 0, 0, 23, 24, 0.2, 1, true, false);

	this.width = 23;
	this.height = 24;

	this.deltaX = deltaX;
	this.deltaY = deltaY;

}

PurpleOrb.prototype = new Entity();
PurpleOrb.prototype.constructor = PurpleOrb;

PurpleOrb.prototype.update = function () {
	if (!this.game.camera.onScreen(this) || this.collide(this.game.gate))
		this.removeFromWorld = true;

	if (this.collide(this.game.hero) && !this.game.hero.invincible) {
		this.game.hero.lives -= 0.5;
		this.game.hero.invincible = true;
		this.game.hero.speed *= 4 / 3;
		this.game.hero.num++;
		this.removeFromWorld = true;
		if (this.game.hero.lives <= 0)
			this.game.hero.removeFromWorld = true;
	}

	this.x += this.deltaX;
	this.y += this.deltaY;

	Entity.prototype.update.call(this);
};

PurpleOrb.prototype.draw = function (ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	Entity.prototype.draw.call(this);
};
function NinjaStar(game, x, y, deltaX, deltaY) {
	Entity.call(this, game, x, y);
	var sheet = ASSET_MANAGER.getAsset("img/ninjaStars.png");
	this.animation = new Animation(sheet, 0, 0, 12, 12, 0.2, 2, true, false);
	this.width = 12;
	this.height = 12;
	
	this.deltaX = deltaX;
	this.deltaY = deltaY;
}

NinjaStar.prototype = new Entity();
NinjaStar.prototype.constructor = NinjaStar;

NinjaStar.prototype.update = function () {
	if (!this.game.camera.onScreen(this) || this.collide(this.game.gate))
		this.removeFromWorld = true;

	if (this.collide(this.game.hero) && !this.game.hero.invincible) {
		this.game.hero.lives -= 0.5;
		this.game.hero.invincible = true;
		this.game.hero.speed *= 4 / 3;
		this.game.hero.num++;
		this.removeFromWorld = true;
		if (this.game.hero.lives <= 0)
			this.game.hero.removeFromWorld = true;
	}

	this.x += this.deltaX;
	this.y += this.deltaY;

	Entity.prototype.update.call(this);
};

NinjaStar.prototype.draw = function (ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	Entity.prototype.draw.call(this);
};
function Key(game, x, y, i) {
	Entity.call(this, game, x, y);
	this.x = x;
	this.y = y;
	this.width = 25;
	this.height = 25;
	this.sheet = ASSET_MANAGER.getAsset("img/keys.png");

	//  this.meleeWeaponLeft_basic = new Animation(this.weaponSheet, 68, 40, 20, 18, 0.2, 1, true, false);
	this.animations = [
		new Animation(this.sheet, 0, 0, 20, 21, 0.2, 1, true, false),
		new Animation(this.sheet, 20, 0, 24, 24, 0.2, 1, true, false),
		new Animation(this.sheet, 44, 0, 21, 20, 0.2, 1, true, false),
		new Animation(this.sheet, 65, 0, 22, 24, 0.2, 1, true, false)
	];

	this.whichKey = i;
	this.pickedUp = false;
}

Key.prototype = new Entity();
Key.prototype.constructor = Key;

Key.prototype.update = function () {
	Item.prototype.update.call(this);

	if (this.pickedUp) {
		this.x = this.game.camera.width - 20;
		this.y = this.whichKey * 40;
	}
};

Key.prototype.draw = function (ctx) {
	this.animations[this.whichKey].drawFrame(this.game.clockTick, ctx, this.x, this.y);
	Entity.prototype.draw.call(this);
};
function Terrain(game, x, y) {
	Entity.call(this, game, x, y);
}
Terrain.prototype = new Entity();
Terrain.prototype.constructor = Terrain;

Terrain.prototype.draw = function (ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
	Entity.prototype.draw.call(this);
}

function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1.0)) + min;
}

Terrain.prototype.addBoundRects = function(x, y, width, height) {
	this.game.map.boundRects.push({
		x: x + width / 6,
		y: y + height / 6,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		bottom: true, right: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6 * 3,
		y: y + height / 6,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		bottom: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6 * 5,
		y: y + height / 6,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		bottom: true, left: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6,
		y: y + height / 6 * 3,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		right: true,
	});
	
	// this.game.map.boundRects.push({
		// x: x + width / 6 * 3,
		// y: y + height / 6 * 3,
		// rotation: 0,
		// width: width / 3,
		// height: height / 3,
		// right: true,
	// });
	
	this.game.map.boundRects.push({
		x: x + width / 6 * 5,
		y: y + height / 6 * 3,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		left: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6,
		y: y + height / 6 * 5,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		top: true, right: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6 * 3,
		y: y + height / 6 * 5,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		top: true,
	});
	
	this.game.map.boundRects.push({
		x: x + width / 6 * 5,
		y: y + height / 6 * 5,
		rotation: 0,
		width: width / 3,
		height: height / 3,
		top: true, left: true,
	});
}
function Gate(game, x, y) {
	Terrain.call(this, game, x, y);
	this.width = 61;
	this.height = 64;
	this.sheet = ASSET_MANAGER.getAsset("img/gate.png");
	
	this.gateClosed = new Animation(this.sheet, 0, 0, 61, 64, 0.2, 1, true, false);
	this.gateOpening1 = new Animation(this.sheet, 0, 63, 61, 64, 0.2, 1, true, false);
	this.gateOpening2 = new Animation(this.sheet, 0, 127, 61, 64, 0.2, 1, true, false);
	this.gateOpening3 = new Animation(this.sheet, 0, 191, 61, 64, 0.2, 1, true, false);
	this.gateOpen = new Animation(this.sheet, 0, 254, 61, 64, 0.2, 1, true, false);

	this.closed = true;
	this.whichGate = 1;
	
	game.map.boundRects.push({
		x: this.x + this.width / 2,
		y: this.y + this.height / 2,
		rotation: 0,
		width: this.width,
		height: this.height,
		top: true,
		gate: true,
	});
}

Gate.prototype = new Terrain();
Gate.prototype.constructor = Gate;

Gate.prototype.update = function () {
	if (this.collide(this.game.hero)) {
		if (this.game.hero.keys.length == 0)
			this.whichGate = 1;
		else if (this.game.hero.keys.length == 1)
			this.whichGate = 2;
		else if (this.game.hero.keys.length == 2)
			this.whichGate = 3;
		else if (this.game.hero.keys.length == 3)
			this.whichGate = 4;
		else if (this.game.hero.keys.length == 4) {
			this.whichGate = 5;
			if (this.closed)
				this.game.map.boundRects = this.game.map.boundRects.filter(function(d) { return !d.gate; });
			this.closed = false;
		}
	}

	Terrain.prototype.update.call(this);
};

Gate.prototype.draw = function (ctx) {
	////use scaleby in drawFrame
	if (this.whichGate == 1)
		this.gateClosed.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	else if (this.whichGate == 2)
		this.gateOpening1.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	else if (this.whichGate == 3)
		this.gateOpening2.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	else if (this.whichGate == 4)
		this.gateOpening3.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	else if (this.whichGate == 5)
		this.gateOpen.drawFrame(this.game.clockTick, ctx, this.x, this.y);
};
function Tree(game, x, y) {
	Terrain.call(this, game, x, y);
	this.width = 95;
	this.height = 95;
	this.sheet = ASSET_MANAGER.getAsset("img/sheetTree.png");
	var which = getRandomNumber(0, 15);
	if (which === 0) this.animation = new Animation(this.sheet, 0, 0, 95, 95, 0.2, 1, true, false);
	else if (which === 1) this.animation = new Animation(this.sheet, 95, 0, 95, 95, 0.2, 1, true, false);
	else if (which === 2) this.animation = new Animation(this.sheet, 190, 0, 95, 95, 0.2, 1, true, false);
	else if (which === 3) this.animation = new Animation(this.sheet, 285, 0, 95, 95, 0.2, 1, true, false);
	else if (which === 4) this.animation = new Animation(this.sheet, 0, 95, 95, 95, 0.2, 1, true, false);
	else if (which === 5) this.animation = new Animation(this.sheet, 95, 95, 95, 95, 0.2, 1, true, false);
	else if (which === 6) this.animation = new Animation(this.sheet, 190, 95, 95, 95, 0.2, 1, true, false);
	else if (which === 7) this.animation = new Animation(this.sheet, 285, 95, 95, 95, 0.2, 1, true, false);
	else if (which === 8) this.animation = new Animation(this.sheet, 0, 190, 95, 95, 0.2, 1, true, false);
	else if (which === 9) this.animation = new Animation(this.sheet, 95, 190, 95, 95, 0.2, 1, true, false);
	else if (which === 10) this.animation = new Animation(this.sheet, 190, 190, 95, 95, 0.2, 1, true, false);
	else if (which === 11) this.animation = new Animation(this.sheet, 285, 190, 95, 95, 0.2, 1, true, false);
	else if (which === 12) this.animation = new Animation(this.sheet, 0, 285, 95, 95, 0.2, 1, true, false);
	else if (which === 13) this.animation = new Animation(this.sheet, 95, 285, 95, 95, 0.2, 1, true, false);
	else if (which === 14) this.animation = new Animation(this.sheet, 190, 285, 95, 95, 0.2, 1, true, false);
	else if (which === 15) this.animation = new Animation(this.sheet, 285, 285, 95, 95, 0.2, 1, true, false);	
	
	this.addBoundRects(this.x + this.width * 3 / 8, this.y + this.height * 3 / 4, this.width / 4, this.height / 4);
}
Tree.prototype = new Terrain();
Tree.prototype.constructor = Tree;
function SnowTree(game, x, y) {
	Terrain.call(this, game, x, y);
	this.width = 95;
	this.height = 95;
	this.sheet = ASSET_MANAGER.getAsset("img/sheetSnowTree.png");
	var which = getRandomNumber(0, 15);
	if (which === 0) this.animation = new Animation(this.sheet, 0, 0, 95, 95, 0.2, 1, true, false);
	else if (which === 1) this.animation = new Animation(this.sheet, 95, 0, 95, 95, 0.2, 1, true, false);
	else if (which === 2) this.animation = new Animation(this.sheet, 190, 0, 95, 95, 0.2, 1, true, false);
	else if (which === 3) this.animation = new Animation(this.sheet, 285, 0, 95, 95, 0.2, 1, true, false);
	else if (which === 4) this.animation = new Animation(this.sheet, 0, 95, 95, 95, 0.2, 1, true, false);
	else if (which === 5) this.animation = new Animation(this.sheet, 95, 95, 95, 95, 0.2, 1, true, false);
	else if (which === 6) this.animation = new Animation(this.sheet, 190, 95, 95, 95, 0.2, 1, true, false);
	else if (which === 7) this.animation = new Animation(this.sheet, 285, 95, 95, 95, 0.2, 1, true, false);
	else if (which === 8) this.animation = new Animation(this.sheet, 0, 190, 95, 95, 0.2, 1, true, false);
	else if (which === 9) this.animation = new Animation(this.sheet, 95, 190, 95, 95, 0.2, 1, true, false);
	else if (which === 10) this.animation = new Animation(this.sheet, 190, 190, 95, 95, 0.2, 1, true, false);
	else if (which === 11) this.animation = new Animation(this.sheet, 285, 190, 95, 95, 0.2, 1, true, false);
	else if (which === 12) this.animation = new Animation(this.sheet, 0, 285, 95, 95, 0.2, 1, true, false);
	else if (which === 13) this.animation = new Animation(this.sheet, 95, 285, 95, 95, 0.2, 1, true, false);
	else if (which === 14) this.animation = new Animation(this.sheet, 190, 285, 95, 95, 0.2, 1, true, false);
	else if (which === 15) this.animation = new Animation(this.sheet, 285, 285, 95, 95, 0.2, 1, true, false);	
	
	this.addBoundRects(this.x + this.width * 3 / 8, this.y + this.height * 3 / 4, this.width / 4, this.height / 4);
}
SnowTree.prototype = new Terrain();
SnowTree.prototype.constructor = SnowTree;
function Tombstone(game, x, y) {
	Terrain.call(this, game, x, y);
	this.width = 50;
	this.height = 38;
	this.sheet = ASSET_MANAGER.getAsset("img/sheetTombstone.png");
	var which = getRandomNumber(0, 1);
	if (which === 0) this.animation = new Animation(this.sheet, 0, 20, 56, 58, 0.2, 1, true, false);
	else if (which === 1) this.animation = new Animation(this.sheet, 56, 20, 49, 58, 0.2, 1, true, false);
	
	this.addBoundRects(this.x, this.y, this.width, this.height);
}
Tombstone.prototype = new Terrain();
Tombstone.prototype.constructor = Tombstone;
function Rock(game, x, y) {
	Terrain.call(this, game, x, y);
	this.width = 35;
	this.height = 35;
	this.sheet = ASSET_MANAGER.getAsset("img/sheetRock.png");
	this.animation = new Animation(this.sheet, 52, 8, 33, 36, 0.2, 1, true, false);
	
	this.addBoundRects(this.x, this.y, this.width, this.height);
}
Rock.prototype = new Terrain();
Rock.prototype.constructor = Rock;
function FlatTerrain(game, x, y) {
	Terrain.call(this, game, x, y);
	this.width = 83 / 2;
	this.height = 86 / 2;
}

FlatTerrain.prototype = new Terrain();
FlatTerrain.prototype.constructor = FlatTerrain;

FlatTerrain.prototype.collide = function (other) {
	var x = this.x + this.width * 7 / 16;
	var y = this.y + this.width * 7 / 16;
	var width = this.width / 4;
	var height = this.height / 4;
	var otherX = other.x + other.width / 2 - width / 2;
	var otherY = other.y + other.height - height / 2;
	
	return (x < otherX + width &&
	x + width > otherX &&
	y < otherY + height &&
	height + y > otherY);
}
function Pit(game, x, y) {
	FlatTerrain.call(this, game, x, y);
	this.sheet = ASSET_MANAGER.getAsset("img/sheetPit.png");
	this.animation = new Animation(this.sheet, 584, 0, 83, 86, 0.2, 1, true, false);
}

Pit.prototype = new FlatTerrain();
Pit.prototype.constructor = Pit;

Pit.prototype.draw = function(ctx){
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.5);
}
function FalseFloor(game, x, y) {
	FlatTerrain.call(this, game, x, y);
}

FalseFloor.prototype = new FlatTerrain();
FalseFloor.prototype.constructor = FalseFloor;

FalseFloor.prototype.draw = function(ctx){
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.5);
}
function FalseFloorZombie(game, x, y) {
	FalseFloor.call(this, game, x, y);
	this.sheet = ASSET_MANAGER.getAsset("img/sheetPit.png");
    this.animation = new Animation(this.sheet, 386, 0, 93, 95, 0.2, 1, true, false);
}

FalseFloorZombie.prototype = new FalseFloor();
FalseFloorZombie.prototype.constructor = FalseFloorZombie;

FalseFloorZombie.prototype.update = function() {
	if (this.collide(this.game.hero)) {
		this.removeFromWorld = true;
		this.game.entities.push(new Pit(this.game, this.x, this.y));
	}
}
function FalseFloorSnow(game, x, y) {
	FalseFloor.call(this, game, x, y);
	this.sheet = ASSET_MANAGER.getAsset("img/sheetPit.png");
    this.animation = new Animation(this.sheet, 97, 102, 100, 99, 0.2, 1, true, false);
}

FalseFloorSnow.prototype = new FalseFloor();
FalseFloorSnow.prototype.constructor = FalseFloorSnow;
function FalseFloorTomb(game, x, y) {
	FalseFloor.call(this, game, x, y);
	this.sheet = ASSET_MANAGER.getAsset("img/sheetPit.png");
    this.animation = new Animation(this.sheet, 289, 0, 95, 96, 0.2, 1, true, false);
}
FalseFloorTomb.prototype = new FalseFloor();
FalseFloorTomb.prototype.constructor = FalseFloorTomb;
function FalseFloorHuman(game, x, y) {
	FalseFloor.call(this, game, x, y);
	this.sheet = ASSET_MANAGER.getAsset("img/sheetPit.png");
    this.animation = new Animation(this.sheet, 98, 0, 95, 95, 0.2, 1, true, false);
}

FalseFloorHuman.prototype = new FalseFloor();
FalseFloorHuman.prototype.constructor = FalseFloorHuman;
function Heart(game, x, y) {
	Entity.call(this, game, x, y);
	this.x = x;
	this.y = y;
	this.width = 15.5;
	this.height = 14.5;
	this.sheet = ASSET_MANAGER.getAsset("img/heartspritesheet.png");
	this.animation = new Animation(this.sheet, 0, 58, 62, 58, 0.2, 1, true, false);

	this.pickedUp = false;
}

Heart.prototype = new Item();
Heart.prototype.constructor = Heart;

Heart.prototype.draw = function (ctx) {
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0.25);
	Entity.prototype.draw.call(this);
};
// the "main" code begins here
window.onload = function () {
	ASSET_MANAGER = new AssetManager();
	ASSET_MANAGER.queueDownload("img/sheet2.png");
	ASSET_MANAGER.queueDownload("img/sheet3.png");
	ASSET_MANAGER.queueDownload("img/sheet4.png");
	ASSET_MANAGER.queueDownload("img/sheet5.png");
	ASSET_MANAGER.queueDownload("img/sheet6.png");
	ASSET_MANAGER.queueDownload("img/sheet7.png");
	ASSET_MANAGER.queueDownload("img/META4map.gif");
	ASSET_MANAGER.queueDownload("img/META4map-mini.gif");
	ASSET_MANAGER.queueDownload("img/weaponsheet2.png");
	ASSET_MANAGER.queueDownload("img/arrow.png");
	ASSET_MANAGER.queueDownload("img/bows.png");
	ASSET_MANAGER.queueDownload("img/keys.png");
	ASSET_MANAGER.queueDownload("img/gate.png");
	ASSET_MANAGER.queueDownload("img/heartspritesheet.png");
	ASSET_MANAGER.queueDownload("img/startscreen.png");
	ASSET_MANAGER.queueDownload("img/game-over-screen.png");
	ASSET_MANAGER.queueDownload("img/win-screen.png");
	ASSET_MANAGER.queueDownload("img/sheetTree.png");
	ASSET_MANAGER.queueDownload("img/sheetSnowTree.png");
	ASSET_MANAGER.queueDownload("img/sheetTombstone.png");
	ASSET_MANAGER.queueDownload("img/sheetRock.png");
	ASSET_MANAGER.queueDownload("img/sheetPit.png");
	ASSET_MANAGER.queueDownload("img/projectiles.png");
	ASSET_MANAGER.queueDownload("img/throwingBone.gif");
	ASSET_MANAGER.queueDownload("img/purpleOrb.png");
	ASSET_MANAGER.queueDownload("img/ninjaStars.png");

	ASSET_MANAGER.downloadAll(function() {
		newGame();
		var music = new Audio('audio/meta4-theme.wav');
		music.loop = true;
		music.play();
	});
}

function newGame() {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');

	game = new GameEngine();
	var enemies = [];
	var terrain = []; 
	game.map = new Map(game);
	game.hero = new Hero(game, 3180, 4100);
	game.camera = new Camera(game, canvas.width, canvas.height);
	game.playerInfo = new PlayerInfo(game);
	
	game.enemies = enemies;
	game.terrain = terrain;
	game.addEntity(game.camera);
	game.addEntity(game.hero);
	game.bossesKilled = 0;

	new PlaceEnemies(game, 30);
	new PlaceTerrain(game, 30);
	
	game.init(ctx);
	game.start();
}