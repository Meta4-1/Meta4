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