function Scarf(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet4.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);
	this.animation = new Animation(sheet, 192, 0, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 192, 0, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 192, 96, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 192, 32, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 192, 64, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 150;
}

Scarf.prototype = new Enemy();
Scarf.prototype.constructor = Scarf;