import * as THREE from './three.js'
import { ConvexGeometry } from './convex.js'
import { ConvexHull } from './hull.js'

var trueTypeOf = (obj) =>
  Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()

var radius_scale = 1 / 100
var atomDetails = {
  X: {
    radius: 60,
    color: '#5D3FD3',
  },
  Y: {
    radius: 60,
    color: '#a9a9a9',
  },
  Z: {
    radius: 100,
    color: '#5D3FD3',
  },
  Zn: {
    radius: 135,
    color: '#a9a9a9',
  },
  Cl: {
    radius: 100,
    color: '#cfe942',
  },
  Cs: {
    radius: 260,
    color: '#ffd700',
  },
  S: {
    radius: 100,
    color: '#ffff00',
  },
  Na: {
    radius: 180,
    color: '#fcfcfc',
  },
  C: {
    radius: 70,
    color: '#8fce00',
  },
}

export function addSphere(mouse, atomname, camera, scene) {
  var intersectionPoint = new THREE.Vector3()
  var planeNormal = new THREE.Vector3()
  var plane = new THREE.Plane()
  var raycaster = new THREE.Raycaster()
  planeNormal.copy(camera.position).normalize()
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position)
  raycaster.setFromCamera(mouse, camera)
  raycaster.ray.intersectPlane(plane, intersectionPoint)
  // console.log(atomDetails[atomname]);
  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(
      atomDetails[atomname].radius * radius_scale,
      20,
      20,
    ),
    new THREE.MeshStandardMaterial({
      color: atomDetails[atomname].color,
      name: 'sphere',
      roughness: 5,
    }),
  )
  sphereMesh.position.copy(intersectionPoint)
  // sphereMesh.material.emissive.setHex(0xff44ff);
  return sphereMesh
}

export function addSphereAtCoordinate(AddVec, atomname, atomtype = 'default') {
  var atomcolor = atomDetails[atomname].color
  var atomopacity = 1.0
  if (atomtype == 'dummy') {
    atomcolor = 0x746c70
    atomopacity = 0.3
  }
  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(
      atomDetails[atomname].radius * radius_scale,
      20,
      20,
    ),
    new THREE.MeshStandardMaterial({
      color: atomcolor,
      name: 'sphere',
      roughness: 5,
      transparent: true,
      opacity: atomopacity,
    }),
  )
  sphereMesh.position.copy(AddVec)
  return sphereMesh
}

export function CheckHover(mouse, camera, atomList, INTERSECTED) {
  var raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(atomList, false)
  var pink = 0xffffff
  var blue = 0x00ffff
  var black = 0x000000
  if (intersects.length > 0) {
    if (INTERSECTED != intersects[0].object) {
      if (INTERSECTED) {
        INTERSECTED.material.emissive.setHex(black)
      }

      INTERSECTED = intersects[0].object
      INTERSECTED.currentHex = blue
      INTERSECTED.material.emissive.setHex(pink)
    }
    INTERSECTED.material.emissive.setHex(pink)
  } else {
    if (INTERSECTED) INTERSECTED.material.emissive.setHex(black)
    INTERSECTED = null
  }
  return INTERSECTED
}

export function DeleteObject(mouse, camera, scene, atomList, INTERSECTED) {
  INTERSECTED = CheckHover(mouse, camera, atomList, INTERSECTED)
  scene.remove(INTERSECTED)
  // atomList.remove(INTERSECTED);
  const index = atomList.indexOf(INTERSECTED)
  if (index > -1) {
    atomList.splice(index, 1)
  }
}

export function AddLight() {
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(100, 100, 50)
  light.castShadow = true
  const light2 = new THREE.DirectionalLight(0xffffff, 1)
  light2.position.set(-100, 100, -50)
  light2.castShadow = true
  const light3 = new THREE.DirectionalLight(0xffffff, 1)
  light3.position.set(0, 100, 0)
  light3.castShadow = true

  return [light, light2, light3]
}

export function RepeatPattern(SelectAtomList, repeatVec) {
  var newAtoms = []
  for (let i = 0; i < SelectAtomList.length; i++) {
    var curAtom = SelectAtomList[i]
    var newpos = curAtom.position.clone()
    // var translateVec = new THREE.Vector3(1, 1, 1);
    // console.log("SIII");
    // console.log(curAtom);
    newpos.add(repeatVec)
    var sphereMesh = curAtom.clone()
    console.log(sphereMesh)

    sphereMesh.position.copy(newpos)
    newAtoms.push(sphereMesh)
  }
  return newAtoms
}

