function Arrow(game, x, y, damage, dir) {
	Entity.call(this, game, x, y);
	var sheet = ASSET_MANAGER.getAsset("img/arrow.png");
	this.animations = [new Animation(sheet, 0, 4, 32, 11, 0.2, 1, true, false),
		new Animation(sheet, 38, 0, 11, 29, 0.2, 1, true, false),
		new Animation(sheet, 71, 10, 32, 11, 0.2, 1, true, false),
		new Animation(sheet, 53, 0, 11, 29, 0.2, 1, true, false),
	];
	this.damage = damage;
	this.dir = dir;

	if (dir % 2) {
		this.width = 32;
		this.height = 11;
	} else {
		this.width = 11;
		this.height = 29;
	}
}

Arrow.prototype = new Entity();
Arrow.prototype.constructor = Arrow;

Arrow.prototype.update = function () {
	var bounds = this.game.camera.getBounds();
	if (!this.game.camera.onScreen(this) || this.collide(this.game.gate))
		this.removeFromWorld = true;

	for (var i = 0; i < this.game.enemies.length; i++) {
		var enemy = this.game.enemies[i];
		if (this.collide(enemy)) {
			if (enemy instanceof DrDarkabolical) {
				if (this.game.drDarkabolical.vulnerable && this.game.drDarkabolical.currentRound === 3) {
					this.game.drDarkabolical.dead = true;
				}
				if (this.game.drDarkabolical.vulnerable)
					this.game.drDarkabolical.vulnerable = false;
			} else {
				enemy.radius = 300;
				enemy.hitpoints -= this.damage;
				if (enemy.hitpoints <= 0) {
					if (enemy instanceof Scarf || enemy instanceof Hood) {
						this.game.drDarkabolical.minionsAlive--;
						if (this.game.drDarkabolical.minionsAlive === 0)
							this.game.drDarkabolical.vulnerable = true;
					}
					this.game.enemies.splice(i, 1);
					i--;
					enemy.removeFromWorld = true;
				}
				this.removeFromWorld = true;
			}
		}
	}

	if (this.dir == 0)
		this.x -= 6;
	else if (this.dir == 1)
		this.y += 6;
	else if (this.dir == 2)
		this.x += 6;
	else if (this.dir == 3)
		this.y -= 6;

	Entity.prototype.update.call(this);
};

Arrow.prototype.draw = function (ctx) {
	this.animations[this.dir].drawFrame(this.game.clockTick, ctx, this.x, this.y);
	Entity.prototype.draw.call(this);
};