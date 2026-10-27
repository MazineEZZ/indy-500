function roundTo(num, digit) {
  return Math.floor(num * 10 ** digit) / 10 ** digit;
}

function clamp(min, pref, max) {
  return Math.max(min, Math.min(pref, max));
}

function toRad(degree) {
  return (degree * Math.PI) / 180;
}

function toDegrees(rad) {
  return (rad * 180) / Math.PI;
}

function calcDistance2Points(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function isLetter(char) {
  // \p{L} matches any character in any language's alphabet
  return /^\p{L}$/u.test(char);
}

function colorToRGB(color) {
  const tempEl = document.createElement("div");
  tempEl.style.color = color;
  document.body.appendChild(tempEl);

  const colorCode = window.getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);

  const zero = 0;
  const rgbValues = colorCode.match(/\d+/g);
  if (!rgbValues) return { zero, zero, zero };

  const r = parseInt(rgbValues[0]);
  const g = parseInt(rgbValues[1]);
  const b = parseInt(rgbValues[2]);

  return { r, g, b };
}

function lerp(a, b, t) {
  // a: the value of the object
  // b: the value to follow
  // t: the time it takes to reach b
  return a + t * (b - a);
}

function inverseLerp(a, b, val) {
  return (val - a) / (b - a);
}

function remap(t, t1, t2, a, b) {
  // I remade this function using slopes for easier time manipulation
  return a + ((b - a) * (t - t1)) / (t2 - t1);
}

export {
  roundTo,
  clamp,
  colorToRGB,
  calcDistance2Points,
  isLetter,
  toRad,
  toDegrees,
  lerp,
  inverseLerp,
  remap,
};
