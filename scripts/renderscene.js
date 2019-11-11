var view;
var ctx;
var scene;

// Initialization function - called when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');
    
    // initial scene... feel free to change this
    scene = {
        
        view: {
            type: 'perspective',
            vrp: Vector3(20, 0, -30),
            vpn: Vector3(1, 0, 1),
            vup: Vector3(0, 1, 0),
            prp: Vector3(14, 20, 26),
            clip: [-20, 20, -4, 36, 1, -50]
        },
        models: [
            {
                type: 'generic',
                animation: {
                axis: "y",
                rps: 1,
                animation: {
                    axis: "y",
                    rps: 1
                    }
                },
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ]
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', OnKeyDown, false);
    
    DrawScene();
}

// Main drawing code here! Use information contained in variable `scene`
function DrawScene() {
    // clean view
    ctx.clearRect(0, 0, view.width, view.height);
    
    let arrayModelsVector = [];
    let transformation_matrix;
    let projection_matrix;
    let transAndScale = new Matrix(4,4);
    transAndScale.values = [[view.width/2,0,0,view.width/2],
                            [0,view.height/2,0,view.height/2],
                            [0,0,1,0],
                            [0,0,0,1]];
    // perspective seen                        
    var Nper = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
    var Mper = new Matrix(4, 4);
    Mper.values = [[1,0,0,0],
                   [0,1,0,0],
                   [0,0,1,0],
                   [0,0,-1,0]];                        
    // Parallel seen                        
    var Npar = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
    var Mpar = new Matrix(4, 4);
    Mpar.values = [[1,0,0,0],
                   [0,1,0,0],
                   [0,0,0,0],
                   [0,0,0,1]];                        
    
    var beforeClip = [];
    for (let j = 0; j < scene.models.length; j++) {
        beforeClip[j] = [];
        for (let k = 0; k < scene.models[j].vertices.length; k++) {
            if (scene.view.type === "perspective") {
                beforeClip[j][k] = Matrix.multiply(Nper, scene.models[j].vertices[k]);
            } 
            else if (scene.view.type === "parallel") {
                beforeClip[j][k] = Matrix.multiply(Npar, scene.models[j].vertices[k]);
            }
        }
    } // good
    
    var afterClip = [];
    for (let a = 0; a < scene.models.length; a++) {
        afterClip[a] = [];
        for (let b = 0; b < scene.models[a].edges.length; b++) {
            for (let c = 0; c < scene.models[a].edges[b].length-1; c++) {
                var clipResult = ClipLine(beforeClip[a][scene.models[a].edges[b][c]], beforeClip[a][scene.models[a].edges[b][c+1]], scene.view)
                if (clipResult !== null) {
                    afterClip[a].push(clipResult[0]);
                    afterClip[a].push(clipResult[1]);
                }
            }
        }
    }
    
    for (let d = 0; d < afterClip.length; d++) {
        for (let e = 0; e < afterClip[d].length; e++) {
            if (scene.view.type === "perspective") {
                afterClip[d][e] = Matrix.multiply(transAndScale, Mper, afterClip[d][e]);
            }
            else if (scene.view.type === "parallel") {
                afterClip[d][e] = Matrix.multiply(transAndScale, Mpar, afterClip[d][e]);
            }
            afterClip[d][e].x = afterClip[d][e].x / afterClip[d][e].w;
            afterClip[d][e].y = afterClip[d][e].y / afterClip[d][e].w;
            afterClip[d][e].z = afterClip[d][e].z / afterClip[d][e].w;
            afterClip[d][e].w = afterClip[d][e].w / afterClip[d][e].w;
        }
    }
    
    for (let f = 0; f < afterClip.length; f++) {
        for (let g = 0; g < afterClip[f].length-1; g+=2) {
            DrawLine(afterClip[f][g].x,
                     afterClip[f][g].y,
                     afterClip[f][g+1].x,
                     afterClip[f][g+1].y);
        }
    }
    
    
    
    /*
    for (let j = 0; j < scene.models.length; j++) {
        let arrayOfVectorVertex = [];
        for (let k = 0; k < scene.models[j].vertices.length; k++) {
            if (scene.view.type === "perspective") {
                //arrayOfVectorVertex[k] = Matrix.multiply(transAndScale, Mper, Nper, scene.models[j].vertices[k]);
                arrayOfVectorVertex[k] = Matrix.multiply(Nper, scene.models[j].vertices[k]);
            } 
            else if (scene.view.type === "parallel") {
                //arrayOfVectorVertex.push(Matrix.multiply(transAndScale, Mpar, Npar, scene.models[j].vertices[k]));
                arrayOfVectorVertex.push(Matrix.multiply(Npar, scene.models[j].vertices[k]));
            }
        }
        arrayModelsVector.push(arrayOfVectorVertex);
    }
    console.log(arrayModelsVector);
    
    
    /*  no clipping version
    // make the w become 1
    for (let m = 0; m < arrayModelsVector.length; m++) {
        for (let i = 0; i < arrayModelsVector[m].length; i++) {
            arrayModelsVector[m][i].x = arrayModelsVector[m][i].x/arrayModelsVector[m][i].w;
            arrayModelsVector[m][i].y = arrayModelsVector[m][i].y/arrayModelsVector[m][i].w;
            arrayModelsVector[m][i].z = arrayModelsVector[m][i].z/arrayModelsVector[m][i].w;
            arrayModelsVector[m][i].w = arrayModelsVector[m][i].w/arrayModelsVector[m][i].w;
        }
    }
        
    // draw the lines
    for (let v = 0; v < scene.models.length; v++) {
        for (let t = 0; t < scene.models[v].edges.length; t++) {
            for (let u = 0; u < scene.models[v].edges[t].length-1; u++) {
                DrawLine(arrayModelsVector[v][scene.models[v].edges[t][u]].x, 
                         arrayModelsVector[v][scene.models[v].edges[t][u]].y, 
                         arrayModelsVector[v][scene.models[v].edges[t][u+1]].x, 
                         arrayModelsVector[v][scene.models[v].edges[t][u+1]].y);
            }
        }
    }
    */
}

// Called when user selects a new scene JSON file
function LoadNewScene() {
    var scene_file = document.getElementById('scene_file');

    var reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.vrp = Vector3(scene.view.vrp[0], scene.view.vrp[1], scene.view.vrp[2]);
        scene.view.vpn = Vector3(scene.view.vpn[0], scene.view.vpn[1], scene.view.vpn[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);

        for (let i = 0; i < scene.models.length; i++) {
            console.log("Working on: " + JSON.stringify(scene.models[i].type));

            //Generic model
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                        scene.models[i].vertices[j][1],
                        scene.models[i].vertices[j][2],
                        1);
                }
            }

            //Cube (but actually box like rectangle thing)
            else if(scene.models[i].type === 'cube') {
                
                let center = scene.models[i].center;
                let width = scene.models[i].width;
                let height = scene.models[i].height;
                let depth = scene.models[i].depth;

                scene.models[i].vertices = [];
                scene.models[i].edges = [];

                scene.models[i].vertices.push(Vector4(center[0]+width/2, center[1]+height/2, center[2]+depth/2, 1));
                scene.models[i].vertices.push(Vector4(center[0]+width/2, center[1]+height/2, center[2]-depth/2, 1));
                scene.models[i].vertices.push(Vector4(center[0]+width/2, center[1]-height/2, center[2]-depth/2, 1));
                scene.models[i].vertices.push(Vector4(center[0]+width/2, center[1]-height/2, center[2]+depth/2, 1));

                scene.models[i].vertices.push(Vector4(center[0]-width/2, center[1]+height/2, center[2]+depth/2, 1));
                scene.models[i].vertices.push(Vector4(center[0]-width/2, center[1]+height/2, center[2]-depth/2, 1));
                scene.models[i].vertices.push(Vector4(center[0]-width/2, center[1]-height/2, center[2]-depth/2, 1));
                scene.models[i].vertices.push(Vector4(center[0]-width/2, center[1]-height/2, center[2]+depth/2, 1));
                
                // edges
                scene.models[i].edges.push([0, 1, 2, 3, 0]);
                scene.models[i].edges.push([4, 5, 6, 7, 4]);
                scene.models[i].edges.push([0, 4]);
                scene.models[i].edges.push([1, 5]);
                scene.models[i].edges.push([2, 6]);
                scene.models[i].edges.push([3, 7]);
            }

            else if(scene.models[i].type === 'cylinder') {
                
                let center = scene.models[i].center;
                let radius = scene.models[i].radius;
                let height = scene.models[i].height;
                let sides = scene.models[i].sides;
                
                scene.models[i].vertices = [];
                scene.models[i].edges = [];

                let increment_radians = (2*Math.PI)/sides;
                
                var upperEdgesArray = [];
                var lowerEdgesArray = [];
                for (let k = 0; k < sides; k++) {
                    scene.models[i].vertices.push(Vector4(center[0]+(radius*Math.cos(k*increment_radians)),
                                                          center[1]+(height/2),
                                                          center[2]-(radius*Math.sin(k*increment_radians)),
                                                          1));
                }
                for (let j = 0; j < sides; j++) {
                    scene.models[i].vertices.push(Vector4(center[0]+(radius*Math.cos(j*increment_radians)),
                                                          center[1]-(height/2),
                                                          center[2]-(radius*Math.sin(j*increment_radians)),
                                                          1));
                }
                
                // edges
                for (let v = 0; v < scene.models[i].vertices.length/2; v++) {
                    upperEdgesArray.push(v);
                    lowerEdgesArray.push(v+sides);
                    scene.models[i].edges.push([upperEdgesArray[v], lowerEdgesArray[v]]);
                }
                upperEdgesArray.push(upperEdgesArray[0]);
                lowerEdgesArray.push(lowerEdgesArray[0]);
                scene.models[i].edges.push(upperEdgesArray);
                scene.models[i].edges.push(lowerEdgesArray);
            }
            
            else if(scene.models[i].type === 'cone') {
                
                let center = scene.models[i].centerOfBase;
                let radius = scene.models[i].radius;
                let height = scene.models[i].height;
                let sides = scene.models[i].sides;
                let increment_radians = (2*Math.PI)/sides;
                var baseEdgesArray = [];
                scene.models[i].vertices = [];
                scene.models[i].edges = [];

                for (let k = 0; k < sides; k++) {
                    scene.models[i].vertices.push(Vector4(center[0]+(radius*Math.cos(k*increment_radians)),
                                                          center[1],
                                                          center[2]-(radius*Math.sin(k*increment_radians)),
                                                          1));
                }
                scene.models[i].vertices.push(Vector4(center[0], center[1]+height, center[2], 1)); // cone apex
                
                // edges
                for (let v = 0; v < scene.models[i].vertices.length-1; v++) {
                    baseEdgesArray.push(v);
                }
                baseEdgesArray.push(baseEdgesArray[0]);
                for (let j = 0; j < baseEdgesArray.length-1; j++) {
                    scene.models[i].edges.push([j,baseEdgesArray.length-1]);
                }
                scene.models[i].edges.push(baseEdgesArray);
            }
            
            else if(scene.models[i].type === 'sphere') {
                
                let center = scene.models[i].center;
                let radius = scene.models[i].radius;
                let slices = scene.models[i].slices;
                let stack = scene.models[i].stack;
                scene.models[i].vertices = [];
                scene.models[i].edges = [];
                
                let increment_radians = (2*Math.PI)/slices;
                var upperApex = [center[0], center[1]+radius, center[2]];
                var lowerApex = [center[0], center[1]-radius, center[2]];
                
                for (let u = 0; u < stack+2; u++) {
                    for (let k = 0; k < slices; k++) {
						var y_axisIncrement = radius*Math.cos(u*Math.PI/(stack+1)); // y value between every stack
                        var radiusOfStack = Math.sqrt(radius * radius - y_axisIncrement * y_axisIncrement); // radius of every stack
                        scene.models[i].vertices.push(Vector4(center[0] + (radiusOfStack*Math.cos(k*increment_radians)), 
                                                              center[1] + y_axisIncrement, 
                                                              center[2] - (radiusOfStack*Math.sin(k*increment_radians)),
                                                              1));
                    }                                
                }
                
                // edges
                for (let j = 0; j < stack+2; j++) {
                    let edgesOfOneStack = [];
                    for (let v = 0; v < slices; v++) {
                        edgesOfOneStack.push(v+j*slices);
                    }
                    edgesOfOneStack.push(edgesOfOneStack[0]);
                    scene.models[i].edges.push(edgesOfOneStack);
                }
                
                var lengthBefore = scene.models[i].edges.length;
                
                for (let q = 0; q < scene.models[i].edges[0].length-1; q++) {
                    let edgesOfOneSlices = [];
                    for (let z = 0; z < lengthBefore; z++) {  
                        edgesOfOneSlices.push(scene.models[i].edges[z][q]);
                    }
                    scene.models[i].edges.push(edgesOfOneSlices);
                }
            }
        }

        DrawScene();
    };
    reader.readAsText(scene_file.files[0], "UTF-8");
}

