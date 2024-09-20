function WizardGoblin(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet3.png");
	var frameWidth = 32;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 0, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 0, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 0, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 0, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 0, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 70;
	this.attackingTime = 0;
	this.attackDelay = 3000;

}

WizardGoblin.prototype = new Enemy();
WizardGoblin.prototype.constructor = WizardGoblin;

WizardGoblin.prototype.update = function () {
	Enemy.prototype.update.call(this);

	if (this.canSee(this.game.hero) && this.attackingTime <= 0) {
		this.attackingTime = this.attackDelay;
		var v = {x: -this.x, y: -this.y};
		v.x += this.game.hero.x;
		v.y += this.game.hero.y;


		var magn = Math.sqrt(v.x * v.x + v.y * v.y);
		if (magn) {
			v.x *= 2 / magn;
			v.y *= 2 / magn;
		}

		v.x = Math.round(v.x);
		v.y = Math.round(v.y);
		var blueOrb = new BlueOrb(this.game, this.x, this.y, v.x, v.y);
		this.game.addEntity(blueOrb);

	} else if (this.attackingTime > 0)
		this.attackingTime -= 50;

	Entity.prototype.update.call(this);
}