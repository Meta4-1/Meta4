function EnemyInfo(game, x, y) {
	Entity.call(this, game);
	this.x = x;
	this.y = y;
	this.width = 30;
	this.height = 10;
	
	this.greenWidth = this.width;
}


EnemyInfo.prototype = new Entity();
EnemyInfo.prototype.constructor = EnemyInfo;


EnemyInfo.prototype.draw = function (ctx) {
//	console.log("hello");
	ctx.fillStyle = "red";
	ctx.fillRect(this.x, this.y, this.width, this.height);
	ctx.fillStyle = "green";
	ctx.fillRect(this.x, this.y, this.greenWidth, this.height);

	Entity.prototype.draw.call(this);
}