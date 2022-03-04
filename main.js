glUtils.SL.init({
  callback: function() {
    main()
  }
});

function main() {


  myAudio = new Audio('qomp.wav');
  if (typeof myAudio.loop == 'boolean')
  {
      myAudio.loop = true;
  }
  else
  {
      myAudio.addEventListener('ended', function() {
          this.currentTime = 0;
          this.play();
      }, false);
  }

  boom = new Audio('boom.wav');

  const canvas = document.getElementById("cnv");
  var width = window.innerWidth;
  var height = window.innerHeight;

  let gl = glUtils.checkWebGL(canvas);



  var vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex),
    fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);

  program = glUtils.createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);


  let positionLocation = gl.getAttribLocation(program, "position");
  let texCoordLocation = gl.getAttribLocation(program, "texcoord");
  let resolutionLocation = gl.getUniformLocation(program, "resolution");
  let timeLocation = gl.getUniformLocation(program, "u_time");


  let texCoordBuffer = gl.createBuffer();
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
  let positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  //create texture
  let texture = gl.createTexture();
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
          Date.now()%1000);


    //draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  let offscreen = document.createElement('canvas');
  let offscreenContext = offscreen.getContext("2d");

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

  document.addEventListener('contextmenu', event => event.preventDefault());

  document.addEventListener('mousemove', (p) => {
    const t = canvas.getBoundingClientRect();
    /*mouse[0] = (p.pageX - t.left);
    mouse[1] = (p.pageY - t.top);*/
  }, false);

  document.onmousedown = function(e) {
    if (e.button == 0) {
      world.inputPlayer(s);

      myAudio.play();
    }
    if (e.button == 2) {}
  };

  document.onmouseup = function(e) {
    if (e.button == 0) {}
    if (e.button == 2) {}
  };

  const world = new World();
  let p = new Player(50, 50);
  let s = p.id;
  world.addPlayer(p);


  world.addEntity(new Obstacle(-50, -45, 1100, 50));
  world.addEntity(new Obstacle(-50, 150, 700, 320));
  world.addEntity(new Obstacle(400, -45, 550, 90));
  world.addEntity(new Obstacle(400, 105, 330, 50));
  world.addEntity(new Obstacle(700, 190, 30, 30));
  world.addEntity(new Obstacle(900, 0, 50, 500));
  world.addEntity(new Obstacle(700, 210, 300, 60));
  world.addEntity(new Obstacle(600, 400, 350, 60));

  world.addEntity(new PaddleX(20, 20, 5));
  world.addEntity(new PaddleX(285, 20, 45));





  function render() {
    offscreenContext.clearRect(0, 0, width, height);
    offscreenContext.beginPath();
    offscreenContext.fillStyle = "black";
    offscreenContext.rect(0, 0, width, height);
    offscreenContext.fill();
    offscreenContext.closePath();

    world.update();
    world.render(offscreenContext, width, height);

    renderr(offscreen)

    window.requestAnimationFrame(render);
  }
}
