function PlayerInfo(game) {
	Entity.call(this, game);
	this.heartSheet = ASSET_MANAGER.getAsset("img/heartspritesheet.png");
	this.hearts = [new Animation(this.heartSheet, 0, 0, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 58, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 116, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 174, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 232, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 290, 186, 58, 0.2, 1, true, false),
		new Animation(this.heartSheet, 0, 348, 186, 58, 0.2, 1, true, false)
	];
	this.createButton = true;
	this.minimap = new MiniMap(game);
}


PlayerInfo.prototype = new Entity();
PlayerInfo.prototype.constructor = PlayerInfo;

PlayerInfo.prototype.update = function() {
	if (this.game.hero.lives <= 0) {
		this.game.hero.lives = -Infinity;
		this.game.entities.forEach(function(d) { if (d) d.removeFromWorld = true; });
	}
	
}

PlayerInfo.prototype.draw = function (ctx) {
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	var camera = this.game.camera;
	if (this.game.hero.lives <= 0) {
		var img = ASSET_MANAGER.getAsset("img/game-over-screen.png");
		ctx.drawImage(img, 0, 0, camera.width, camera.height);
		if (this.createButton) {
			document.getElementById('resetButton').style.display = "inline";
			this.createButton = false;
		}
	} else if (this.game.drDarkabolical.dead) {
		var img = ASSET_MANAGER.getAsset("img/win-screen.png");
		ctx.drawImage(img, 0, 0, camera.width, camera.height);
		if (this.createButton) {
			document.getElementById('resetButton').style.display = "inline";
			this.createButton = false;
		}
	} else {
		// ctx.textAlign = "right";
		// ctx.font = "30px Arial";
		// ctx.fillStyle = "black"
		// ctx.font = "24pt Impact";
		// ctx.fillText("Lives: ", camera.width - 100, 30);
		
		this.game.hero.currentWeapon.animation.drawFrame(this.game.clockTick, ctx, camera.width - 30, 40);

		this.hearts[this.game.hero.lives * 2].drawFrame(this.game.clockTick, ctx, camera.width - 100, 5, 0.5);

		this.game.hero.keys.forEach(function (key) {
			if (key.pickedUp) {
				var i = key.whichKey;
				key.animations[i].drawFrame(key.game.clockTick, ctx, camera.width - 25, (i + 2) * 40);
			}
		});
		this.minimap.draw(ctx);
	}
	ctx.restore();
}