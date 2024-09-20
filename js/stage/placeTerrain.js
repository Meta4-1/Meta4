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