export function TranslatePattern(SelectAtomList, translateVec, count) {
  var allNewAtoms = []
  while (--count) {
    var newAtoms = []
    for (let i = 0; i < SelectAtomList.length; i++) {
      var curAtom = SelectAtomList[i]
      var newpos = curAtom.position.clone()
      // var translateVec = new THREE.Vector3(1, 1, 1);
      translateVec.multiplyScalar(count)
      newpos.add(translateVec)

      var sphereMesh = curAtom.clone()

      sphereMesh.position.copy(newpos)
      newAtoms.push(sphereMesh)
      translateVec.multiplyScalar(1 / count)
    }
    for (let i = 0; i < newAtoms.length; i++) {
      allNewAtoms.push(newAtoms[i])
    }
  }
  return allNewAtoms
}

export function updateButtonCSS(action) {
  // if (action == "addAtom") {
  //     document.getElementById("AddAtom").style =
  //         "background-color:  #f14668; color: #000000 ";
  //     document.getElementById("SelectAtom").style =
  //         "color:  #f14668; background: transparent; outline: 1px solid  #f14668; border: 0px;padding: 5px 10px;cursor: pointer;";
  // } else if (action == "selectAtom") {
  //     document.getElementById("SelectAtom").style =
  //         "background-color:  #f14668; ; color: #000000 ";
  //     document.getElementById("AddAtom").style =
  //         "color:  #f14668; ;background: transparent; outline: 1px solid  #f14668; ;border: 0px;padding: 5px 10px;cursor: pointer;";
  // } else {
  //     document.getElementById("AddAtom").style =
  //         "color:  #f14668;background: transparent; outline: 1px solid  #f14668; border: 0px;padding: 5px 10px;cursor: pointer;";
  //     document.getElementById("SelectAtom").style =
  //         "color:  #f14668; background: transparent; outline: 1px solid  #f14668; border: 0px;padding: 5px 10px;cursor: pointer;";
  // }
}
function containsObject(obj, list) {
  var i
  for (i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return true
    }
  }
  return false
}
export function highlightSelectList(SelectAtomList, atomList) {
  for (let j = 0; j < atomList.length; j++) {
    var atom = atomList[j]
    var pink = 0xffffff
    var blue = 0x00ffff
    var black = 0x000000
    if (containsObject(atom, SelectAtomList)) {
      var a = atom.material.emissive.getHex()
      // atom.currentHex = blue;
      atom.material.emissive.setHex(pink)
    } else {
      // var a = atom.material.emissive.getHex();
      // atom.currentHex = blue;
      atom.material.emissive.setHex(black)
    }
  }
}

export function moveSelectList(SelectAtomList, moveVector) {
  for (let i = 0; i < SelectAtomList.length; i++) {
    var currpos = SelectAtomList[i].position.clone()
    //if(i==0) console.log(currpos.y);
    currpos.add(moveVector)
    //if(i==0) console.log(currpos.y);
    SelectAtomList[i].position.copy(currpos)
  }
}

export function checkSCP(SelectAtomList) {
  if (SelectAtomList.length != 8) return false
  for (let i = 0; i < SelectAtomList.length - 1; i++) {
    for (let j = i + 1; j < SelectAtomList.length; j++) {
      var dist = SelectAtomList[i].position.distanceToSquared(
        SelectAtomList[j].position,
      )
      if (dist == 4 || dist == 8 || dist == 12) continue
      else return false
    }
  }
  return true
}

