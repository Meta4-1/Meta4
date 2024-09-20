function BlondeZombie(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet6.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 192, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 192, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 192, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 192, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 192, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 40;
}

BlondeZombie.prototype = new Enemy();
BlondeZombie.prototype.constructor = BlondeZombie;