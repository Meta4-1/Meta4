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