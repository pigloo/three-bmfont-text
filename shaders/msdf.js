var assign = require("object-assign");
var THREE = require("three");

module.exports = function createMSDFShader(opt) {
  opt = opt || {};
  var opacity = typeof opt.opacity === "number" ? opt.opacity : 1;
  var alphaTest = typeof opt.alphaTest === "number" ? opt.alphaTest : 0.0001;
  var precision = opt.precision || "highp";
  var color = opt.color;
  var map = opt.map;
  var negate = typeof opt.negate === "boolean" ? opt.negate : true;

  // remove to satisfy r73
  delete opt.map;
  delete opt.color;
  delete opt.precision;
  delete opt.opacity;
  delete opt.negate;

  return assign(
    {
      uniforms: {
        opacity: { type: "f", value: opacity },
        map: { type: "t", value: map || new THREE.Texture() },
        color: { type: "c", value: new THREE.Color(color) },
      },
      vertexShader:
        "#version 300 es\n" +
        [
          "in vec2 uv;",
          "in vec4 position;",
          "uniform mat4 projectionMatrix;",
          "uniform mat4 modelViewMatrix;",
          "out vec2 vUv;",
          "void main() {",
          "vUv = uv;",
          "gl_Position = projectionMatrix * modelViewMatrix * position;",
          "}",
        ].join("\n"),
      fragmentShader: [
        "#version 300 es",
        "precision " + precision + " float;",
        "uniform float opacity;",
        "uniform vec3 color;",
        "uniform sampler2D map;",
        "in vec2 vUv;",
        "out vec4 myOutputColor;",
        "float median(float r, float g, float b) {",
        " return max(min(r, g), min(max(r, g), b));",
        "}",
        "void main() {",
        " vec3 s = " + (negate ? "1.0 - " : "") + "texture(map, vUv).rgb;",
        " float sigDist = median(s.r, s.g, s.b) - 0.5;",
        " float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);",
        " myOutputColor = vec4(color.xyz, alpha * opacity);",
        alphaTest === 0
          ? ""
          : " if (myOutputColor.a < " + alphaTest + ") discard;",
        "}",
      ].join("\n"),
    },
    opt
  );
};