export function select_Region(SelectAtomList, atomList) {
  let posarray = []
  var pos = new THREE.Vector3()
  for (let i = 0; i < SelectAtomList.length; i++) {
    pos = SelectAtomList[i].position.clone()
    posarray.push(pos)
  }
  let selectarray = []
  var convexHull = new ConvexHull().setFromPoints(posarray)
  for (let i = 0; i < atomList.length; i++) {
    pos = atomList[i].position.clone()
    if (convexHull.containsPoint(pos)) {
      selectarray.push(atomList[i])
    }
  }
  const geometry = new ConvexGeometry(posarray)
  const material = new THREE.MeshStandardMaterial({
    color: 0xff44ff,
    roughness: 5,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geometry, material)
  return { mesh, selectarray }
}
const LatticeList = [
  'Simple Cubic',
  'Face Centered Cubic',
  'Body Centered Cubic',
  'Hexagonal Packing',
]
let LatticeIndex = 0

export function changeCurrentLatticeNext() {
  //   console.log('clicked')
  let lbl = document.getElementById('current-lattice')

  LatticeIndex += 1
  if (LatticeIndex == LatticeList.length) {
    LatticeIndex = 0
  }
  lbl.innerText = LatticeList[LatticeIndex] // TREATS EVERY CONTENT AS TEXT.
  return LatticeIndex
}
export function changeCurrentLatticePrev() {
  //   console.log('clicked')
  let lbl = document.getElementById('current-lattice')

  LatticeIndex -= 1
  if (LatticeIndex == -1) {
    LatticeIndex = LatticeList.length - 1
  }
  lbl.innerText = LatticeList[LatticeIndex] // TREATS EVERY CONTENT AS TEXT.
  return LatticeIndex
}

export function createLattice(latticeID) {
  let atomlist = []
  if (latticeID == 0) {
    console.log('simple cubic')
    let latticedims = [6, 6, 6]
    for (let x = -4; x < latticedims[0]; x += 2) {
      for (let y = -4; y < latticedims[1]; y += 2) {
        for (let z = -4; z < latticedims[2]; z += 2) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'X')
          atomlist.push(atom)
        }
      }
    }
  } else if (latticeID == 1) {
    console.log('adding face centered cubic')
    let latticedims = [9, 9, 9]
    for (let x = 0; x < latticedims[0]; x += 3) {
      for (let y = 0; y < latticedims[1]; y += 3) {
        for (let z = 0; z < latticedims[2]; z += 3) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'X')
          atomlist.push(atom)
        }
      }
    }
    for (let x = 1.5; x < latticedims[0]; x += 3) {
      for (let y = 1.5; y < latticedims[1]; y += 3) {
        for (let z = 0; z < latticedims[2]; z += 3) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'X')
          atomlist.push(atom)
        }
      }
    }
    for (let x = 1.5; x < latticedims[0]; x += 3) {
      for (let y = 0; y < latticedims[1]; y += 3) {
        for (let z = 1.5; z < latticedims[2]; z += 3) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'X')
          atomlist.push(atom)
        }
      }
    }
    for (let x = 0; x < latticedims[0]; x += 3) {
      for (let y = 1.5; y < latticedims[1]; y += 3) {
        for (let z = 1.5; z < latticedims[2]; z += 3) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'X')
          atomlist.push(atom)
        }
      }
    }
  } else if (latticeID == 2) {
    console.log('adding body centered cubic')
    let latticedims = [8, 8, 8]
    for (let x = 0; x < latticedims[0]; x += 4) {
      for (let y = 0; y < latticedims[1]; y += 4) {
        for (let z = 0; z < latticedims[2]; z += 4) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'Y')
          atomlist.push(atom)
        }
      }
    }
    for (let x = 2; x < latticedims[0]; x += 4) {
      for (let y = 2; y < latticedims[1]; y += 4) {
        for (let z = 2; z < latticedims[2]; z += 4) {
          let pos = new THREE.Vector3(x, y, z)
          let atom = addSphereAtCoordinate(pos, 'Y')
          atomlist.push(atom)
        }
      }
    }
  } else if (latticeID == 3) {
    console.log('adding HCP')
    let latticedims = [9, 9, 9]
    let height = 0
    for (let z = 0; z < latticedims[2]; z += 1.732) {
      if (height % 2 == 0) {
        for (let x = 0; x < latticedims[0]; x += 2) {
          let row = 0
          for (let y = 0; y < latticedims[1]; y += 1.732) {
            let pos
            if (row % 2 == 0) {
              pos = new THREE.Vector3(x, y, z)
            } else {
              pos = new THREE.Vector3(x + 1, y, z)
            }
            row += 1
            let atom = addSphereAtCoordinate(pos, 'X')
            atomlist.push(atom)
          }
        }
      } else {
        for (let x = 1; x < latticedims[0]; x += 2) {
          let row = 0
          for (let y = 0.577; y < latticedims[1]; y += 1.732) {
            let pos
            if (row % 2 == 0) {
              pos = new THREE.Vector3(x, y, z)
            } else {
              pos = new THREE.Vector3(x + 1, y, z)
            }
            row += 1
            let atom = addSphereAtCoordinate(pos, 'X')
            atomlist.push(atom)
          }
        }
      }
      height += 1
    }
  }
  return atomlist
}
export function distancesum(l) {
  let sum = 0
  for (let i = 0; i < l.length; i++) {
    for (let j = 0; j < l.length; j++) {
      let pos1 = l[i].position
      let pos2 = l[j].position
      let d = pos1.distanceTo(pos2)
      sum += d
    }
  }
  console.log(sum, l)
  return sum
}
export function latticeChecker(latticeID, SelectAtomList) {
  if (latticeID == 0) {
    if (SelectAtomList.length != 4) return 0
    else {
      if (Math.abs(distancesum(SelectAtomList) - 27.3) < 1) return 1
      else return 0
    }
  }
  if (latticeID == 1) {
    if (SelectAtomList.length != 8) return 0
    else {
      if (Math.abs(distancesum(SelectAtomList) - 143.59) < 1) return 1
      else return 0
    }
  }
  if (latticeID == 2) {
    if (SelectAtomList.length != 14) return 0
    else {
      if (Math.abs(distancesum(SelectAtomList) - 562.49) < 1) return 1
      else return 0
    }
  }
  if (latticeID == 3) {
    if (SelectAtomList.length != 9) return 0
    else {
      if (Math.abs(distancesum(SelectAtomList) - 342.61) < 1) return 1
      else return 0
    }
  }
  if (latticeID == 4) {
    if (SelectAtomList.length != 17) return 0
    else {
      if (Math.abs(distancesum(SelectAtomList) - 889.19) < 1) return 1
      else return 0
    }
  }
}

