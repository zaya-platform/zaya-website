// Post-processing pipeline (custom, SwiftShader-budgeted):
//   world (HDR, depth) -> grab copy -> refractive glass -> DOF (half+quarter res) -> reprojection
//   motion blur -> caption composite -> bloom -> final (lens distortion, chromatic aberration,
//   ACES filmic tonemap, sRGB, film grain, vignette). Every stage is deterministic in t.
import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const VS = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

function mat(frag, uniforms) {
  return new THREE.ShaderMaterial({ uniforms, vertexShader: VS, fragmentShader: frag, depthTest: false, depthWrite: false });
}

export class Pipeline {
  constructor(renderer, W, H) {
    this.renderer = renderer; this.W = W; this.H = H;
    const hf = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false };
    this.rtScene = new THREE.WebGLRenderTarget(W, H, { ...hf, depthBuffer: true });
    this.rtScene.depthTexture = new THREE.DepthTexture(W, H, THREE.FloatType);
    this.rtGrab = new THREE.WebGLRenderTarget(W, H, hf);
    this.rtA = new THREE.WebGLRenderTarget(W, H, hf);
    this.rtB = new THREE.WebGLRenderTarget(W, H, hf);
    this.rtHalf = new THREE.WebGLRenderTarget(W >> 1, H >> 1, hf);
    this.rtHalf2 = new THREE.WebGLRenderTarget(W >> 1, H >> 1, hf);
    this.rtQ = new THREE.WebGLRenderTarget(W >> 2, H >> 2, hf);
    this.rtQ2 = new THREE.WebGLRenderTarget(W >> 2, H >> 2, hf);
    this.rtCap = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true, stencilBuffer: false });
    this.quad = new FullScreenQuad(null);

    this.copyM = mat(/* glsl */`uniform sampler2D t; varying vec2 vUv; void main(){ gl_FragColor = texture2D(t, vUv); }`, { t: { value: null } });
    this.downM = mat(/* glsl */`uniform sampler2D t; uniform vec2 px; varying vec2 vUv; void main(){
      vec4 c = texture2D(t, vUv + px * vec2(-1.0,-1.0)) + texture2D(t, vUv + px * vec2(1.0,-1.0)) + texture2D(t, vUv + px * vec2(-1.0,1.0)) + texture2D(t, vUv + px * vec2(1.0,1.0));
      gl_FragColor = c * 0.25; }`, { t: { value: null }, px: { value: new THREE.Vector2() } });
    this.blurM = mat(/* glsl */`uniform sampler2D t; uniform vec2 dir; varying vec2 vUv;
      void main(){ vec4 c = texture2D(t, vUv) * 0.227027;
        c += (texture2D(t, vUv + dir * 1.384615) + texture2D(t, vUv - dir * 1.384615)) * 0.316216;
        c += (texture2D(t, vUv + dir * 3.230769) + texture2D(t, vUv - dir * 3.230769)) * 0.070270;
        gl_FragColor = c; }`, { t: { value: null }, dir: { value: new THREE.Vector2() } });
    this.dofM = mat(/* glsl */`uniform sampler2D tScene, tHalf, tQuarter, tDepth; uniform float near, far, focus, range, maxBlur; varying vec2 vUv;
      float viewZ(float d){ float z = d * 2.0 - 1.0; return (2.0 * near * far) / (far + near - z * (far - near)); }
      void main(){
        float vz = viewZ(texture2D(tDepth, vUv).x);
        float dz = abs(vz - focus); float coc = smoothstep(0.0, 1.0, (dz - range) / max(range * 2.5, 0.001)) * maxBlur;
        vec4 s = texture2D(tScene, vUv); vec4 h = texture2D(tHalf, vUv); vec4 q = texture2D(tQuarter, vUv);
        vec4 c = coc < 0.5 ? mix(s, h, coc * 2.0) : mix(h, q, (coc - 0.5) * 2.0);
        gl_FragColor = c; }`,
      { tScene: { value: null }, tHalf: { value: null }, tQuarter: { value: null }, tDepth: { value: null }, near: { value: 0.1 }, far: { value: 200 }, focus: { value: 10 }, range: { value: 6 }, maxBlur: { value: 1 } });
    this.mbM = mat(/* glsl */`uniform sampler2D tColor, tDepth; uniform mat4 invVP, prevVP; uniform float strength, maxVel; varying vec2 vUv;
      void main(){
        float d = texture2D(tDepth, vUv).x;
        vec4 ndc = vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
        vec4 wp = invVP * ndc; wp /= wp.w;
        vec4 pp = prevVP * wp; pp /= pp.w;
        vec2 vel = (vUv - (pp.xy * 0.5 + 0.5)) * strength;
        float l = length(vel); if (l > maxVel) vel *= maxVel / l;
        vec4 c = vec4(0.0); const int N = 8;
        for (int i = 0; i < N; i++) { float f = (float(i) / float(N - 1)) - 0.5; c += texture2D(tColor, vUv + vel * f); }
        gl_FragColor = c / float(N); }`,
      { tColor: { value: null }, tDepth: { value: null }, invVP: { value: new THREE.Matrix4() }, prevVP: { value: new THREE.Matrix4() }, strength: { value: 0.6 }, maxVel: { value: 0.014 } });
    this.capM = mat(/* glsl */`uniform sampler2D tColor, tCap; varying vec2 vUv; void main(){ vec4 c = texture2D(tColor, vUv); vec4 k = texture2D(tCap, vUv); gl_FragColor = vec4(c.rgb * (1.0 - k.a) + k.rgb, 1.0); }`, { tColor: { value: null }, tCap: { value: null } });
    this.finalM = mat(/* glsl */`uniform sampler2D t; uniform float time, grain, vignette, distort, caAmount, exposure, sharpen; uniform vec2 res; uniform float guides; varying vec2 vUv;
      vec3 aces(vec3 x){ const float a=2.51, b=0.03, c=2.43, d=0.59, e=0.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0); }
      float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      void main(){
        vec2 d = vUv - 0.5; d.x *= res.x / res.y; float r2 = dot(d, d);
        vec2 uv = vUv + (vUv - 0.5) * r2 * distort;               // barrel distortion
        vec2 dir = (uv - 0.5) * r2 * caAmount;                      // radial chromatic aberration
        vec3 c; c.r = texture2D(t, uv + dir).r; c.g = texture2D(t, uv).g; c.b = texture2D(t, uv - dir).b;
        vec2 px = 1.0 / res; vec3 blur = (texture2D(t, uv + vec2(px.x, 0.0)).rgb + texture2D(t, uv - vec2(px.x, 0.0)).rgb + texture2D(t, uv + vec2(0.0, px.y)).rgb + texture2D(t, uv - vec2(0.0, px.y)).rgb) * 0.25;
        c = max(c + (c - blur) * sharpen, 0.0);                     // unsharp mask for a crisp phone-screen read
        c *= exposure;
        c = aces(c);                                                  // filmic, never clips above 1
        c = mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); // linear -> sRGB
        float g = hash(gl_FragCoord.xy + fract(time * 7.31) * 1000.0) - 0.5;
        c += g * grain * (0.6 + 0.4 * (1.0 - c.g));                  // fine grain, a touch heavier in shadows
        c *= 1.0 - smoothstep(0.35, 1.05, length(d)) * vignette;
        if (guides > 0.5) { // review guides: 8% safe margins + TikTok UI band (bottom 320px)
          vec2 p = vUv * res; float m = 0.08;
          if (abs(vUv.x - m) < 0.001 || abs(vUv.x - 1.0 + m) < 0.001 || abs(vUv.y - m) < 0.0006 || abs(vUv.y - 1.0 + m) < 0.0006) c = vec3(1.0, 0.0, 1.0);
          if (p.y < 320.0) c = mix(c, vec3(1.0, 0.0, 0.0), 0.15);
        }
        gl_FragColor = vec4(c, 1.0); }`,
      { t: { value: null }, time: { value: 0 }, grain: { value: 0.035 }, vignette: { value: 0.5 }, distort: { value: 0.045 }, caAmount: { value: 0.004 }, exposure: { value: 1.0 }, sharpen: { value: 0.45 }, res: { value: new THREE.Vector2(W, H) }, guides: { value: 0 } });

    this.bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.2, 0.5, 1.12);
    this.params = { focus: 10, range: 6, maxBlur: 0.25, mblur: 0.3, bloom: 0.2, exposure: 1.0, grain: 0.018, caAmount: 0.0018, distort: 0.02, vignette: 0.42 };
    this.prevVP = new THREE.Matrix4(); this.hasPrev = false;
    this.tmp = new THREE.Matrix4();
  }

  blit(material, target) { this.quad.material = material; this.renderer.setRenderTarget(target); this.quad.render(this.renderer); }

  render({ world, glass, captions, camera, capCamera, time, prevVP }) {
    const r = this.renderer, p = this.params;
    r.autoClear = true;
    // 1. world (HDR linear + depth)
    r.setRenderTarget(this.rtScene); r.clear(); r.render(world, camera);
    // 2. grab copy + refractive glass drawn over it (glass reads the grab, writes into the scene RT sharing its depth)
    if (glass && glass.children.length) {
      this.copyM.uniforms.t.value = this.rtScene.texture; this.blit(this.copyM, this.rtGrab);
      glass.traverse((o) => { if (o.material && o.material.uniforms && o.material.uniforms.tGrab) o.material.uniforms.tGrab.value = this.rtGrab.texture; });
      r.autoClear = false; r.setRenderTarget(this.rtScene); r.render(glass, camera); r.autoClear = true;
    }
    // 3. DOF: half + quarter res blurred copies
    this.downM.uniforms.t.value = this.rtScene.texture; this.downM.uniforms.px.value.set(0.5 / this.W, 0.5 / this.H); this.blit(this.downM, this.rtHalf);
    this.blurM.uniforms.t.value = this.rtHalf.texture; this.blurM.uniforms.dir.value.set(2 / this.W, 0); this.blit(this.blurM, this.rtHalf2);
    this.blurM.uniforms.t.value = this.rtHalf2.texture; this.blurM.uniforms.dir.value.set(0, 2 / this.H); this.blit(this.blurM, this.rtHalf);
    this.downM.uniforms.t.value = this.rtHalf.texture; this.downM.uniforms.px.value.set(1 / this.W, 1 / this.H); this.blit(this.downM, this.rtQ);
    this.blurM.uniforms.t.value = this.rtQ.texture; this.blurM.uniforms.dir.value.set(4 / this.W, 0); this.blit(this.blurM, this.rtQ2);
    this.blurM.uniforms.t.value = this.rtQ2.texture; this.blurM.uniforms.dir.value.set(0, 4 / this.H); this.blit(this.blurM, this.rtQ);
    const u = this.dofM.uniforms; u.tScene.value = this.rtScene.texture; u.tHalf.value = this.rtHalf.texture; u.tQuarter.value = this.rtQ.texture; u.tDepth.value = this.rtScene.depthTexture;
    u.near.value = camera.near; u.far.value = camera.far; u.focus.value = p.focus; u.range.value = p.range; u.maxBlur.value = p.maxBlur;
    this.blit(this.dofM, this.rtA);
    // 4. reprojection motion blur (camera-motion), using the previous frame's view-projection
    const vp = this.tmp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const m = this.mbM.uniforms; m.tColor.value = this.rtA.texture; m.tDepth.value = this.rtScene.depthTexture;
    m.invVP.value.copy(vp).invert(); m.prevVP.value.copy(prevVP || vp); m.strength.value = p.mblur;
    this.blit(this.mbM, this.rtB);
    // 5. captions (rendered without DOF/motion blur, but before bloom so they glow with the film)
    r.setRenderTarget(this.rtCap); r.setClearColor(0x000000, 0); r.clear(); if (captions) r.render(captions, capCamera); r.setClearColor(0x000000, 1);
    this.capM.uniforms.tColor.value = this.rtB.texture; this.capM.uniforms.tCap.value = this.rtCap.texture; this.blit(this.capM, this.rtA);
    // 6. bloom (composites additively into rtA)
    this.bloom.strength = p.bloom; this.bloom.render(r, null, this.rtA, 0, false);
    // 7. final grade to screen
    const f = this.finalM.uniforms; f.t.value = this.rtA.texture; f.time.value = time; f.grain.value = p.grain; f.vignette.value = p.vignette; f.distort.value = p.distort; f.caAmount.value = p.caAmount; f.exposure.value = p.exposure; f.vignette.value = p.vignette;
    this.blit(this.finalM, null);
  }
}
