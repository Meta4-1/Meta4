function Bow1(game, x, y, pickedUp) {
	Bow.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/bows.png");
	this.animation = new Animation(sheet, 1, 2, 13, 33, 0.2, 1, true, false);
	this.damage = 15;
}

Bow1.prototype = new Bow();
Bow1.prototype.constructor = Bow1;