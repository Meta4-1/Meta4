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