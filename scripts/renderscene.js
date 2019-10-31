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
    console.log(scene);

    // 1 Calcualte the perspective matrix
    // Get transformation matrix to apply to verticies of objects
    if (scene.view.type === "perspective"){
        let transformation_matrix = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
        console.log("mat4x4perspective: " +  JSON.stringify(transformation_matrix));

    }
    else if (scene.view.type === "parallel"){
        let transformation_matrix = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
        console.log("mat4x4parallel: " +  JSON.stringify(transformation_matrix));
    }
    else{
        console.log("unable to interprit: " + scene.view.type);
    }

    // 2 apply transformation matrix to verticies of moddles
    for (let i = 0; i < scene.models.length; i++) {
        for (let k = 0; k < scene.models[i].vertices.length; k++) {
            console.log("modle " + i + " verticie " + k + " " + scene.models[i].vertices[k])
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
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                        scene.models[i].vertices[j][1],
                        scene.models[i].vertices[j][2],
                        1);
                }
            }

            else if(scene.models[i].type === 'cube') {
                let center = scene.models[i].center;
                console.log("center: " + JSON.stringify(center));
                let width = scene.models[i].width;
                console.log("width: " + JSON.stringify(width));
                let height = scene.models[i].height;
                console.log("height: " + JSON.stringify(height));

                scene.models[i].vertices = [];
                scene.models[i].edges = [];

                scene.models[i].vertices.push(Vector4( center[0]+width,  center[1]+height, center[2]+width, 1));
                scene.models[i].vertices.push(Vector4( center[0]+width,  center[1]+height, center[2]-width, 1));
                scene.models[i].vertices.push(Vector4( center[0]+width,  center[1]-height, center[2]+width, 1));
                scene.models[i].vertices.push(Vector4( center[0]+width,  center[1]-height, center[2]-width, 1));
                scene.models[i].vertices.push(Vector4( center[0]-width,  center[1]+height, center[2]+width, 1));
                scene.models[i].vertices.push(Vector4( center[0]-width,  center[1]+height, center[2]-width, 1));
                scene.models[i].vertices.push(Vector4( center[0]-width,  center[1]-height, center[2]+width, 1));
                scene.models[i].vertices.push(Vector4( center[0]-width,  center[1]-height, center[2]-width, 1));
                console.log("scene.models[i].vertices:");
                console.log(scene.models[i].vertices);

                scene.models[i].edges .push([0, 1, 2, 3]);
                scene.models[i].edges .push([4, 5, 6, 7]);
                scene.models[i].edges .push([0, 4]);
                scene.models[i].edges .push([1, 5]);
                scene.models[i].edges .push([2, 6]);
                scene.models[i].edges .push([3, 7]);
                console.log("scene.models[i].edges :");
                console.log(scene.models[i].edges );
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
