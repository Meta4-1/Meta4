
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
	this.spriteSheet = spriteSheet;
	this.startX = startX;
	this.startY = startY;
	this.frameWidth = frameWidth;
	this.frameDuration = frameDuration;
	this.frameHeight = frameHeight;
	this.frames = frames;
	this.totalTime = frameDuration * frames;
	this.elapsedTime = 0;
	this.loop = loop;
	this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
	var scaleBy = scaleBy || 1;
	this.elapsedTime += tick;
	if (this.loop) {
		if (this.isDone()) {
			this.elapsedTime = 0;
		}
	} else if (this.isDone()) {
		return;
	}
	var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
	var vindex = 0;
	while ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
		index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
		vindex++;
	}

	var locX = x;
	var locY = y;
	ctx.drawImage(this.spriteSheet,
		index * this.frameWidth + this.startX,
		vindex * this.frameHeight + this.startY, // source from sheet
		this.frameWidth, this.frameHeight,
		locX, locY,
		this.frameWidth * scaleBy,
		this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
	return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
	return (this.elapsedTime >= this.totalTime);
}