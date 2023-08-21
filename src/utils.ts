export function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  gl.deleteShader(shader);
}

export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  gl.deleteProgram(program);
}

export function randomInt(range: number) {
  return Math.floor(Math.random() * range);
}

export function setRectangle(gl: WebGLRenderingContext, x: number, y: number, width: number, height: number) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]), gl.STATIC_DRAW);
}

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier = 1) {
  const width = (canvas.clientWidth * multiplier) | 0;
  const height = (canvas.clientHeight * multiplier) | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}
const gopt = getQueryParams();

export function setupSlider(selector, options) {
  var parent = document.querySelector(selector);
  if (!parent) {
    // like jquery don't fail on a bad selector
    return;
  }
  if (!options.name) {
    options.name = selector.substring(1);
  }
  return createSlider(parent, options); // eslint-disable-line
}

function createSlider(parent, options) {
  var precision = options.precision || 0;
  var min = options.min || 0;
  var step = options.step || 1;
  var value = options.value || 0;
  var max = options.max || 1;
  var fn = options.slide;
  var name = gopt['ui-' + options.name] || options.name;
  var uiPrecision = options.uiPrecision === undefined ? precision : options.uiPrecision;
  var uiMult = options.uiMult || 1;

  min /= step;
  max /= step;
  value /= step;

  parent.innerHTML = `
    <div class="gman-widget-outer">
      <div class="gman-widget-label">${name}</div>
      <div class="gman-widget-value"></div>
      <input class="gman-widget-slider" type="range" min="${min}" max="${max}" value="${value}" />
    </div>
  `;
  var valueElem = parent.querySelector('.gman-widget-value');
  var sliderElem = parent.querySelector('.gman-widget-slider');

  function updateValue(value) {
    valueElem.textContent = (value * step * uiMult).toFixed(uiPrecision);
  }

  updateValue(value);

  function handleChange(event) {
    var value = parseInt(event.target.value);
    updateValue(value);
    fn(event, { value: value * step });
  }

  sliderElem.addEventListener('input', handleChange);
  sliderElem.addEventListener('change', handleChange);

  return {
    elem: parent,
    updateValue: v => {
      v /= step;
      sliderElem.value = v;
      updateValue(v);
    },
  };
}

function makeSlider(options) {
  const div = document.createElement('div');
  return createSlider(div, options);
}

var widgetId = 0;
function getWidgetId() {
  return '__widget_' + widgetId++;
}

export function makeCheckbox(options) {
  const div = document.createElement('div');
  div.className = 'gman-widget-outer';
  const label = document.createElement('label');
  const id = getWidgetId();
  label.setAttribute('for', id);
  label.textContent = gopt['ui-' + options.name] || options.name;
  label.className = 'gman-checkbox-label';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = options.value;
  input.id = id;
  input.className = 'gman-widget-checkbox';
  div.appendChild(label);
  div.appendChild(input);
  input.addEventListener('change', function (e) {
    options.change(e, {
      value: (e.target as any).checked,
    });
  });

  return {
    elem: div,
    updateValue: function (v) {
      input.checked = !!v;
    },
  };
}

function makeOption(options) {
  const div = document.createElement('div');
  div.className = 'gman-widget-outer';
  const label = document.createElement('label');
  const id = getWidgetId();
  label.setAttribute('for', id);
  label.textContent = gopt['ui-' + options.name] || options.name;
  label.className = 'gman-widget-label';
  const selectElem = document.createElement('select');
  options.options.forEach((name, ndx) => {
    const opt = document.createElement('option');
    opt.textContent = gopt['ui-' + name] || name;
    opt.value = ndx;
    opt.selected = ndx === options.value;
    selectElem.appendChild(opt);
  });
  selectElem.className = 'gman-widget-select';
  div.appendChild(label);
  div.appendChild(selectElem);
  selectElem.addEventListener('change', function (e) {
    options.change(e, {
      value: selectElem.selectedIndex,
    });
  });

  return {
    elem: div,
    updateValue: function (v) {
      selectElem.selectedIndex = v;
    },
  };
}

function noop() {}

function genSlider(object, ui) {
  const changeFn = ui.change || noop;
  ui.name = ui.name || ui.key;
  ui.value = object[ui.key];
  ui.slide =
    ui.slide ||
    function (event, uiInfo) {
      object[ui.key] = uiInfo.value;
      changeFn();
    };
  return makeSlider(ui);
}

function genCheckbox(object, ui) {
  const changeFn = ui.change || noop;
  ui.value = object[ui.key];
  ui.name = ui.name || ui.key;
  ui.change = function (event, uiInfo) {
    object[ui.key] = uiInfo.value;
    changeFn();
  };
  return makeCheckbox(ui);
}

function genOption(object, ui) {
  const changeFn = ui.change || noop;
  ui.value = object[ui.key];
  ui.name = ui.name || ui.key;
  ui.change = function (event, uiInfo) {
    object[ui.key] = uiInfo.value;
    changeFn();
  };
  return makeOption(ui);
}

const uiFuncs = {
  slider: genSlider,
  checkbox: genCheckbox,
  option: genOption,
};

export function setupUI(parent, object, uiInfos) {
  const widgets = {};
  uiInfos.forEach(function (ui) {
    const widget = uiFuncs[ui.type](object, ui);
    parent.appendChild(widget.elem);
    widgets[ui.key] = widget;
  });
  return widgets;
}

export function updateUI(widgets, data) {
  Object.keys(widgets).forEach(key => {
    const widget = widgets[key];
    widget.updateValue(data[key]);
  });
}

function getQueryParams() {
  var params = {};
  if ((window as any).hackedParams) {
    Object.keys((window as any).hackedParams).forEach(function (key) {
      params[key] = (window as any).hackedParams[key];
    });
  }
  if (window.location.search) {
    window.location.search
      .substring(1)
      .split('&')
      .forEach(function (pair) {
        var keyValue = pair.split('=').map(function (kv) {
          return decodeURIComponent(kv);
        });
        params[keyValue[0]] = keyValue[1];
      });
  }
  return params;
}
