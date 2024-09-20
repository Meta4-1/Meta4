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