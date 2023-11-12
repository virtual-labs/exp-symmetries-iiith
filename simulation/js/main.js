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
  RotationSymmetry,
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

var axis = new THREE.Vector3(1, 0, 0)
var radians = Math.PI / 180

var Slider = document.getElementById('Slider')
var sliderval = document.getElementById('sliderval')
sliderval.placeholder = Slider.valueAsNumber
sliderval.value = Slider.valueAsNumber

var AxisatomList = []

function SliderRotateAtoms() {
  sliderval.placeholder = Slider.valueAsNumber
  sliderval.value = Slider.valueAsNumber
  radians = (Slider.valueAsNumber / 180) * Math.PI

  if (AxisatomList.length != 0) {
    var pos1 = AxisatomList[AxisatomList.length - 1].head.position
    var pos2 = AxisatomList[AxisatomList.length - 1].tail.position
    axis.subVectors(pos1, pos2)

    var reference = pos2.clone()

    for (let i = 0; i < atomList.length; i++) {
      var refpos = new THREE.Vector3()
      refpos.subVectors(referenceAtomList[i].position, reference)

      var finalpos = refpos.applyAxisAngle(axis.normalize(), radians)
      atomList[i].position.set(finalpos.x, finalpos.y, finalpos.z)
      atomList[i].position.add(reference)
    }
    console.log('how', AxisatomList)
  }
}

Slider.oninput = function () {
  SliderRotateAtoms()
}

sliderval.oninput = function () {
  Slider.value = sliderval.value
  SliderRotateAtoms()
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
  //add vector removal here
})

const ClearObjects = document.getElementById('ClearObjects')
ClearObjects.addEventListener('click', function () {
  for (let i = 0; i < AxisArrows.length; i++) {
    scene.remove(AxisArrows[i])
  }
  AxisArrows = []
  AxisatomList = []
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
let AxisArrows = []
var VisualizeElement = document.getElementById('VisualizeSymmetry')
VisualizeElement.addEventListener('click', function () {
  if (SelectAtomList.length == 1) {
    let out = PointSymmetry(
      LatticeList.indexOf(currentLattice),
      SelectAtomList,
      atomList,
    )
  } else if (SelectAtomList.length == 2) {
    let obj = RotationSymmetry(
      LatticeList.indexOf(currentLattice),
      SelectAtomList,
      atomList,
      AxisatomList,
    )
    scene.add(obj.arrow)
    AxisArrows.push(obj.arrow)
    AxisatomList.push(obj.axisatoms)
  } else if (SelectAtomList.length == 3) {
    let out = PlaneSymmetry(
      LatticeList.indexOf(currentLattice),
      SelectAtomList,
      atomList,
    )
  }
})

// const PointSymmetryElement = document.getElementById('PointSymmetry')
// PointSymmetryElement.addEventListener('click', function () {
//let out = PlaneSymmetry(
//     LatticeList.indexOf(currentLattice),
//     SelectAtomList,
//     atomList,
//   )
// })

// const PlaneSymmetryElement = document.getElementById('PlaneSymmetry')
// PlaneSymmetryElement.addEventListener('click', function () {
//   let out = PlaneSymmetry(
//     LatticeList.indexOf(currentLattice),
//     SelectAtomList,
//     atomList,
//   )
// })
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

let lbl = document.getElementById('symmetry-result-rotate')
lbl.innerText = rotation_symmetry_count
  .toString()
  .concat(' axis of symmetries found')

let lbl_plane = document.getElementById('symmetry-result-plane')
lbl_plane.innerText = planar_symmetry_count
  .toString()
  .concat(' planes of symmetries found')

let lbl_point = document.getElementById('symmetry-result-point')
lbl_point.innerText = point_symmetry_count
  .toString()
  .concat(' 1 point of symmetries found')

let rotation_symmetry_degrees = { 90: 0, 120: 0, 180: 0 }
const checksymmetry = document.getElementById('CheckSymmetry')
checksymmetry.addEventListener('click', function () {
  var degree = Slider.valueAsNumber

  //   if (out) {
  //     let lbl = document.getElementById('symmetry-result')
  //     lbl.innerText = 'correct'
  //   }

  if (SelectAtomList.length == 1) {
    let out = CheckSymmetry(
      LatticeList.indexOf(currentLattice),
      SelectAtomList,
      referenceAtomList,
      atomList,
      degree,
      AxisatomList,
    )
    if (out) {
      let lbl = document.getElementById('symmetry-result-point')
      point_symmetry_count = point_symmetry_count + 1
      if (point_symmetry_count > 1) {
        point_symmetry_count = 1
      }
      lbl.innerText = point_symmetry_count
        .toString()
        .concat(' point of symmetries found')
      // SelectAtomList = []
    }
  }
  if (SelectAtomList.length == 2) {
    let out = CheckSymmetry(
      LatticeList.indexOf(currentLattice),
      SelectAtomList,
      referenceAtomList,
      atomList,
      degree,
      AxisatomList,
    )
    if (out) {
      let lbl = document.getElementById('symmetry-result-rotate')
      rotation_symmetry_count = rotation_symmetry_count + 1

      lbl.innerText = rotation_symmetry_count
        .toString()
        .concat(' axis of symmetries found')
    } else {
      var incorrectarrow = AxisArrows.pop()
      scene.remove(incorrectarrow)
      alert('incorrect new Axis of symmetry ')
    }
  }
  if (SelectAtomList.length == 3) {
    // let lbl = document.getElementById('symmetry-result-plane')
    // plane_symmetry_count = plane_symmetry_count + 1
    // if (plane_symmetry_count > 9) {
    //   plane_symmetry_count = 9
    // }
    // lbl.innerText = plane_symmetry_count
    //   .toString()
    //   .concat(' out of 9 planes of symmetries found')
    // SelectAtomList = []
  }
  SelectAtomList = []
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
