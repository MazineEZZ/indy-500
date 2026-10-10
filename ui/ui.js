import { RegistrySystem } from "../systems/registry.js";
import {
  calcDistance2Points,
  clamp,
  colorToRGB,
  isLetter,
} from "../utilities/utils.js";
import { gameSettings } from "../data/settings.js";

class UIElement {
  constructor(x, y, width, height, zIndex) {
    this.position = { x, y };
    this.width = width;
    this.height = height;
    this.zIndex = zIndex;
    this.visible = true;
  }
  draw(ctx) {}
}

class Panel extends UIElement {
  constructor(x, y, width, height, zIndex, color) {
    super(x, y, width, height, zIndex);
    this.color = color;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Label extends UIElement {
  constructor(
    x,
    y,
    {
      text = "",
      color = "white",
      zIndex = 0,
      borderColor = "black",
      borderSize = 4,
      align = "left",
      baseline = "alphabetic",
      fontSize = "30px",
      fontName = "sans-serif",
      fontSrc = "",
    } = {},
  ) {
    super(x, y, 0, 0, zIndex);
    this.text = text;
    this.color = color;
    this.borderColor = borderColor;
    this.borderSize = borderSize;
    this.align = align;
    this.baseline = baseline;

    this.fontSize = fontSize;
    this.fontName = fontName;

    if (fontSrc !== "") {
      this.font = `${this.fontSize} sans-serif`;
      this.loadFont(fontSrc);
    } else {
      this.font = `${fontSize} ${fontName}`;
    }
  }
  loadFont(fontSrc) {
    const customFont = new FontFace(this.fontName, `url(${fontSrc})`);

    customFont
      .load()
      .then((loadedFont) => {
        document.fonts.add(loadedFont);
        this.font = `${this.fontSize} ${this.fontName}`;
      })
      .catch((err) => ("Font failed to load:  ", err));
  }
  setText(text) {
    this.text = text;
  }
  draw(ctx) {
    if (!this.visible) return;
    ctx.font = this.font;
    ctx.textAlign = this.align;
    ctx.textBaseline = this.baseline;
    // Border
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.borderSize;
    ctx.lineJoin = "round";
    ctx.strokeText(this.text, this.position.x, this.position.y);
    // Font
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.position.x, this.position.y);
  }
}

class ImageUI extends UIElement {
  constructor(image, x, y, width, height, zIndex) {
    super(x, y, width, height, zIndex);
    this.image = image;
  }
  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );
  }
}

class Button extends UIElement {
  constructor(
    x,
    y,
    width,
    height,
    zIndex,
    events,
    event,
    { btnBorderSize = "", btnBorderColor = "" },
    {
      text = "",
      fontClr = "white",
      borderColor = "black",
      borderSize = 4,
      align = "center",
      baseline = "middle", // Alphabetic
      fontSize = "30px",
      fontName = "sans-serif",
      fontSrc = "",
    } = {},
    color = "black",
    hoverClr = "gray",
  ) {
    super(x, y, width, height, zIndex);
    this.color = color;
    this.event = event;
    this.events = events;
    this.unhoverClr = color;
    this.hoverClr = hoverClr;
    this.borderSize = btnBorderSize;
    this.borderColor = btnBorderColor;
    const labelX = this.position.x + this.width / 2;
    const labelY = this.position.y + this.height / 2;
    this.label = new Label(labelX, labelY, {
      text,
      color: fontClr,
      zIndex,
      borderColor,
      borderSize,
      align,
      baseline,
      fontSize,
      fontName,
      fontSrc,
    });
  }
  update(dt, mouse) {
    if (!this.visible) return;
    if (isMouseOverlapping(this, mouse.position)) {
      this.color = this.hoverClr;
    } else {
      this.color = this.unhoverClr;
    }
    if (isMouseOverlapping(this, mouse.lastClickPos)) {
      this.events.emit(this.event, this.event);
    }
  }
  draw(ctx) {
    if (!this.visible) return;
    // Border
    ctx.fillStyle = this.borderColor;
    ctx.fillRect(
      this.position.x - this.borderSize,
      this.position.y - this.borderSize,
      this.width + this.borderSize * 2,
      this.height + this.borderSize * 2,
    );
    // Button
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    this.label.draw(ctx);
  }
}

