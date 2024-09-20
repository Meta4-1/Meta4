function Skeleton(game, x, y) {
	var sheet = ASSET_MANAGER.getAsset("img/sheet2.png");
	var frameWidth = 33.3;
	var frameHeight = 32;
	Enemy.call(this, game, x, y, frameWidth, frameHeight, 200);

	this.animation = new Animation(sheet, 192, 128, frameWidth, frameHeight, 0.02, 1, true, false);

	this.downAnimation = new Animation(sheet, 192, 128, frameWidth, frameHeight, 0.2, 3, true, false);
	this.upAnimation = new Animation(sheet, 190, 224, frameWidth, frameHeight, 0.2, 3, true, false);
	this.leftAnimation = new Animation(sheet, 190, 160, frameWidth, frameHeight, 0.2, 3, true, false);
	this.rightAnimation = new Animation(sheet, 190, 192, frameWidth, frameHeight, 0.2, 3, true, false);

	this.hitpoints = 50;
	this.attackingTime = 0;
	this.attackDelay = 3000;
}

Skeleton.prototype = new Enemy();
Skeleton.prototype.constructor = Skeleton;

Skeleton.prototype.update = function () {
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
		var bone = new Bone(this.game, this.x, this.y, v.x, v.y);
		this.game.addEntity(bone);

	} else if (this.attackingTime > 0)
		this.attackingTime -= 50;

	Entity.prototype.update.call(this);
}