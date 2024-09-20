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