// export function performaction(latticeID, SelectAtomList, atomList) {
//   if (latticeID == 0) {
//     console.log('performing action for ', LatticeList[latticeID])
//     if (SelectAtomList.length == 1) {
//       var cenpos = SelectAtomList[0].position.clone()
//       for (let i = 0; i < atomList.length; i++) {
//         var currpos = atomList[i].position.clone()
//         let x = 2 * cenpos.x - currpos.x
//         let y = 2 * cenpos.y - currpos.y
//         let z = 2 * cenpos.z - currpos.z
//         atomList[i].position.set(x, y, z)
//       }
//     } else if (SelectAtomList.length == 2) {
//       var el = document.getElementById('Slider')
//       var an = el.valueAsNumber
//       var angle = parseFloat(an)
//       var pos1 = SelectAtomList[0].position.clone()
//       var pos2 = SelectAtomList[1].position.clone()
//     } else if (SelectAtomList.length == 3) {
//       var pos1 = SelectAtomList[0].position.clone()
//       var pos2 = SelectAtomList[1].position.clone()
//       var pos3 = SelectAtomList[2].position.clone()
//       let a1 = pos2.x - pos1.x
//       let b1 = pos2.y - pos1.y
//       let c1 = pos2.z - pos1.z
//       let a2 = pos3.x - pos1.x
//       let b2 = pos3.y - pos1.y
//       let c2 = pos3.z - pos1.z
//       let a = b1 * c2 - b2 * c1
//       let b = a2 * c1 - a1 * c2
//       let c = a1 * b2 - b1 * a2
//       let d = -a * pos1.x - b * pos1.y - c * pos1.z
//       for (let i = 0; i < atomList.length; i++) {
//         let x = atomList[i].position.clone().x
//         let y = atomList[i].position.clone().y
//         let z = atomList[i].position.clone().z
//         let t = -2 * ((a * x + b * y + c * z + d) / (a * a + b * b + c * c))
//         atomList[i].position.set(x + t * a, y + t * b, z + t * c)
//       }
//     } else {
//       console.log('incorrect number of atoms!')
//     }
//   }
//   if (latticeID == 1) {
//     console.log('performing action for ', LatticeList[latticeID])
//     if (SelectAtomList.length == 1) {
//       var cenpos = SelectAtomList[0].position.clone()
//       for (let i = 0; i < atomList.length; i++) {
//         var currpos = atomList[i].position.clone()
//         let x = 2 * cenpos.x - currpos.x
//         let y = 2 * cenpos.y - currpos.y
//         let z = 2 * cenpos.z - currpos.z
//         atomList[i].position.set(x, y, z)
//       }
//     } else if (SelectAtomList.length == 2) {
//       var el = document.getElementById('Slider')
//       var an = el.valueAsNumber
//       var angle = parseFloat(an)
//       var pos1 = SelectAtomList[0].position.clone()
//       var pos2 = SelectAtomList[1].position.clone()
//     } else if (SelectAtomList.length == 3) {
//       var pos1 = SelectAtomList[0].position.clone()
//       var pos2 = SelectAtomList[1].position.clone()
//       var pos3 = SelectAtomList[2].position.clone()
//       let a1 = pos2.x - pos1.x
//       let b1 = pos2.y - pos1.y
//       let c1 = pos2.z - pos1.z
//       let a2 = pos3.x - pos1.x
//       let b2 = pos3.y - pos1.y
//       let c2 = pos3.z - pos1.z
//       let a = b1 * c2 - b2 * c1
//       let b = a2 * c1 - a1 * c2
//       let c = a1 * b2 - b1 * a2
//       let d = -a * pos1.x - b * pos1.y - c * pos1.z
//       for (let i = 0; i < atomList.length; i++) {
//         let x = atomList[i].position.clone().x
//         let y = atomList[i].position.clone().y
//         let z = atomList[i].position.clone().z
//         let t = -2 * ((a * x + b * y + c * z + d) / (a * a + b * b + c * c))
//         atomList[i].position.set(x + t * a, y + t * b, z + t * c)
//       }
//     } else {
//       console.log('incorrect number of atoms!')
//     }
//   }
//   if (latticeID == 2) {
//     console.log('performing action for ', LatticeList[latticeID])
//     if (SelectAtomList.length == 1) {
//       var cenpos = SelectAtomList[0].position.clone()
//       for (let i = 0; i < atomList.length; i++) {
//         var currpos = atomList[i].position.clone()
//         let x = 2 * cenpos.x - currpos.x
//         let y = 2 * cenpos.y - currpos.y
//         let z = 2 * cenpos.z - currpos.z
//         atomList[i].position.set(x, y, z)
//       }
//     } else if (SelectAtomList.length == 2) {
//       var el = document.getElementById('Slider')
//       var an = el.valueAsNumber
//       var angle = parseFloat(an)
//       var pos1 = SelectAtomList[0].position.clone()
//       var pos2 = SelectAtomList[1].position.clone()
//     } else if (SelectAtomList.length == 3) {
//       var pos1 = SelectAtomList[0].position.clone()
//       var pos2 = SelectAtomList[1].position.clone()
//       var pos3 = SelectAtomList[2].position.clone()
//       let a1 = pos2.x - pos1.x
//       let b1 = pos2.y - pos1.y
//       let c1 = pos2.z - pos1.z
//       let a2 = pos3.x - pos1.x
//       let b2 = pos3.y - pos1.y
//       let c2 = pos3.z - pos1.z
//       let a = b1 * c2 - b2 * c1
//       let b = a2 * c1 - a1 * c2
//       let c = a1 * b2 - b1 * a2
//       let d = -a * pos1.x - b * pos1.y - c * pos1.z
//       for (let i = 0; i < atomList.length; i++) {
//         let x = atomList[i].position.clone().x
//         let y = atomList[i].position.clone().y
//         let z = atomList[i].position.clone().z
//         let t = -2 * ((a * x + b * y + c * z + d) / (a * a + b * b + c * c))
//         atomList[i].position.set(x + t * a, y + t * b, z + t * c)
//       }
//     } else {
//       console.log('incorrect number of atoms!')
//     }
//   }
//   if (latticeID == 3) {
//     console.log('performing action for ', LatticeList[latticeID])
//     if (SelectAtomList.length == 1) {
//       var cenpos = SelectAtomList[0].position.clone()
//       for (let i = 0; i < atomList.length; i++) {
//         var currpos = atomList[i].position.clone()
//         let x = 2 * cenpos.x - currpos.x
//         let y = 2 * cenpos.y - currpos.y
//         let z = 2 * cenpos.z - currpos.z
//         atomList[i].position.set(x, y, z)
//       }
//     } else if (SelectAtomList.length == 2) {
//       var el = document.getElementById('Slider')
//       var an = el.valueAsNumber
//       var angle = parseFloat(an)
//       var pos1 = SelectAtomList[0].position.clone()
//       var pos2 = SelectAtomList[1].position.clone()
//     } else if (SelectAtomList.length == 3) {
//       var pos1 = SelectAtomList[0].position.clone()
//       var pos2 = SelectAtomList[1].position.clone()
//       var pos3 = SelectAtomList[2].position.clone()
//       let a1 = pos2.x - pos1.x
//       let b1 = pos2.y - pos1.y
//       let c1 = pos2.z - pos1.z
//       let a2 = pos3.x - pos1.x
//       let b2 = pos3.y - pos1.y
//       let c2 = pos3.z - pos1.z
//       let a = b1 * c2 - b2 * c1
//       let b = a2 * c1 - a1 * c2
//       let c = a1 * b2 - b1 * a2
//       let d = -a * pos1.x - b * pos1.y - c * pos1.z
//       for (let i = 0; i < atomList.length; i++) {
//         let x = atomList[i].position.clone().x
//         let y = atomList[i].position.clone().y
//         let z = atomList[i].position.clone().z
//         let t = -2 * ((a * x + b * y + c * z + d) / (a * a + b * b + c * c))
//         atomList[i].position.set(x + t * a, y + t * b, z + t * c)
//       }
//     } else {
//       console.log('incorrect number of atoms!')
//     }
//   }
// }

