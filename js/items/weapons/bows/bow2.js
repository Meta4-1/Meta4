function Bow2(game, x, y, pickedUp) {
	Bow.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/bows.png");
	this.animation = new Animation(sheet, 36, 0, 16, 36, 0.2, 1, true, false);
	this.damage = 25;
}

Bow2.prototype = new Bow();
Bow2.prototype.constructor = Bow2;
