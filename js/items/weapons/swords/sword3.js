function Sword3(game, x, y, pickedUp) {
	Sword.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/weaponsheet2.png");
	this.animation = new Animation(sheet, 33, 163, 28, 25, 0.2, 1, true, false);
	this.damage = 70;
}

Sword3.prototype = new Sword();
Sword3.prototype.constructor = Sword3;
