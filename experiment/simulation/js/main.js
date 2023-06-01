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
  CheckSymmetry,
  PlaneSymmetry,
  PointSymmetry,
} from './utils.js'

// init container
var container = document.getElementById('canvas-main')

// init the renderer and the scene
var scene = new THREE.Scene()
var renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setClearColor('#000000')
renderer.setSize(container.clientWidth, container.clientHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
container.appendChild(renderer.domElement)

// init perspective camera
var camera_distance = 25
var perspective_camera = new THREE.PerspectiveCamera(
  camera_distance, //FOV
  container.clientWidth / container.clientHeight, //aspect ratio
  0.1,
  1000,
)
var orthographic_camera = new THREE.OrthographicCamera(
  camera_distance / -2,
  camera_distance / 2,
  camera_distance / 2,
  camera_distance / -2,
  1,
  1000,
)
var camera = perspective_camera

// init the orbit controls
var controls = new OrbitControls(camera, renderer.domElement)
controls.update()
controls.autoRotate = true
controls.autoRotateSpeed = 0
controls.enablePan = false
controls.enableDamping = true
camera.position.set(25, 25, 25)

// initialize the axes
var axesHelper = new THREE.AxesHelper(container.clientHeight)
scene.add(axesHelper)

// add light to the  system
const lights = AddLight()
for (let i = 0; i < lights.length; i++) {
  scene.add(lights[i])
}

let Checked = document.getElementById('ToggleCamera')
Checked.addEventListener('click', function () {
  console.log('Clicked camera toggle')
  if (Checked.checked) {
    camera = orthographic_camera
    controls = new OrbitControls(camera, renderer.domElement)
  } else {
    camera = perspective_camera
    controls = new OrbitControls(camera, renderer.domElement)
  }
  controls.update()
  controls.autoRotate = true
  controls.autoRotateSpeed = 0
  controls.enablePan = false
  controls.enableDamping = true
  camera.position.set(25, 25, 25)
})

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

let action = ''

// create a list of atoms in scene
var atomList = []

var SelectAtomList = []
var BoundaryAtomList = []
var HullMeshList = []

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
  atomList.push(currentAtomList[i])
  scene.add(currentAtomList[i])
}

// var torotateatomlist = new THREE.Object3D()
// for (let i = 0; i < atomList.length; i++) {
//   torotateatomlist.add(atomList[i])
// }
// scene.add(torotateatomlist)

var axis = new THREE.Vector3(1, 0, 0)
var radians = Math.PI / 180

const Slider = document.getElementById('Slider')
const sliderval = document.getElementById('sliderval')
sliderval.innerHTML = Slider.valueAsNumber

Slider.oninput = function () {
  sliderval.innerHTML = Slider.valueAsNumber
  radians = (Slider.valueAsNumber / 180) * Math.PI

  //   scene.remove(torotateatomlist)
  //   torotateatomlist = new THREE.Object3D()

  //   for (let i = 0; i < atomList.length; i++) {
  //     torotateatomlist.add(atomList[i])
  //   }
  if (SelectAtomList.length == 2) {
    var pos1 = SelectAtomList[0].position
    var pos2 = SelectAtomList[1].position
    axis.subVectors(pos1, pos2)
  }
  for (let i = 0; i < atomList.length; i++) {
    var refpos = referenceAtomList[i].position.clone()
    var finalpos = refpos.applyAxisAngle(axis.normalize(), radians)
    atomList[i].position.set(finalpos.x, finalpos.y, finalpos.z)
  }
  //   scene.add(torotateatomlist)
  //   torotateatomlist.rotateOnWorldAxis(axis.normalize(), radians)
}

var referenceAtomList = []
function createReferenceAtoms(currentAtomList) {
  referenceAtomList = []
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

  for (let i = 0; i < atomList.length; i++) {
    scene.remove(atomList[i])
  }
  for (let i = 0; i < referenceAtomList.length; i++) {
    scene.remove(referenceAtomList[i])
  }
  atomList = []
  referenceAtomList = []
  currentAtomList = createLattice(LatticeList.indexOf(currentLattice))

  for (let i = 0; i < currentAtomList.length; i++) {
    atomList.push(currentAtomList[i])
    scene.add(atomList[i])
  }

  createReferenceAtoms(currentAtomList)
})

let toggleselectbutton = document.getElementById('ToggleSelect')
toggleselectbutton.addEventListener('click', function () {
  if (action != 'selectAtom') {
    action = 'selectAtom'
  } else {
    action = ''
    // SelectAtomList = []
  }
})
const ClearStuff = document.getElementById('ClearSelection')
ClearStuff.addEventListener('click', function () {
  SelectAtomList = []
  for (let i = 0; i < HullList.length; i++) {
    scene.remove(HullList[i])
  }
  HullList = []
  //add vector removal here
})

const rSlider = document.getElementById('radiiSlider')
const rsliderval = document.getElementById('radiisliderval')
rsliderval.innerHTML = rSlider.valueAsNumber
var rcurrentradii = rSlider.valueAsNumber

