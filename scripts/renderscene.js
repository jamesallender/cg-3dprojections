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

    DrawScene();
}

// Main drawing code here! Use information contained in variable `scene`
function DrawScene() {
    console.log("in DrawScene")
    ctx.clearRect(0, 0, view.width, view.height);
    console.log(scene);

    let arrayOfMatrixVertex;
    let transformation_matrix;
    let projection_matrix;
    let transAndScale = new Matrix(4,4);
    transAndScale.values = [[view.width/2,0,0,view.width/2],
        [0,view.height/2,0,view.height/2],
        [0,0,1,0],
        [0,0,0,1]];
    console.log("transAndScale: " +  JSON.stringify(transAndScale));

    // perspective seen
    if (scene.view.type === "perspective"){
        console.log("in perspective");
        transformation_matrix = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
        console.log("mat4x4perspective: " +  JSON.stringify(transformation_matrix));

        arrayOfMatrixVertex = [];
        for (let k = 0; k < scene.models[0].vertices.length; k++) {
            arrayOfMatrixVertex[k] = transAndScale.mult(transformation_matrix.mult(scene.models[0].vertices[k]));
        }
    }

    // Parallel seen
    else if (scene.view.type === "parallel"){
        console.log("in parallel");
        transformation_matrix = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
        console.log("mat4x4parallel: " +  JSON.stringify(transformation_matrix));
        projection_matrix = new Matrix(4, 4);
        projection_matrix.values = [[1,0,0,0],
                                    [0,1,0,0],
                                    [0,0,0,0],
                                    [0,0,0,1]];
        console.log("projection_matrix: " +  JSON.stringify(projection_matrix));

        arrayOfMatrixVertex = [];
        for (let k = 0; k < scene.models[0].vertices.length; k++) {
            arrayOfMatrixVertex[k] = projection_matrix.mult(transAndScale.mult(transformation_matrix.mult(scene.models[0].vertices[k])));
        }
    }

    // Fall through
    else{
            console.log("unable to interprit: " + scene.view.type);
        }

    console.log("arrayOfMatrixVertex: " +  JSON.stringify(arrayOfMatrixVertex));

    var arrayVector = [];
    for (let i = 0; i < arrayOfMatrixVertex.length; i++) {
        arrayVector[i] = new Vector4(arrayOfMatrixVertex[i].values[0][0], arrayOfMatrixVertex[i].values[1][0], arrayOfMatrixVertex[i].values[2][0], arrayOfMatrixVertex[i].values[3][0]);
    }
    for (let v = 0; v < scene.models.length; v++) {
        for (let t = 0; t < scene.models[v].edges.length; t++) {
            for (let u = 0; u < scene.models[v].edges[t].length-1; u++) {
                //console.log(arrayVector[scene.models[v].edges[t][u]].x, arrayVector[scene.models[v].edges[t][u]].y, arrayVector[scene.models[v].edges[t][u+1]].x, arrayVector[scene.models[v].edges[t][u+1]].y);
                DrawLine(arrayVector[scene.models[v].edges[t][u]].x, arrayVector[scene.models[v].edges[t][u]].y, arrayVector[scene.models[v].edges[t][u+1]].x, arrayVector[scene.models[v].edges[t][u+1]].y);
            }
        }
    }
}

// Called when user selects a new scene JSON file
function LoadNewScene() {
    var scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

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
                console.log("center: " + JSON.stringify(center));
                let width = scene.models[i].width;
                console.log("width: " + JSON.stringify(width));
                let height = scene.models[i].height;
                console.log("height: " + JSON.stringify(height));
                let depth = scene.models[i].depth;
                console.log("depth: " + JSON.stringify(depth));

                scene.models[i].vertices = [];
                scene.models[i].edges = [];

                scene.models[i].vertices.push(Vector4( center[0]+width/2,  center[1]+height/2, center[2]+depth/2, 1));
                scene.models[i].vertices.push(Vector4( center[0]+width/2,  center[1]+height/2, center[2]-depth/2, 1));
                scene.models[i].vertices.push(Vector4( center[0]+width/2,  center[1]-height/2, center[2]-depth/2, 1));
                scene.models[i].vertices.push(Vector4( center[0]+width/2,  center[1]-height/2, center[2]+depth/2, 1));

                scene.models[i].vertices.push(Vector4( center[0]-width/2,  center[1]+height/2, center[2]+depth/2, 1));
                scene.models[i].vertices.push(Vector4( center[0]-width/2,  center[1]+height/2, center[2]-depth/2, 1));
                scene.models[i].vertices.push(Vector4( center[0]-width/2,  center[1]-height/2, center[2]-depth/2, 1));
                scene.models[i].vertices.push(Vector4( center[0]-width/2,  center[1]-height/2, center[2]+depth/2, 1));

                console.log("scene.models[i].vertices:");
                console.log(scene.models[i].vertices);
                console.log("scene.models[i].vertices: " +  JSON.stringify(scene.models[i].vertices));


                scene.models[i].edges .push([0, 1, 2, 3, 0]);
                scene.models[i].edges .push([4, 5, 6, 7, 4]);
                scene.models[i].edges .push([0, 4]);
                scene.models[i].edges .push([1, 5]);
                scene.models[i].edges .push([2, 6]);
                scene.models[i].edges .push([3, 7]);
                console.log("scene.models[i].edges :");
                console.log(scene.models[i].edges );
                console.log("scene.models[i].edges: " +  JSON.stringify(scene.models[i].edges));

            }

            else if(scene.models[i].type === 'cylinder') {
                let center = scene.models[i].center;
                console.log("center: " + JSON.stringify(center));
                let radius = scene.models[i].radius;
                console.log("radius: " + JSON.stringify(radius));
                let height = scene.models[i].height;
                console.log("height: " + JSON.stringify(height));
                let sides = scene.models[i].sides;
                console.log("sides: " + JSON.stringify(sides));

                scene.models[i].vertices = [];
                scene.models[i].edges = [];

                let increment_radians = (2 * Math.PI) / sides;
                let current_sum_radians = 0;
                for (let i = 0; i < sides; i ++){
                    let x = center[0] + radius * Math.cos(current_sum_radians);
                    let y = center[1] - (height / 2);
                    let z = center[2] + radius * Math.sin(current_sum_radians)
                    current_sum_radians += increment_radians;
                }
            }

            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                    scene.models[i].center[1],
                    scene.models[i].center[2],
                    1)
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