export function PointSymmetry(latticeID, SelectAtomList, atomList) {
  if (latticeID == 0) {
    console.log('performing action for ', LatticeList[latticeID])
    if (SelectAtomList.length == 1) {
      var cenpos = SelectAtomList[0].position.clone()
      for (let i = 0; i < atomList.length; i++) {
        var currpos = atomList[i].position.clone()
        let x = 2 * cenpos.x - currpos.x
        let y = 2 * cenpos.y - currpos.y
        let z = 2 * cenpos.z - currpos.z
        atomList[i].position.set(x, y, z)
      }
    } else {
      alert('incorrect number of atoms!')
    }
  }
  if (latticeID == 1) {
    console.log('performing action for ', LatticeList[latticeID])
    if (SelectAtomList.length == 1) {
      var cenpos = SelectAtomList[0].position.clone()
      for (let i = 0; i < atomList.length; i++) {
        var currpos = atomList[i].position.clone()
        let x = 2 * cenpos.x - currpos.x
        let y = 2 * cenpos.y - currpos.y
        let z = 2 * cenpos.z - currpos.z
        atomList[i].position.set(x, y, z)
      }
    } else {
      alert('incorrect number of atoms!')
    }
  }
  if (latticeID == 2) {
    console.log('performing action for ', LatticeList[latticeID])
    if (SelectAtomList.length == 1) {
      var cenpos = SelectAtomList[0].position.clone()
      for (let i = 0; i < atomList.length; i++) {
        var currpos = atomList[i].position.clone()
        let x = 2 * cenpos.x - currpos.x
        let y = 2 * cenpos.y - currpos.y
        let z = 2 * cenpos.z - currpos.z
        atomList[i].position.set(x, y, z)
      }
    } else {
      alert('incorrect number of atoms!')
    }
  }
  if (latticeID == 3) {
    console.log('performing action for ', LatticeList[latticeID])
    if (SelectAtomList.length == 1) {
      var cenpos = SelectAtomList[0].position.clone()
      for (let i = 0; i < atomList.length; i++) {
        var currpos = atomList[i].position.clone()
        let x = 2 * cenpos.x - currpos.x
        let y = 2 * cenpos.y - currpos.y
        let z = 2 * cenpos.z - currpos.z
        atomList[i].position.set(x, y, z)
      }
    } else {
      alert('incorrect number of atoms!')
    }
  }
}

