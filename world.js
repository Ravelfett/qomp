class World{
  constructor(){
    this.camera = {x: 300/2, y: 150/2, zoom: 5};
    this.cameraTargets = [
      {
        x: 300/2, y: 150/2, zoom: 5
      },
      {
        x: 450, y: 150/2, zoom: 5
      },
      {
        x: 750, y: 130, zoom: 5
      },
      {
        x: 750, y: 330, zoom: 1
      },
    ]
    this.entities = {};
    this.players = {};

    this.collided = 0;
  }
  addPlayer(p){
    p.world = this;
    this.players[p.id] = p;
    this.entities[p.id] = p;
  }
  addEntity(e){
    e.world = this;
    this.entities[e.id] = e;
  }
  inputPlayer(id){
    this.players[id].vy*=-1;
  }
  update(){

    for(let i in this.entities){
      this.entities[i].update();
      if (this.entities[i].toDelete) {
        delete this.entities[i];
      }
    }
    for(let i in this.entities){
      for(let j in this.players){
        let d = 0;
        for(let i in this.cameraTargets){
          if((this.cameraTargets[i].x-this.players[j].x)**2+(this.cameraTargets[i].y-this.players[j].y)**2<
        (this.cameraTargets[d].x-this.players[j].x)**2+(this.cameraTargets[d].y-this.players[j].y)**2){
          d = i;
        }
        }
        this.camera.x+=(this.cameraTargets[d].x-this.camera.x)/600;
        this.camera.y+=(this.cameraTargets[d].y-this.camera.y)/600;
        this.camera.zoom+=(this.cameraTargets[d].zoom-this.camera.zoom)/300;
        if(i!=j){
          let col = this.entities[i].collision(this.players[j]);
          let xoff = 0;
          let yoff = 0;
          if(col>0){
            if (col == 1) {
              this.players[j].vx = Math.abs(this.players[j].vx);
              xoff = -5;
            }
            if (col == 2) {
              this.players[j].vx = -Math.abs(this.players[j].vx);
              xoff = 5;
            }
            if (col == 3) {
              this.players[j].vy = Math.abs(this.players[j].vy);
              yoff = -5;
            }
            if (col == 4) {
              this.players[j].vy = -Math.abs(this.players[j].vy);
              yoff = 5;
            }
            this.collided = Date.now();
            for (let k = 0; k < 5; k++) {
              this.addEntity(new Particle(this.players[j].x+this.players[j].w/2+xoff, this.players[j].y+this.players[j].h/2+yoff));
            }
            boom.currentTime = 0;
            boom.play();
          }
        }
      }
    }
    for (let i in this.players) {
      this.addEntity(new ShadowPlayer(this.players[i].x, this.players[i].y));
    }
  }
  render(ctx, width, height){
    ctx.scale(this.camera.zoom, this.camera.zoom);
    let xoff = 0;
    let yoff = 0;
    if (Date.now()-this.collided<40) {
      xoff = (Math.random()-0.5)*3;
      yoff = (Math.random()-0.5)*3;
    }
    ctx.translate(-this.camera.x + width/2 / this.camera.zoom + xoff, -this.camera.y + height/2 / this.camera.zoom + yoff);
    let entities = Object.values(this.entities).sort((a, b) => a.zIndex - b.zIndex);
    for(let i in entities){
      entities[i].render(ctx);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
