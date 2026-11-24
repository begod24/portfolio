// Visual effects: old-TV noise overlay (WebGL) + pixelated images that sharpen on hover.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- 1. TV noise overlay ---------------- */
  const tv = document.getElementById('tv');
  const gl = tv && tv.getContext('webgl', { premultipliedAlpha: false, antialias: false });
  if (!gl) {
    document.documentElement.classList.add('no-gl');
  } else {
    const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
    const fs = `
      precision mediump float;
      uniform vec2 res; uniform float t;
      float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void main(){
        vec2 uv = gl_FragCoord.xy / res;
        vec2 cell = floor(gl_FragCoord.xy / 2.0);                 // chunky 2px grain
        float n = hash(cell + floor(t * 24.0) * 17.13);            // new grain every frame
        float scan = 0.5 + 0.5 * sin(gl_FragCoord.y * 3.14159);    // scanlines
        float band = smoothstep(0.0, 0.08, 0.08 - abs(fract(uv.y - t * 0.07) - 0.5)); // rolling bar
        float flick = 0.92 + 0.08 * hash(vec2(floor(t * 12.0), 1.0));
        float v = (n * 0.075 + scan * 0.018 + band * 0.035) * flick;
        gl_FragColor = vec4(vec3(v), 1.0);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'res'), uT = gl.getUniformLocation(prog, 't');

    const size = () => {
      const s = Math.min(devicePixelRatio || 1, 1.5);
      tv.width = Math.ceil(innerWidth * s); tv.height = Math.ceil(innerHeight * s);
      gl.viewport(0, 0, tv.width, tv.height); gl.uniform2f(uRes, tv.width, tv.height);
    };
    size(); addEventListener('resize', size);

    let last = 0;
    const frame = (now) => {
      if (now - last > 1000 / 24) {               // ~24 fps, like film/TV
        last = now; gl.uniform1f(uT, now / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!reduced) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ---------------- 2. Pixelated images ---------------- */
  // idle pixel size in CSS px: about 1/45 of the picture width, 4..10 px
const blockFor = (el) => Math.max(4, Math.min(10, Math.round(el.clientWidth / 45)));
  const small = document.createElement('canvas');
  const sctx = small.getContext('2d');
  const touch = matchMedia('(hover: none)').matches;

  document.querySelectorAll('.px').forEach(box => {
    const img = box.querySelector('img');
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('2d');
    const contain = box.classList.contains('contain');
    let block = blockFor(box), target = block, anim = 0;
    box.appendChild(cv);
    cv.addEventListener('click', () => img.click());

    const draw = () => {
      if (!img.naturalWidth) return;
      const dpr = devicePixelRatio || 1;
      const W = Math.max(1, Math.round(box.clientWidth * dpr)), H = Math.max(1, Math.round(box.clientHeight * dpr));
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      // source/dest rects for object-fit cover or contain
      const ir = img.naturalWidth / img.naturalHeight, br = W / H;
      let sx = 0, sy = 0, sw = img.naturalWidth, shh = img.naturalHeight, dx = 0, dy = 0, dw = W, dh = H;
      if (contain) { if (ir > br) { dh = W / ir; dy = (H - dh) / 2; } else { dw = H * ir; dx = (W - dw) / 2; } }
      else { if (ir > br) { sw = shh * br; sx = (img.naturalWidth - sw) / 2; } else { shh = sw / br; sy = (img.naturalHeight - shh) / 2; } }
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      const b = block * dpr;
      if (block <= 1.05) { ctx.imageSmoothingEnabled = true; ctx.drawImage(img, sx, sy, sw, shh, dx, dy, dw, dh); return; }
      const w = Math.max(1, Math.ceil(W / b)), h = Math.max(1, Math.ceil(H / b));
      small.width = w; small.height = h;
      sctx.imageSmoothingEnabled = true; sctx.fillStyle = '#000'; sctx.fillRect(0, 0, w, h);
      sctx.drawImage(img, sx, sy, sw, shh, dx / b, dy / b, dw / b, dh / b);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, w, h, 0, 0, w * b, h * b);
    };

    const animate = () => {
      cancelAnimationFrame(anim);
      const step = () => {
        block += (target - block) * (reduced ? 1 : 0.18);
        if (Math.abs(target - block) < 0.08) block = target;
        draw();
        if (block !== target) anim = requestAnimationFrame(step);
      };
      step();
    };
    const sharpen = (on) => { target = on ? 1 : blockFor(box); animate(); };

    const ready = () => { box.classList.add('ready'); draw(); };
    if (img.complete && img.naturalWidth) ready(); else img.addEventListener('load', ready);
    new ResizeObserver(draw).observe(box);

    if (touch) {
      new IntersectionObserver(es => es.forEach(e => sharpen(e.intersectionRatio > 0.7)), { threshold: [0, 0.7, 1] }).observe(box);
    } else {
      box.addEventListener('mouseenter', () => sharpen(true));
      box.addEventListener('mouseleave', () => sharpen(false));
    }
  });
})();
