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