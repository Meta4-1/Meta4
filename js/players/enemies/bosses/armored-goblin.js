function ArmoredGoblin(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet3.png");
	var frameWidth = 33.3;
	var frameHeight = 32;
	Boss.call(this, game, x, y, frameWidth, frameHeight);

	this.animation = new Animation(sheet, 94, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 94, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 94.5, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 94, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 94, 192, frameWidth, frameHeight, 0.2, 3, true, false);
}

ArmoredGoblin.prototype = new Boss();
ArmoredGoblin.prototype.constructor = ArmoredGoblin;