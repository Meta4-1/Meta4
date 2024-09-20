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