// Draw black 2D line with red endpoints 
function DrawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}

// Called when user presses a key on the keyboard down 
function OnKeyDown(event) {
	
	scene.view.vpn.normalize();
	let u_axis = scene.view.vup.cross(scene.view.vpn);
	u_axis.normalize();
	
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
			scene.view.vrp = scene.view.vrp.subtract(u_axis);
            DrawScene();
            break;
        case 38: // UP Arrow
            console.log("up");
			scene.view.vrp = scene.view.vrp.subtract(scene.view.vpn);
            DrawScene();
            break;
        case 39: // RIGHT Arrow
            console.log("right");
			scene.view.vrp = scene.view.vrp.add(u_axis);
            DrawScene();
            break;
        case 40: // DOWN Arrow
            console.log("down");
			scene.view.vrp = scene.view.vrp.add(scene.view.vpn);
            DrawScene();
            break;
    }
}

// clipping
var Left = 32;   // 100000
var Right = 16;  // 010000
var Bottom = 8;  // 001000
var Top = 4;	 // 000100
var Front = 2;   // 000010
var Back = 1;    // 000001

function GetOutCode(pt, view) {
	var outCode = 0;
    //var Z_min = -(-view.prp.z + view.clip[4]) / (-view.prp.z + view.clip[5]);
    var Z_min = -(-pt.z + view.clip[4]) / (-pt.z + view.clip[5]);
    if (view.type === "parallel") {
        if (pt.x < -1) {
            outCode += Left;
        }
        else if (pt.x > 1) {
            outCode += Right;
        }
        if (pt.y < -1) {
            outCode += Bottom;
        }
        else if (pt.y > 1) {
            outCode += Top;
        }
        if (pt.z > 0) {
            outCode += Front;
        }
        else if (pt.z < -1) {
            outCode += Back;
        }
    }
    else if (view.type === "perspective") {
        if (pt.x < pt.z) {
            outCode += Left;
        }
        else if (pt.x > -pt.z) {
            outCode += Right;
        }
        if (pt.y < pt.z) {
            outCode += Bottom;
        }
        else if (pt.y > -pt.z) {
            outCode += Top;
        }
        if (pt.z > Z_min) {
            outCode += Front;
        }
        else if (pt.z < -1) {
            outCode += Back;
        }
    }
      
	return outCode;
}