class Checkbox extends UIElement {
  constructor(
    x,
    y,
    width,
    height,
    zIndex,
    color = "black",
    checkedColor = "rgb(8, 62, 198)",
  ) {
    super(x, y, width, height, zIndex);
    this.color = color;
    this.checkedColor = checkedColor;
    this.inCheck = false;
  }
  update(dt, mouse) {
    if (isMouseOverlapping(this, mouse.lastClickPos)) {
      this.inCheck = !this.inCheck;
    }
  }
  draw(ctx) {
    ctx.save();

    const offset = 4;

    ctx.lineWidth = offset;
    ctx.strokeStyle = this.color;
    ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

    if (this.inCheck) {
      ctx.fillStyle = this.checkedColor;
      ctx.fillRect(
        this.position.x + offset,
        this.position.y + offset,
        this.width - offset * 2,
        this.height - offset * 2,
      );
    }

    ctx.restore();
  }
}

class ResourceBar extends UIElement {
  constructor(
    x,
    y,
    width,
    height,
    zIndex,
    maxColor = "rgb(0, 255, 0)",
    midColor = "rgb(255, 255, 0)",
    minColor = "rgb(255, 0, 0)",
  ) {
    super(x, y, width, height, zIndex);
    this.progress = 1;
    this.maxColor = colorToRGB(maxColor);
    this.midColor = colorToRGB(midColor);
    this.minColor = colorToRGB(minColor);
    this.progressColor = this.maxColor;
    this.newVal = 1;
    this.maxVal = 1;
    this.minVal = 0;
  }
  setValue(val, max) {
    this.newVal = val / max;
  }
  update(dt) {
    this.progress = clamp(
      this.minVal,
      lerp(this.progress, this.newVal, 5 * dt),
      this.maxVal,
    );
    if (this.progress > 0.5) {
      this.progressColor = lerpColor(
        this.midColor,
        this.maxColor,
        this.progress,
        0.5,
        1,
      );
    } else {
      this.progressColor = lerpColor(
        this.minColor,
        this.midColor,
        this.progress,
        0,
        0.5,
      );
    }
  }
  draw(ctx) {
    ctx.save();
    // Back
    // ctx.fillStyle = "black";
    // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    // Bar
    const offset = 3;
    ctx.fillStyle = `rgb(${this.progressColor.r}, ${this.progressColor.g}, ${this.progressColor.b})`;
    ctx.fillRect(
      this.position.x + offset,
      this.position.y + offset,
      (this.width - offset * 2) * this.progress,
      this.height - offset * 2,
    );
    ctx.restore();
  }
}

