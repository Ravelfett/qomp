class World{
  constructor(){
    this.camera = {x: 300/2, y: 150/2, zoom: 5};
    this.entities = {};
    this.players = {};
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
        if(i!=j){
          let col = this.entities[i].collision(this.players[j]);
          if(col>0){
            if (col == 1) {
              this.players[j].vx = Math.abs(this.players[j].vx)
            }
            if (col == 2) {
              this.players[j].vx = -Math.abs(this.players[j].vx)
            }
            if (col == 3) {
              this.players[j].vy = Math.abs(this.players[j].vy)
            }
            if (col == 4) {
              this.players[j].vy = -Math.abs(this.players[j].vy)
            }
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
    ctx.translate(-this.camera.x + width/2 / this.camera.zoom, -this.camera.y + height/2 / this.camera.zoom);
    let entities = Object.values(this.entities).sort((a, b) => a.zIndex - b.zIndex);
    for(let i in entities){
      entities[i].render(ctx);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