rSlider.oninput = function () {
  rcurrentradii = rSlider.valueAsNumber
  rsliderval.innerHTML = rSlider.valueAsNumber
  var refnewatomlist = []

  for (let i = 0; i < referenceAtomList.length; i++) {
    var pos = referenceAtomList[i].position
    let atom = addSphereAtCoordinate(pos, 'Y', 'dummy')
    scene.remove(referenceAtomList[i])
    scene.add(atom)
    refnewatomlist.push(atom)
  }
  referenceAtomList = refnewatomlist

  var newatomlist = []
  for (let i = 0; i < atomList.length; i++) {
    var pos = atomList[i].position
    let atom = addSphereAtCoordinate(pos, 'Y')
    scene.remove(atomList[i])
    scene.add(atom)
    newatomlist.push(atom)
  }
  atomList = newatomlist

  //   scene.remove(torotateatomlist)

  SelectAtomList = []
}

// respond to check selected lattice

const PointSymmetryElement = document.getElementById('PointSymmetry')
PointSymmetryElement.addEventListener('click', function () {
  let out = PointSymmetry(
    LatticeList.indexOf(currentLattice),
    SelectAtomList,
    atomList,
  )
})

const PlaneSymmetryElement = document.getElementById('PlaneSymmetry')
PlaneSymmetryElement.addEventListener('click', function () {
  let out = PlaneSymmetry(
    LatticeList.indexOf(currentLattice),
    SelectAtomList,
    atomList,
  )
})
// const PerformAction = document.getElementById('PerformAction')
// PerformAction.addEventListener('click', function () {
//   let out = performaction(
//     LatticeList.indexOf(currentLattice),
//     SelectAtomList,
//     atomList,
//   )
// })

var rotation_symmetry_count = 0
var planar_symmetry_count = 0
var point_symmetry_count = 0

let lbl = document.getElementById('symmetry-result')
lbl.innerText = rotation_symmetry_count
  .toString()
  .concat(' out of 6 axis of symmetries found')

let lbl_plane = document.getElementById('symmetry-result-plane')
lbl_plane.innerText = planar_symmetry_count
  .toString()
  .concat(' out of 3 planes of symmetries found')

let lbl_point = document.getElementById('symmetry-result-point')
lbl_point.innerText = point_symmetry_count
  .toString()
  .concat(' out of 1 point of symmetries found')

const checksymmetry = document.getElementById('CheckSymmetry')
checksymmetry.addEventListener('click', function () {
  var degree = Slider.valueAsNumber
  let out = CheckSymmetry(
    LatticeList.indexOf(currentLattice),
    SelectAtomList,
    referenceAtomList,
    atomList,
    degree,
  )
  let lbl = document.getElementById('symmetry-result')

  if (out) {
    rotation_symmetry_count = rotation_symmetry_count + 1
    if (rotation_symmetry_count > 6) {
      rotation_symmetry_count = 6
    }
    lbl.innerText = rotation_symmetry_count
      .toString()
      .concat(' out of 6 axis of symmetries found')
    SelectAtomList = []
  } else {
    alert('incorrect')
  }
  //SelectAtomList = []
})

// make the window responsive
window.addEventListener('resize', () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  camera.aspect = container.offsetWidth / container.offsetHeight
  camera.updateProjectionMatrix()
})

document.addEventListener('mouseup', function (event) {
  if (drag == false) {
    // if the action is add atom
    if (action == 'addAtom') {
      var newSphere = addSphere(mouse, atomtype, camera, scene)
      scene.add(newSphere)
      atomList.push(newSphere)
    } else if (action == 'selectAtom') {
      INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
      if (INTERSECTED) {
        if (SelectAtomList.includes(INTERSECTED)) {
          var indexofatom = SelectAtomList.indexOf(INTERSECTED)
          SelectAtomList.splice(indexofatom, 1)
        } else {
          SelectAtomList.push(INTERSECTED)
        }
      }
    } else if (action == 'selectAll') {
      SelectAtomList = []
      for (let i = 0; i < atomList.length; i++) {
        SelectAtomList.push(atomList[i])
      }
    }
  }
})
//delete atom
document.addEventListener('keydown', function (event) {
  var keyCode = event.key
  if (keyCode == 'd') {
    // DeleteObject(mouse, camera, scene, atomList, SelectAtomList, INTERSECTED)
    INTERSECTED = CheckHover(mouse, camera, atomList)
    if (INTERSECTED) {
      var index = atomList.indexOf(INTERSECTED)
      if (index > -1) {
        atomList.splice(index, 1)
      }
      var index = SelectAtomList.indexOf(INTERSECTED)
      if (index > -1) {
        SelectAtomList.splice(index, 1)
      }
      scene.remove(INTERSECTED)
    }
  }
})

// function testing_rotation() {
//   for (let i = 0; i < atomList; i++) {
//     ax = new THREE.Vector3(1, 0, 0)

//     atomList[i].position.applyAxisAngle(ax, Math.PI)
//   }
// }
// var v = new THREE.Vector3(0, 0, 1)
// var ax = new THREE.Vector3(1, 0, 0)
// console.log(v)
// v.applyAxisAngle(ax, Math.PI)
// // testing_rotation()
// console.log(v)
// render the scene and animate
var render = function () {
  highlightSelectList(SelectAtomList, atomList)
  INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
  requestAnimationFrame(render)
  controls.update()
  renderer.render(scene, camera)
}

render()