class Slider extends UIElement {
  constructor(
    x,
    y,
    width,
    height,
    zIndex,
    color = "white",
    knobColor = "rgb(27, 67, 179)",
  ) {
    super(x, y, width, height, zIndex);
    this.color = color;
    this.maxVal = 1;
    this.minVal = 0;
    this.progress = 1;
    this.knob = {
      color: knobColor,
      radius: this.height / 2,
      position: {
        x: this.position.x + this.height / 2,
        y: this.position.y + this.height / 2,
      },
    };
  }
  update(dt, mouse) {
    if (mouse.isDown && this.isKnobClicked) {
      this.knob.position.x = mouse.position.x + this.diff;
    } else {
      this.isKnobClicked = false;
    }
    if (isMouseOverlapping(this.knob, mouse.lastClickPos, true)) {
      this.diff = this.knob.position.x - mouse.lastClickPos.x;
      this.isKnobClicked = true;
    }

    this.knob.position.x = this.keepInBounds(
      this.position.x,
      this.width,
      this.knob.position.x,
      this.knob.radius,
    );

    const min = this.position.x + this.knob.radius;
    const max = this.position.x + this.width - this.knob.radius;
    this.progress = inverseLerp(min, max, this.knob.position.x);
  }
  keepInBounds(sliderX, sliderWidth, knobX, knobRadius) {
    if (knobX + knobRadius >= sliderX + sliderWidth) {
      return sliderX + sliderWidth - knobRadius;
    } else if (knobX <= sliderX + knobRadius) {
      return sliderX + knobRadius;
    }
    return knobX;
  }
  draw(ctx) {
    ctx.save();
    // Back
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    // The Knob
    ctx.fillStyle = this.knob.color;
    ctx.beginPath();
    ctx.arc(
      this.knob.position.x,
      this.knob.position.y,
      this.knob.radius,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.restore();
  }
}

class TextBox extends UIElement {
  constructor(
    x,
    y,
    width,
    height,
    zIndex,
    color,
    {
      fontSize = "20px",
      fontClr = "white",
      fontBorderClr = "black",
      fontBorderSize = 4,
      fontAlign = "left",
      fontBaseline = "top",
    } = {},
  ) {
    super(x, y, width, height, zIndex);
    this.color = color;
    this.padding = 10;
    this._dirty = false;
    this.maxWidth = 200;
    // Font config
    this.fontSize = fontSize;
    this.lineHeight = fontSize.split("px")[0] * 1.2;
    this.fontClr = fontClr;
    this.fontBorderClr = fontBorderClr;
    this.fontBorderSize = fontBorderSize;
    this.font = `${this.fontSize} sans-serif`;
    this.align = fontAlign;
    this.baseline = fontBaseline;
  }
  setText(text) {
    if (this.text !== text) {
      this._dirty = true;
    }
    this.text = text;
  }
  wrapLines(ctx) {
    ctx.font = this.font;

    let accWidth = 0;
    let line = [];
    let lines = [];

    for (const char of this.text) {
      accWidth += ctx.measureText(char).width;
      line.push(char);

      if (accWidth >= this.maxWidth) {
        if (isLetter(line.at(-1))) {
          line.push("-");
        }
        lines.push(line.join(""));
        line.length = 0;
        accWidth = 0;
      }
    }
    lines.push(line.join(""));
    this.lines = lines;

    this.width =
      Math.max(...this.lines.map((line) => ctx.measureText(line).width)) +
      this.padding * 2;
    this.height = this.lineHeight * this.lines.length + this.padding * 2;
  }
  keepInScreen() {
    const offset = 10;
    if (this.position.y + this.height >= gameSettings.height) {
      this.position.y = gameSettings.height - this.height - offset;
    } else if (this.position.y <= offset) {
      this.position.y = offset;
    }

    if (this.position.x + this.width >= gameSettings.width) {
      this.position.x = gameSettings.width - this.width - offset;
    } else if (this.position.x <= offset) {
      this.position.x = offset;
    }
  }
  draw(ctx) {
    // Set width and height sizes for tooltip
    ctx.save();

    if (this._dirty) {
      this.wrapLines(ctx);
      this._dirty = false;
    }

    this.keepInScreen();

    // Back
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Text
    ctx.font = this.font;
    ctx.textAlign = this.align;
    ctx.textBaseline = this.baseline;
    let lineCount = 0;
    for (const line of this.lines) {
      // Border
      ctx.strokeStyle = this.fontBorderClr;
      ctx.lineWidth = this.fontBorderSize;
      ctx.lineJoin = "round";
      ctx.strokeText(
        line,
        this.position.x + this.padding,
        this.position.y + lineCount * this.lineHeight + this.padding,
      );
      // Font
      ctx.fillStyle = this.fontClr;
      ctx.fillText(
        line,
        this.position.x + this.padding,
        this.position.y + lineCount * this.lineHeight + this.padding,
      );
      lineCount++;
    }

    ctx.restore();
  }
}

class UILayer extends RegistrySystem {
  constructor() {
    super();
  }
  sortByLayers() {
    this.elements.sort((a, b) => a.zIndex - b.zIndex);
  }
}

// UI Helpful Functions
function isMouseOverlapping(element, mousepos, isCircle = false) {
  if (isCircle) {
    const distance = calcDistance2Points(element.position, mousepos);
    return distance < element.radius;
  }
  return (
    element.position.x < mousepos.x &&
    mousepos.x < element.position.x + element.width &&
    element.position.y < mousepos.y &&
    mousepos.y < element.position.y + element.height
  );
}

function lerpColor(color1, color2, progress, t1, t2) {
  return {
    r: remap(progress, t1, t2, color1.r, color2.r),
    g: remap(progress, t1, t2, color1.g, color2.g),
    b: remap(progress, t1, t2, color1.b, color2.b),
  };
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
  UIElement,
  UILayer,
  TextBox,
  Label,
  Panel,
  ImageUI,
  Button,
  ResourceBar,
  Checkbox,
  Slider,
  isMouseOverlapping,
};
