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
}

class Obstacle extends Entity{
  constructor(x, y, w, h){
    super(x, y, w, h);
  }
}


class Player extends Entity{
  constructor(x, y){
    super(x, y, 10, 10);
    this.vx = 1;
    this.vy = 1;
    this.speed = 1.5;
    this.color = "rgb(145, 24, 201)";
  }

  update(){
    this.x += this.vx * this.speed;
    this.y += this.vy * this.speed;
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
    this.color = "rgba(255, 255, 255, "+(1-(this.time/30))/2 +")";
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
  }

  update(){
    for(let i in this.world.players){
      this.y += (this.world.players[i].y-this.y-this.h/2)/this.g;
      break;
    }
  }
}
