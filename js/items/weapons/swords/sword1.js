function Sword1(game, x, y, pickedUp) {
	Sword.call(this, game, x, y, pickedUp);
	var sheet = ASSET_MANAGER.getAsset("img/weaponsheet2.png");
	this.animation = new Animation(sheet, 68, 132, 20, 25, 0.2, 1, true, false);
	this.damage = 30;
	this.offX = 10;
}

Sword1.prototype = new Sword();
Sword1.prototype.constructor = Sword1;