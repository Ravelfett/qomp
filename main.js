const canvas = document.getElementById("cnv");
const context = canvas.getContext("2d");
var width = window.innerWidth;
var height = window.innerHeight;


function resize() {
  width = window.innerWidth,
    height = window.innerHeight,
    ratio = window.devicePixelRatio;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  context.scale(ratio, ratio);
}
window.onresize = function() {
  resize();
};
window.onload = function() {
  resize();
  window.requestAnimationFrame(render);
}

document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('mousemove', (p) => {
  const t = canvas.getBoundingClientRect();
  /*mouse[0] = (p.pageX - t.left);
  mouse[1] = (p.pageY - t.top);*/
}, false);

document.onmousedown = function(e) {
  if (e.button == 0) {
    world.inputPlayer(s);

  }
  if (e.button == 2) {
  }
};

document.onmouseup = function(e) {
  if (e.button == 0) {
  }
  if (e.button == 2) {
  }
};

const world = new World();
let p = new Player(50, 50);
let s = p.id;
world.addPlayer(p);


world.addEntity(new Obstacle(0, 0, 300, 5));
world.addEntity(new Obstacle(0, 150, 305, 5));

world.addEntity(new PaddleX(20, 20, 5));
world.addEntity(new PaddleX(285, 20, 15));


function render() {
  context.clearRect(0, 0, width, height);
  context.beginPath();
  context.fillStyle = "black";
  context.rect(0, 0, width, height);
  context.fill();
  context.closePath();

  world.update();
  world.render(context, width, height);

  window.requestAnimationFrame(render);
}
