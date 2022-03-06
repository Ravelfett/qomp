glUtils.SL.init({
  callback: function() {
    main()
  }
});

function main() {

  myAudio = new Audio('qomp.wav');
  myAudio.volume = 1/2;
  if (typeof myAudio.loop == 'boolean') {
    myAudio.loop = true;
  } else {
    myAudio.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
  }

  boom = new Audio('boom.wav');
  boom.volume = 1/2;

  const canvas = document.getElementById("cnv");
  var width = window.innerWidth;
  var height = window.innerHeight;

  const gl = glUtils.checkWebGL(canvas);



  var vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex),
    fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);

  program = glUtils.createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);


  const positionLocation = gl.getAttribLocation(program, "position");
  const texCoordLocation = gl.getAttribLocation(program, "texcoord");
  const resolutionLocation = gl.getUniformLocation(program, "resolution");
  const timeLocation = gl.getUniformLocation(program, "u_time");


  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0
    ]),
    gl.STATIC_DRAW);

  // create position buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  //create texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  //normalize image to powers of two
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  function renderr(bufferCanvas) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // setup buffers and attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    //load buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);


    //draw size and position
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0,
      bufferCanvas.width, 0,
      0, bufferCanvas.height,
      0, bufferCanvas.height,
      bufferCanvas.width, 0,
      bufferCanvas.width, bufferCanvas.height
    ]), gl.STATIC_DRAW);

    //load texture from 2d canvas
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      bufferCanvas);

    gl.uniform2f(resolutionLocation,
      gl.canvas.width,
      gl.canvas.height);


    gl.uniform1f(timeLocation,
      Date.now() % 1000);


    //draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const offscreen = document.createElement('canvas');
  const offscreenContext = offscreen.getContext("2d");

  function resize() {
    width = window.innerWidth,
      height = window.innerHeight,
      ratio = window.devicePixelRatio;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    offscreen.width = width * ratio;
    offscreen.height = height * ratio;
    gl.viewport(0, 0, width, height);
    //context.scale(ratio, ratio);
  }
  window.onresize = function() {
    resize();
  };
  window.onload = function() {
    resize();
    window.requestAnimationFrame(render);
  }

  document.getElementById("volume").addEventListener("input", (e)=>{
    myAudio.volume = Number(e.target.value)/100;
    boom.volume = Number(e.target.value)/100;
  })

  document.addEventListener('contextmenu', event => event.preventDefault());

  document.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    if (e.keyCode == 32) {
      if (editMode) {
        update = !update;
      }
    }
    if (e.keyCode == 67) {
      if (editMode) {
        world.addEntity(new Breakable(mouse[0], mouse[1], 10, 10))
      }
    }
    if (e.keyCode == 88) {
      if (editMode) {
        world.addEntity(new Obstacle(mouse[0], mouse[1], 10, 10))
      }
    }
    if (e.keyCode == 69) {
      console.log(JSON.stringify(world.export()));
    }
    if (e.keyCode == 82) {
      world.entities = {};
      console.log(world.players);
      world.loadWorld(JSON.parse(saves.pop()));
      for(const i in world.players){
        world.addEntity(world.players[i]);
      }
    }
  }, false);

  document.addEventListener('mousemove', (p) => {
    const t = canvas.getBoundingClientRect();
    mouse[0] = (p.pageX - t.left);
    mouse[1] = (p.pageY - t.top);

    mouse[0] = (mouse[0] - width/2)/world.camera.zoom + world.camera.x;
    mouse[1] = (mouse[1] - height/2)/world.camera.zoom + world.camera.y;
  }, false);

  document.onmousedown = function(e) {
    if (e.button == 0) {
      world.inputPlayer(s);

      myAudio.play();
    }
    if (e.button == 2) {
      for(const i in world.entities){
        if ((mouse[0]-(world.entities[i].x + world.entities[i].w))**2 + (mouse[1]-(world.entities[i].y + world.entities[i].h))**2 < 50) {
          sizing = i;
          saves.push(JSON.stringify(world.export()));
          return;
        }

        if(world.entities[i].collision({x: mouse[0], y: mouse[1], w: 0, h: 0})){
          moving = i;
          offset = [world.entities[i].x-mouse[0], world.entities[i].y-mouse[1]];
          saves.push(JSON.stringify(world.export()));
        }
      }
    }
  };

  document.onmouseup = function(e) {
    if (e.button == 0) {}
    if (e.button == 2) {
      moving = null;
      sizing = null;
    }
  };

  const world = new World();
  const p = new Player(50, 50);
  const s = p.id;
  world.addPlayer(p);


  world.loadWorld(map);

  let editMode = false;
  let saves = [];

  let mouse = [0, 0];
  let moving = null;
  let sizing = null;

  let update = true;

  //console.log(JSON.stringify(world.export()));

  function render() {
    offscreenContext.clearRect(0, 0, width, height);
    offscreenContext.beginPath();
    offscreenContext.fillStyle = "black";
    offscreenContext.rect(0, 0, width, height);
    offscreenContext.fill();
    offscreenContext.closePath();

    if (moving != null) {
      world.entities[moving].x = Math.round(offset[0]+mouse[0]);
      world.entities[moving].y = Math.round(offset[1]+mouse[1]);
    }
    if (sizing != null) {
      world.entities[sizing].w = Math.round(mouse[0] - world.entities[sizing].x);
      world.entities[sizing].h = Math.round(mouse[1] - world.entities[sizing].y);
    }

    if (!update) {
      world.camera.zoom = 1;
    }

    if (update) {
      world.update();
    }
    world.render(offscreenContext, width, height);

    renderr(offscreen)

    window.requestAnimationFrame(render);
  }
}
