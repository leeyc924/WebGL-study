import draw2D from './draw2D';
import draw3D from './draw3D';

function main() {
  let toggleState = '2D';
  const buttonEl = document.getElementsByClassName('toggle');
  if (!buttonEl || !buttonEl[0]) {
    return;
  }

  const button = buttonEl[0];
  button.addEventListener('click', () => {
    if (toggleState === '2D') {
      toggleState = '3D';
    } else {
      toggleState = '2D';
    }
    if (toggleState === '2D') {
      draw2D();
    } else {
      draw3D();
    }
  })


  if (toggleState === '2D') {
    draw2D();
  } else {
    draw3D();
  }
}

main();