export function PlaneSymmetry(latticeID, SelectAtomList, atomList) {
  if (latticeID == 0) {
    console.log('performing action for ', LatticeList[latticeID])
    if (SelectAtomList.length == 3) {
      var pos1 = SelectAtomList[0].position.clone()
      var pos2 = SelectAtomList[1].position.clone()
      var pos3 = SelectAtomList[2].position.clone()
      let a1 = pos2.x - pos1.x
      let b1 = pos2.y - pos1.y
      let c1 = pos2.z - pos1.z
      let a2 = pos3.x - pos1.x
      let b2 = pos3.y - pos1.y
      let c2 = pos3.z - pos1.z
      let a = b1 * c2 - b2 * c1
      let b = a2 * c1 - a1 * c2
      let c = a1 * b2 - b1 * a2
      let d = -a * pos1.x - b * pos1.y - c * pos1.z
      for (let i = 0; i < atomList.length; i++) {
        let x = atomList[i].position.clone().x
        let y = atomList[i].position.clone().y
        let z = atomList[i].position.clone().z
        let t = -2 * ((a * x + b * y + c * z + d) / (a * a + b * b + c * c))
        atomList[i].position.set(x + t * a, y + t * b, z + t * c)
      }
    } else {
      alert('incorrect number of atoms!')
    }
  }
  if (latticeID == 1) {
    console.log('performing action for ', LatticeList[latticeID])
    if (SelectAtomList.length == 3) {
      var pos1 = SelectAtomList[0].position.clone()
      var pos2 = SelectAtomList[1].position.clone()
      var pos3 = SelectAtomList[2].position.clone()
      let a1 = pos2.x - pos1.x
      let b1 = pos2.y - pos1.y
      let c1 = pos2.z - pos1.z
      let a2 = pos3.x - pos1.x
      let b2 = pos3.y - pos1.y
      let c2 = pos3.z - pos1.z
      let a = b1 * c2 - b2 * c1
      let b = a2 * c1 - a1 * c2
      let c = a1 * b2 - b1 * a2
      let d = -a * pos1.x - b * pos1.y - c * pos1.z
      for (let i = 0; i < atomList.length; i++) {
        let x = atomList[i].position.clone().x
        let y = atomList[i].position.clone().y
        let z = atomList[i].position.clone().z
        let t = -2 * ((a * x + b * y + c * z + d) / (a * a + b * b + c * c))
        atomList[i].position.set(x + t * a, y + t * b, z + t * c)
      }
    } else {
      alert('incorrect number of atoms!')
    }
  }
  if (latticeID == 2) {
    console.log('performing action for ', LatticeList[latticeID])
    if (SelectAtomList.length == 3) {
      var pos1 = SelectAtomList[0].position.clone()
      var pos2 = SelectAtomList[1].position.clone()
      var pos3 = SelectAtomList[2].position.clone()
      let a1 = pos2.x - pos1.x
      let b1 = pos2.y - pos1.y
      let c1 = pos2.z - pos1.z
      let a2 = pos3.x - pos1.x
      let b2 = pos3.y - pos1.y
      let c2 = pos3.z - pos1.z
      let a = b1 * c2 - b2 * c1
      let b = a2 * c1 - a1 * c2
      let c = a1 * b2 - b1 * a2
      let d = -a * pos1.x - b * pos1.y - c * pos1.z
      for (let i = 0; i < atomList.length; i++) {
        let x = atomList[i].position.clone().x
        let y = atomList[i].position.clone().y
        let z = atomList[i].position.clone().z
        let t = -2 * ((a * x + b * y + c * z + d) / (a * a + b * b + c * c))
        atomList[i].position.set(x + t * a, y + t * b, z + t * c)
      }
    } else {
      alert('incorrect number of atoms!')
    }
  }
  if (latticeID == 3) {
    console.log('performing action for ', LatticeList[latticeID])
    if (SelectAtomList.length == 3) {
      var pos1 = SelectAtomList[0].position.clone()
      var pos2 = SelectAtomList[1].position.clone()
      var pos3 = SelectAtomList[2].position.clone()
      let a1 = pos2.x - pos1.x
      let b1 = pos2.y - pos1.y
      let c1 = pos2.z - pos1.z
      let a2 = pos3.x - pos1.x
      let b2 = pos3.y - pos1.y
      let c2 = pos3.z - pos1.z
      let a = b1 * c2 - b2 * c1
      let b = a2 * c1 - a1 * c2
      let c = a1 * b2 - b1 * a2
      let d = -a * pos1.x - b * pos1.y - c * pos1.z
      for (let i = 0; i < atomList.length; i++) {
        let x = atomList[i].position.clone().x
        let y = atomList[i].position.clone().y
        let z = atomList[i].position.clone().z
        let t = -2 * ((a * x + b * y + c * z + d) / (a * a + b * b + c * c))
        atomList[i].position.set(x + t * a, y + t * b, z + t * c)
      }
    } else {
      alert('incorrect number of atoms!')
    }
  }
}
export function CheckSymmetry(latticeID, SelectAtomList, atomList, degree) {
  return 0
}
