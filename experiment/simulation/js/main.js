// import * as THREE from 'three';
import { OrbitControls } from './orbit.js'
import * as THREE from './three.js'
import {
  AddLight,
  addSphere,
  addSphereAtCoordinate,
  CheckHover,
  DeleteObject,
  RepeatPattern,
  TranslatePattern,
  updateButtonCSS,
  highlightSelectList,
  moveSelectList,
  checkSCP,
  select_Region,
  changeCurrentLatticePrev,
  changeCurrentLatticeNext,
  createLattice,
  latticeChecker,
  performaction,
} from './utils.js'

var container = document.getElementById('canvas-main')
//  init camera
var camera = new THREE.PerspectiveCamera(
  75, //FOV
  container.clientWidth / container.clientHeight, //aspect ratio
  0.1,
  1000,
)
// var camera = new THREE.OrthographicCamera(
//   100 / -2,
//   100 / 2,
//   100 / 2,
//   100 / -2,
//   1,
//   100,
// )
camera.position.set(30, 30, 30)

// init the renderer and the scene

var scene = new THREE.Scene()
var renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setClearColor('#000000')
renderer.setSize(container.clientWidth, container.clientHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
// document.body.appendChild(renderer.domElement);
container.appendChild(renderer.domElement)

// console.log(window);
// initialize the axes
var axesHelper = new THREE.AxesHelper(container.clientHeight)
scene.add(axesHelper)

// add light to the  system
const lights = AddLight()
for (let i = 0; i < lights.length; i++) {
  scene.add(lights[i])
}
// init the orbit controls
var controls = new OrbitControls(camera, renderer.domElement)
controls.update()
controls.autoRotate = true
controls.autoRotateSpeed = 0
controls.enablePan = false
controls.enableDamping = true

// to check the current object which keyboard points to
let INTERSECTED

function getMouseCoords(event) {
  var mouse = new THREE.Vector2()
  mouse.x =
    ((event.clientX - renderer.domElement.offsetLeft) /
      renderer.domElement.clientWidth) *
      2 -
    1
  mouse.y =
    -(
      (event.clientY - renderer.domElement.offsetTop) /
      renderer.domElement.clientHeight
    ) *
      2 +
    1
  // mouse.x = ( ( event.clientX - container.offsetLeft ) / container.clientWidth ) * 2 - 1;
  // mouse.y = - ( ( event.clientY - container.offsetTop ) / container.clientHeight ) * 2 + 1;
  // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // console.log(mouse);
  return mouse
}
var mouse = new THREE.Vector2()
//  detect mouse click
let drag = false
document.addEventListener('mousedown', function (event) {
  drag = false
  mouse = getMouseCoords(event)
})
document.addEventListener('mousemove', function (event) {
  drag = true
  mouse = getMouseCoords(event)
})

document.addEventListener('keydown', function (event) {
  var keyCode = event.key
  if (keyCode == 'd') {
    DeleteObject(mouse, camera, scene, atomList, INTERSECTED)
  }
})

let action = ''

// create a list of atoms in scene
var atomList = []

var SelectAtomList = []
var BoundaryAtomList = []
var HullMeshList = []
// var currentatom = document.getElementById("atomtype");
// var atomtype = currentatom.options[currentatom.selectedIndex].text;

// select region enclosed between the atoms
// const selectRegion = document.getElementById('SelectRegion')
// selectRegion.addEventListener('click', function () {
//   let vals = select_Region(SelectAtomList, atomList)
//   let hullmesh = vals.mesh
//   let arr = vals.selectarray
//   for (let i = 0; i < arr.length; i++) {
//     SelectAtomList.push(arr[i])
//   }
//   //   console.log(hullmesh)
//   scene.add(hullmesh)
//   HullMeshList.push(hullmesh)
// })

// respond to click addAtom
// const addSphereButton = document.getElementById("AddAtom");
// addSphereButton.addEventListener("click", function () {
//     console.log("adding atom mode");
//     if (action != "addAtom") {
//         action = "addAtom";
//     } else {
//         action = "";
//     }
// });

// respond to select a bunch of atoms
const addSelectList = document.getElementById('SelectAtom')
addSelectList.addEventListener('click', function () {
  //   console.log('Selecting atom mode')
  if (action != 'selectAtom') {
    action = 'selectAtom'
  } else {
    action = ''
    SelectAtomList = []
  }
})

const LatticeList = [
  'Simple Cubic',
  'Face Centered Cubic',
  'Body Centered Cubic',
  'Hexagonal Packing',
]
var currentLatticeElement = document.getElementById('LatticeList')
var currentLattice =
  currentLatticeElement.options[currentLatticeElement.selectedIndex].text

let currentAtomList = createLattice(LatticeList.indexOf(currentLattice))
for (let i = 0; i < currentAtomList.length; i++) {
  //   console.log(currentAtomList[i])
  scene.add(currentAtomList[i])
  atomList.push(currentAtomList[i])
}

var torotateatomlist = new THREE.Object3D()
let activaterotation = 0
var axis = new THREE.Vector3(1, 0, 0)
var radians = Math.PI / 180

const Slider = document.getElementById('Slider')
const sliderval = document.getElementById('sliderval')
sliderval.innerHTML = Slider.valueAsNumber

Slider.oninput = function () {
  sliderval.innerHTML = Slider.valueAsNumber
  radians = (Slider.valueAsNumber / 180) * Math.PI

  console.log('rotating')
  torotateatomlist = new THREE.Object3D()
  for (let i = 0; i < atomList.length; i++) {
    torotateatomlist.add(atomList[i])
  }
  if (SelectAtomList.length == 2) {
    var pos1 = SelectAtomList[0].position
    var pos2 = SelectAtomList[1].position
    axis.subVectors(pos1, pos2)
    console.log(axis)
  }
  scene.add(torotateatomlist)
  torotateatomlist.rotateOnWorldAxis(axis.normalize(), radians)
}

// var degrees = document.getElementById('Degrees')
// degrees.addEventListener('input', function () {
//   radians = (degrees.valueAsNumber / 180) * Math.PI
// })

// const RotateAction = document.getElementById('RotateAction')
// RotateAction.addEventListener('click', function () {
//   if (activaterotation == 0) {
//     activaterotation = 1
//   } else {
//     activaterotation = 0
//   }
//   console.log('rotating')
//   torotateatomlist = new THREE.Object3D()
//   for (let i = 0; i < atomList.length; i++) {
//     torotateatomlist.add(atomList[i])
//   }
//   scene.add(torotateatomlist)

//   if (SelectAtomList.length == 2) {
//     var pos1 = SelectAtomList[0].position
//     var pos2 = SelectAtomList[1].position
//     axis.subVectors(pos1, pos2)
//     console.log(axis)
//   }
// })

var referenceAtomList = []
function createReferenceAtoms(currentAtomList) {
  for (let i = 0; i < currentAtomList.length; i++) {
    var pos = currentAtomList[i].position
    var atom = addSphereAtCoordinate(pos, 'Y', 'dummy')
    scene.add(atom)
    referenceAtomList.push(atom)
  }
}
createReferenceAtoms(currentAtomList)

currentLatticeElement.addEventListener('click', function () {
  currentLattice =
    currentLatticeElement.options[currentLatticeElement.selectedIndex].text
  // console.log('lattice change to', currentLattice)
  for (let i = 0; i < currentAtomList.length; i++) {
    scene.remove(currentAtomList[i])
  }
  for (let i = 0; i < referenceAtomList.length; i++) {
    scene.remove(referenceAtomList[i])
  }

  scene.remove(torotateatomlist)

  for (let i = 0; i < HullMeshList.length; i++) {
    scene.remove(HullMeshList[i])
  }
  atomList = []
  currentAtomList = createLattice(LatticeList.indexOf(currentLattice))

  for (let i = 0; i < currentAtomList.length; i++) {
    // console.log(currentAtomList[i])
    scene.add(currentAtomList[i])
    atomList.push(currentAtomList[i])
  }
  createReferenceAtoms(currentAtomList)
})

// respond to check selected lattice\
// respond to check selected lattice
const PerformAction = document.getElementById('PerformAction')
PerformAction.addEventListener('click', function () {
  //   console.log('Check Lattice Clicked')
  let out = performaction(
    LatticeList.indexOf(currentLattice),
    SelectAtomList,
    atomList,
  )
  let lbl = document.getElementById('lattice-result')

  if (out) lbl.innerHTML = "<span style='color: green;'>Correct</span>"
  else lbl.innerHTML = "<span style='color: red;'>InCorrect</span>"
  //SelectAtomList = []
})

// const PerformAction = document.getElementById('PerformAction')
// PerformAction.addEventListener('click', function () {
//   //   console.log('Check Lattice Clicked')
//   let out = performaction(LatticeList.indexOf(currentLattice), axis, radians)
//   let lbl = document.getElementById('lattice-result')

//   if (out) lbl.innerHTML = "<span style='color: green;'>Correct</span>"
//   else lbl.innerHTML = "<span style='color: red;'>InCorrect</span>"
// })

// make the window responsive
// window.addEventListener("resize", () => {
//     renderer.setSize(container.clientWidth, container.clientHeight);
//     camera.aspect = container.clientWidth / container.clientHeight;
//     camera.updateProjectionMatrix();
// });

document.addEventListener('mouseup', function (event) {
  if (drag == false) {
    // if the action is add atom
    if (action == 'selectAtom') {
      INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
      if (INTERSECTED) {
        SelectAtomList.push(INTERSECTED)
      }
    }
  }
})

// render the scene and animate
var rotatetick = 0
var frames = 30
var render = function () {
  highlightSelectList(SelectAtomList, atomList)

  //   if (activaterotation) {
  //     torotateatomlist.rotateOnWorldAxis(axis.normalize(), radians)
  //   }

  //   rotatetick += 1

  // updateButtonCSS(action);
  INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
  requestAnimationFrame(render)
  controls.update()
  renderer.render(scene, camera)
}

render()
