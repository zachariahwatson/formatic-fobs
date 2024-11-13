// //import { spawn } from 'child_process';
// import * as THREE from 'three'
// import * as NOISE from 'simplex-noise'
// import { STLExporter } from 'three/addons/exporters/STLExporter.js'

// // initialize the noise function
// const noise2D = NOISE.createNoise2D()
// // returns a value between -1 and 1

// const exporter = new STLExporter();
// const initVal = 5
// const params = new Map([
//     [0,{val:initVal,limit:20,state:0,default:initVal,oldVal:initVal}], //width
//     [1,{val:initVal,limit:20,state:0,default:initVal,oldVal:initVal}], //depth
//     [16,{val:0,limit:1,state:0,default:0,oldVal:0}], //height
// ])

// var c = 0

// const scene = new THREE.Scene();
// var width = window.innerWidth;
//       var height = window.innerHeight;
//       var camera = new THREE.OrthographicCamera(
//         width / -2,
//         width / 2,
//         height / 2,
//         height / -2,
//         1,
//         1000
//       );
// camera.position.set(20, 20, 20)
// camera.lookAt(scene.position)
// camera.zoom = 50
// camera.updateProjectionMatrix()

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// // const material = new THREE.MeshBasicMaterial( {
// // 	color: 0xffffff,
// // 	wireframe: true
// // } );
// var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true, shininess: 50 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

// const color = 0xFFFFFF;
// const intensity = 1;
// const light = new THREE.DirectionalLight(color, intensity);
// light.position.set(40, 30, 20);
// light.target.position.set(0, 0, 0);
// scene.add(light);
// scene.add(light.target);

// function animate() {
// 	requestAnimationFrame( animate );

// 	//cube.rotation.y +=.001;
//     c+=.001
//     let new_geometry = new THREE.BoxGeometry(checkfunc(params.get(0).val),2,checkfunc(params.get(1).val));
//     geometry.dispose();
//     cube.geometry = new_geometry;

// 	renderer.render( scene, camera );
// }

// animate();

// function onMIDISuccess(midiAccess) {
//     console.log("MIDI ready!");
//     midiAccess.inputs.forEach((entry) => {
//         console.log(entry)
//     });
// }

// function onMIDIFailure(msg) {
//     console.error('\x1b[31m%s\x1b[0m',`Failed to get MIDI access - ${msg}`);
// }

// function inputHandler(event) {
//     const id = event.data[1]
//     const val = event.data[2]
//     const param = params.get(id > 7 ? id-8:id)
//     if (id == 15) {
//         //go through params, if state is random then set the val to random
//         // params.forEach((p) => {
//         //     if (p.state == 1) {
//         //         p.val = (Math.random()*(p.limit-p.default))+p.default
//         //         console.log(p)
//         //     }
//         // })
//         exportBinary()
//     } else if (param.state == 0 && (id < 8 || id == 16)){
//         param.val = map(val,0,127,param.default,param.limit)
//     } else if (id > 7) {
//         param.state = val
//         if (param.state == 1) {
//             param.oldVal = param.val
//             let r1 = Math.random()
//             let r2 = Math.random()
//             param.val = function() {
//                 return (((noise2D(c*r1,c*r2)+1)/2)*(param.limit-param.default))+param.default
//             }
//         } else {
//             param.val = param.oldVal
//         }
//         console.log(param.state)
//     }
//     console.log(param)
// }

// function checkfunc(val,c) {
//     if (typeof val === 'function') {
//         return val()
//     }
//     return val
// }

// function map(value, start1, stop1, start2, stop2) {
//     return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
// }

// function exportBinary() {
//     let g = cube.geometry.clone()
//     let m = cube.material.clone()
//     let mesh = new THREE.Mesh(g, m)
//     console.log(mesh)
//     g.rotateX(Math.PI/2)
//     g.rotateZ(Math.PI/2)
//     const result = exporter.parse( mesh, { binary: true } );
//     saveArrayBuffer( result, 'box.stl' );

// }
// const link = document.createElement( 'a' );
// link.style.display = 'none';
// document.body.appendChild( link );

// function save( blob, filename ) {

//     link.href = URL.createObjectURL( blob );
//     link.download = filename;
//     link.click();
//     //blah()

// }

// function saveString( text, filename ) {

//     save( new Blob( [ text ], { type: 'text/plain' } ), filename );

// }

// function saveArrayBuffer( buffer, filename ) {

//     save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

// }

// // function blah() {

// //     // Replace 'your-command.exe' with the name of the .exe you want to run
// //     const command = 'prusa-slicer-console.exe';
// //     const args = ['--help-fff']; // Replace with any command-line arguments you want to pass

// //     // Spawn the child process
// //     const childProcess = spawn(command, args, { stdio: 'inherit' });

// //     // Event handlers for child process events
// //     childProcess.on('error', (err) => {
// //     console.error('\x1b[31m%s\x1b[0m',`Failed to start child process: ${err}`);
// //     });

// //     childProcess.on('close', (code) => {
// //     if (code === 0) {
// //         console.log('Child process exited successfully');
// //     } else {
// //         console.error('\x1b[31m%s\x1b[0m',`Child process exited with code ${code}`);
// //     }
// //     });
// // }

// navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
