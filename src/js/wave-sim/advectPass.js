/**
 * Advect Pass
 *
 * Based off AfterimagePass by:
 * @author HypnosNova / https://www.threejs.org.cn/gallery/
 */

import {
  LinearFilter,
  MeshBasicMaterial,
  NearestFilter,
  RGBAFormat,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderTarget,
  RepeatWrapping
} from 'three';
import {
  Pass
}
from 'three/examples/jsm/postprocessing/Pass';
import {
  AdvectPassShader
} from './advectShader';

var AdvectPass = function (options) {

  Pass.call(this);

  if (AdvectPassShader === undefined)
    console.error("AdvectPass relies on AdvectPassShader");

  this.shader = AdvectPassShader;

  this.uniforms = UniformsUtils.clone(this.shader.uniforms);

  const {
    velField,
    tOld,
    timestep,
    dissipation,
    rdx,
  } = options;

  this.uniforms['velField'].value = velField;
  this.uniforms['tOld'].value = tOld;
  this.uniforms['timestep'].value = timestep !== undefined ? timestep : 2.0;
  this.uniforms['dissipation'].value = dissipation !== undefined ? dissipation : 0.96;
  this.uniforms['rdx'].value = rdx !== undefined ? rdx : 1/256;

  this.textureComp = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {

    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat

  });

  this.textureOld = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {

    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat

  });

  this.shaderMaterial = new ShaderMaterial({

    uniforms: this.uniforms,
    vertexShader: this.shader.vertexShader,
    fragmentShader: this.shader.fragmentShader

  });

  this.compFsQuad = new Pass.FullScreenQuad(this.shaderMaterial);

  var material = new MeshBasicMaterial();
  this.copyFsQuad = new Pass.FullScreenQuad(material);

};

AdvectPass.prototype = Object.assign(Object.create(Pass.prototype), {

  constructor: AdvectPass,

  render: function (renderer, writeBuffer, readBuffer) {

    this.uniforms["tOld"].value = this.textureOld.texture;
    this.uniforms["tDiffuse"].value = readBuffer.texture;

    renderer.setRenderTarget(this.textureComp);
    this.compFsQuad.render(renderer);

    this.copyFsQuad.material.map = this.textureComp.texture;

    if (this.renderToScreen) {

      renderer.setRenderTarget(null);
      this.copyFsQuad.render(renderer);

    } else {

      renderer.setRenderTarget(writeBuffer);

      if (this.clear) renderer.clear();

      this.copyFsQuad.render(renderer);

    }

    // Swap buffers.
    var temp = this.textureOld;
    this.textureOld = this.textureComp;
    this.textureComp = temp;
    // Now textureOld contains the latest image, ready for the next frame.

  },

  setSize: function (width, height) {

    this.textureComp.setSize(width, height);
    this.textureOld.setSize(width, height);

  }

});

export {
  AdvectPass
};