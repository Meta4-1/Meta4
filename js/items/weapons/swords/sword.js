function Sword(game, x, y, pickedUp) {
	Weapon.call(this, game, x, y, pickedUp);
	this.attackDelay = 5000;
	this.width = 28;
	this.height = 25;
	this.offX = 15;
	this.offY = 5;
}

Sword.prototype = new Weapon();
Sword.prototype.constructor = Sword;

Sword.prototype.update = function () {
	Weapon.prototype.update.call(this);
	if (this.pickedUp) {
		if (this.left) {
			this.x -= this.offX;
			this.y += this.offY;
		} else if (this.right) {
			this.x += this.offX;
			this.y += this.offY;
		} else if (this.up) {
			this.y -= this.offY;
		} else if (this.down) {
			this.y += this.game.hero.height / 2 + this.offY;
		}
	}

	if (this.attacking && this.pickedUp && this.attackingTime >= this.attackDelay / 2) {
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
					enemy.hitpoints -= this.damage;
					enemy.attackedTime = 1000;
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
				}
			}
		}
	}
}

Weapon.prototype.draw = function (ctx) {
	ctx.save();
	if (!this.pickedUp) {
		this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	} else if ((this.attacking && this.attackingTime >= this.attackDelay / 2)|| this instanceof Bow) {
		ctx.translate(this.game.camera.x, this.game.camera.y + 5);
		var offX = 0, offY = 0;
		if (this.up) {
			offY = -5;
			offX = 18;
			ctx.scale(1, 1);
		}
		if (this.down) {
			offY = 0;
			offX = 18;
			ctx.scale(-1, -1);
		}
		if (this.left) {
			offX = 5;
			offY = 10;
			ctx.scale(1, 1);
		}
		if (this.right) {
			offX = 5;
			offY = 10;
			ctx.scale(-1, 1);
		}
		this.animation.drawFrame(this.game.clockTick, ctx, -this.width + offX, -this.height + offY);
	}
	ctx.restore();
};