function ClipLine(pt0, pt1, view) { // parallel 3d line clipping
    
	result = {pt0: {}, pt1: {}}
    var vectorResult = [];
    
    var Z_min = -(-view.prp.z + view.clip[4]) / (-view.prp.z + view.clip[5]);
    
    var tem0 = Vector4(pt0.x, pt0.y, pt0.z, 1);
    var tem1 = Vector4(pt1.x, pt1.y, pt1.z, 1);
    
	var outcode0 = GetOutCode(tem0, view);
	var outcode1 = GetOutCode(tem1, view);
    
	var delta_x = pt1.x - pt0.x;
	var delta_y = pt1.y - pt0.y;
	var delta_z = pt1.z - pt0.z;
    
    var left_t;
	var right_t;
	var top_t;
	var bot_t;
	var front_t;
	var back_t;
    
    if (view.type === "parallel") {
        left_t = (-1-tem0.x)/delta_x;
        right_t = (1-tem0.x)/delta_x;
        top_t = (1-tem0.y)/delta_y;
        bot_t = (-1-tem0.y)/delta_y;
        front_t = -tem0.z/delta_z;
        back_t = (-1-tem0.z)/delta_z;
	}
    else if (view.type === "perspective") {
        left_t = (-tem0.x+tem0.z)/(delta_x-delta_z);
        right_t = (tem0.x+tem0.z)/(-delta_x-delta_z);
        top_t = (tem0.y+tem0.z)/(-delta_y-delta_z);
        bot_t = (-tem0.y+tem0.z)/(delta_y-delta_z);
        front_t = (tem0.z-Z_min)/-delta_z;
        back_t = (-tem0.z-1)/delta_z;
	}
    
    var done = false;
	var selectedPoint;
    var selectedOutcode;
    
	while (!done) {
		if ((outcode0 | outcode1) === 0) { // trivial accept
			done  = true;
			result.pt0.x = tem0.x;
			result.pt0.y = tem0.y;
			result.pt0.z = tem0.z;
			result.pt1.x = tem1.x;
			result.pt1.y = tem1.y;
			result.pt1.z = tem1.z;
		}
		else if ((outcode0 & outcode1) !== 0) { // trivial reject
			done = true;
            return null;
		}
		else {
            
			if (outcode0 > 0) {
				selectedPoint = tem0;
				selectedOutcode = outcode0;
			}
			else {
				selectedPoint = tem1;
				selectedOutcode = outcode1;
			}
			if ((selectedOutcode & Left) === Left) {
				selectedPoint.x = tem0.x + left_t * delta_x;
				selectedPoint.y = tem0.y + left_t * delta_y;
				selectedPoint.z = tem0.z + left_t * delta_z;
			}
			else if ((selectedOutcode & Right) === Right) {  
				selectedPoint.x = tem0.x + right_t * delta_x;
				selectedPoint.y = tem0.y + right_t * delta_y;
				selectedPoint.z = tem0.z + right_t * delta_z;
			}
			else if ((selectedOutcode & Bottom) === Bottom) {
                selectedPoint.x = tem0.x + bot_t * delta_x;
				selectedPoint.y = tem0.y + bot_t * delta_y;
				selectedPoint.z = tem0.z + bot_t * delta_z;
			}
			else if ((selectedOutcode & Top) === Top) {
				selectedPoint.x = tem0.x + top_t * delta_x;
                selectedPoint.y = tem0.y + top_t * delta_y;
				selectedPoint.z = tem0.z + top_t * delta_z;
			}
			else if ((selectedOutcode & Front) === Front) {
				selectedPoint.x = tem0.x + front_t * delta_x;
				selectedPoint.y = tem0.y + front_t * delta_y;
				selectedPoint.z = tem0.z + front_t * delta_z;
			}
			else if ((selectedOutcode & Back) === Back) {
				selectedPoint.x = tem0.x + back_t * delta_x;
				selectedPoint.y = tem0.y + back_t * delta_y;
				selectedPoint.z = tem0.z + back_t * delta_z;
			}

			selectedOutcode = GetOutCode(selectedPoint, view);
			if (outcode0 > 0) {
				outcode0 = selectedOutcode;
			}
			else {
				outcode1 = selectedOutcode;
			}
		}
	}
    
    vectorResult.push(Vector4(result.pt0.x, result.pt0.y, result.pt0.z, 1));
    vectorResult.push(Vector4(result.pt1.x, result.pt1.y, result.pt1.z, 1));
    
    return vectorResult;
}