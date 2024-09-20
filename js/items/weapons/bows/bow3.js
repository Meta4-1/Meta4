function Bow3(game, x, y, pickedUp) {
	Bow.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/bows.png");
	this.animation = new Animation(sheet, 72, 3, 15, 32, 0.2, 1, true, false);
	this.damage = 35;
}

Bow3.prototype = new Bow();
Bow3.prototype.constructor = Bow3;
