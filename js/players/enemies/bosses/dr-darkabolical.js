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