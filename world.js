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
        x: 550, y: 367, zoom: 4.5
      },
      {
        x: 830, y: 460, zoom: 7
      },
	  {
        x: 930, y: 640, zoom: 5
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

    for(const i in this.entities){
      this.entities[i].update();
      if (this.entities[i].toDelete) {
        delete this.entities[i];
      }
    }
    for(const i in this.entities){
      for(const j in this.players){
        let d = 0;
        for(const k in this.cameraTargets){
          if((this.cameraTargets[k].x-this.players[j].x)**2+(this.cameraTargets[k].y-this.players[j].y)**2<
        (this.cameraTargets[d].x-this.players[j].x)**2+(this.cameraTargets[d].y-this.players[j].y)**2){
          d = k;
        }
        }
        this.camera.x+=(this.cameraTargets[d].x-this.camera.x)/600;
        this.camera.y+=(this.cameraTargets[d].y-this.camera.y)/600;
        this.camera.zoom+=(this.cameraTargets[d].zoom-this.camera.zoom)/300;
        if(i!=j){
          const col = this.entities[i].collision(this.players[j]);
          if(col>0){
            this.entities[i].collide(this.players[j], col);
            this.players[j].collide(this.entities[i], col)
            this.collided = Date.now();
            boom.currentTime = 0;
            boom.play();
          }
        }
      }
    }
    for (const i in this.players) {
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
    const entities = Object.values(this.entities).sort((a, b) => a.zIndex - b.zIndex);
    for(const i in entities){
      entities[i].render(ctx);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  export(){
    const result = [];
    for(const i in this.entities){
      if (this.entities[i].exportable) {
        result.push(this.entities[i].export());
      }
    }
    return result;
  }

  loadWorld(m){
    for(const i in m){
      let entity = null;
      switch (m[i].type) {
        case "Obstacle":
          entity = new Obstacle(m[i].x, m[i].y, m[i].w, m[i].h)
          break;
        case "Breakable":
          entity = new Breakable(m[i].x, m[i].y, m[i].w, m[i].h)
          break;
		case "Spike":
		  entity = new Spike(m[i].x, m[i].y, m[i].w, m[i].h)
	      break;
        case "PaddleX":
          entity = new PaddleX(m[i].x, m[i].y, m[i].g)
          break;
        default:
          return
      }
      this.addEntity(entity);
    }
  }
}
