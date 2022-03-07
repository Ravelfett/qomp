class Entity{
  constructor(x, y, w, h){
    this.id = Math.random()*10000;
    this.world = null;

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.color = "white";

    this.toDelete = false;

    this.zIndex = 0;

    this.exportable = false;
  }

  export(){
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    }
  }

  render(ctx){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }

  update(){

  }

  collision(e){
    let npx = ((e.x+e.w/2)-(this.x+this.w/2))/this.w;
    let npy = ((e.y+e.h/2)-(this.y+this.h/2))/this.h;
    if (!(e.x+e.w<this.x || e.x>this.x+this.w || e.y+e.h<this.y || e.y>this.y+this.h)) {
      if(Math.abs(npx)>Math.abs(npy)){
        if(npx>0){
          return 1;
        }else {
          return 2;
        }
      }else {
        if(npy>0){
          return 3;
        }else {
          return 4;
        }
      }
    }
    return 0;
  }

  collide(col){

  }
}

class Obstacle extends Entity{
  constructor(x, y, w, h){
    super(x, y, w, h);

    this.exportable = true;
  }

  export(){
    const obj = super.export();
    obj.type = "Obstacle";
    return obj
  }
}

class Breakable extends Entity{
  constructor(x, y, w, h){
    super(x, y, w, h);

    this.life = 5;

    this.zIndex = -1;

    this.exportable = true;
  }
  collide(){
    this.life -= 1;
    if (this.life<0) {
      this.toDelete = true;
    }
    this.updateColor();
  }

  updateColor(){
    this.color = `rgb(255, ${255-(5-this.life)*40}, ${255-(5-this.life)*40})`
  }

  export(){
    const obj = super.export();
    obj.type = "Breakable";
    return obj
  }
}

class Spike extends Entity{
  constructor(x, y, w, h){
    super(x, y, w, h);

    this.zIndex = -1;

    this.exportable = true;
	
	this.color = "rgb(255, 255, 0)";
	
  }
  collide(o ,e){
    o.kill();
  }

  export(){
    const obj = super.export();
    obj.type = "Spike";
    return obj
  }
}


class Player extends Entity{
  constructor(x, y){
    super(x, y, 10, 10);
    this.vx = 1;
    this.vy = 1;
    this.speed = 1.5;
    this.color = "rgb(145, 24, 201)";
	
	this.checkpoint = {x: x, y: y};
  }

  update(){
    this.x += this.vx * this.speed;
    this.y += this.vy * this.speed;
  }

  collide(o, col){
    let xoff = 0;
    let yoff = 0;
    if (col == 1) {
      this.vx = Math.abs(this.vx);
      xoff = -5;
    }
    if (col == 2) {
      this.vx = -Math.abs(this.vx);
      xoff = 5;
    }
    if (col == 3) {
      this.vy = Math.abs(this.vy);
      yoff = -5;
    }
    if (col == 4) {
      this.vy = -Math.abs(this.vy);
      yoff = 5;
    }
    for (let k = 0; k < 5; k++) {
      this.world.addEntity(new Particle(this.x+this.w/2+xoff, this.y+this.h/2+yoff));
    }
  }
  
  kill(){
	this.x = this.checkpoint.x;
	this.y = this.checkpoint.y;
  }
}


class ShadowPlayer extends Entity{
  constructor(x, y){
    super(x, y, 10, 10);
    this.time = 0;
    this.color = 1;

    this.zIndex = -1;
  }

  update(){
    this.time ++;
    this.color = "rgba(145, 24, 201, "+(1-(this.time/30))/4 +")";
    if (this.time>30) {
      this.toDelete = true;
    }
  }
  collision(){

  }
}


class Particle extends Entity{
  constructor(x, y){
    super(x, y, 1, 1);
    this.time = 0;
    this.color = 1;

    this.vx = (Math.random()-0.5)*2;
    this.vy = (Math.random()-0.5)*2;

    this.zIndex = 1;
  }

  update(){
    this.x += this.vx;
    this.y += this.vy;
    this.vy+=0.03;
    this.time ++;
    this.color = "rgba(255, 255, 255, "+(1-(this.time/30)) +")";
    if (this.time>30) {
      this.toDelete = true;
    }
  }
  collision(){

  }
}



class PaddleX extends Entity{
  constructor(x, y, g){
    super(x, y, 5, 50);
    this.g = g;

    this.exportable = true;
  }

  update(){
    for(let i in this.world.players){
      this.y += (this.world.players[i].y-this.y-this.h/2)/this.g;
      break;
    }
  }

  export(){
    const obj = super.export();
    obj.type = "PaddleX";
    delete obj.w;
    delete obj.h;
    obj.g = this.g;
    return obj
  }
}
