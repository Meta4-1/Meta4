function Sword2(game, x, y, pickedUp) {
	Sword.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/weaponsheet2.png");
	this.animation = new Animation(sheet, 0, 163, 28, 25, 0.2, 1, true, false);
	this.damage = 55;
}

Sword2.prototype = new Sword();
Sword2.prototype.constructor = Sword2;
