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