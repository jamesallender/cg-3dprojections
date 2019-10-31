class Matrix {
    constructor(r, c) {
        this.rows = r;
        this.columns = c;
        this.data = [];
        var i, j;
        for (i = 0; i < this.rows; i++) {
            this.data.push([]);
            for (j = 0; j < this.columns; j++) {
                this.data[i].push(0);
            }
        }
    }

    set values(v) {
        var i, j, idx;
        // v is already a 2d array with dims equal to rows and columns
        if (v instanceof Array && v.length === this.rows && 
            v[0] instanceof Array && v[0].length === this.columns) {
            this.data = v;
        }
        // v is a flat array with length equal to rows * columns
        else if (v instanceof Array && typeof v[0] === 'number' &&
                 v.length === this.rows * this.columns) {
            idx = 0;
            for (i = 0; i < this.rows; i++) {
                for (j = 0; j < this.columns; j++) {
                    this.data[i][j] = v[idx];
                    idx++;
                }
            }
        }
        // not valid
        else {
            console.log("could not set values for " + this.rows + "x" + this.columns + " maxtrix");
        }
    }

    get values() {
        return this.data.slice();
    }

    // matrix multiplication (this * rhs)
    mult(rhs) {
        var result = null;
        var i, j, k, vals, sum;
        // ensure multiplication is valid
        if (rhs instanceof Matrix && this.columns === rhs.rows) {
            result = new Matrix(this.rows, rhs.columns);
            vals = result.values;
            for (i = 0; i < result.rows; i++) {
                for (j = 0; j < result.columns; j++) {
                    sum = 0;
                    for (k = 0; k < this.columns; k++) {
                        sum += this.data[i][k] * rhs.data[k][j]
                    }
                    vals[i][j] = sum;
                }
            }
            result.values = vals;
        }
        else {
            console.log("could not multiply - row/column mismatch");
        }
        return result;
    }
}

Matrix.multiply = function(...args) {
    var i;
    var result = null;
    // ensure at least 2 matrices
    if (args.length >= 2 && args.every((item) => {return item instanceof Matrix;})) {
        result = args[0];
        i = 1;
        while (result !== null && i < args.length) {
            result = result.mult(args[i]);
            i++;
        }
        if (args[args.length - 1] instanceof Vector) {
            result = new Vector(result);
        }
    }
    else {
        console.log("could not multiply - requires at least 2 matrices");
    }
    return result;
}


class Vector extends Matrix {
    constructor(n) {
        var i;
        if (n instanceof Matrix) {
            super(n.rows, 1);
            for (i = 0; i < this.rows; i++) {
                this.data[i][0] = n.data[i][0];
            }
        }
        else {
            super(n, 1);
        }
    }

    get x() {
        var result = null;
        if (this.rows > 0) {
            result = this.data[0][0];
        }
        return result;
    }

    get y() {
        var result = null;
        if (this.rows > 1) {
            result = this.data[1][0];
        }
        return result;
    }

    get z() {
        var result = null;
        if (this.rows > 2) {
            result = this.data[2][0];
        }
        return result;
    }

    get w() {
        var result = null;
        if (this.rows > 3) {
            result = this.data[3][0];
        }
        return result;
    }

    set x(val) {
        if (this.rows > 0) {
            this.data[0][0] = val;
        }
    }

    set y(val) {
        if (this.rows > 0) {
            this.data[1][0] = val;
        }
    }

    set z(val) {
        if (this.rows > 0) {
            this.data[2][0] = val;
        }
    }

    set w(val) {
        if (this.rows > 0) {
            this.data[3][0] = val;
        }
    }

    magnitude() {
        var i;
        var sum = 0;
        for (i = 0; i < this.rows; i++) {
            sum += this.data[i][0] * this.data[i][0];
        }
        return Math.sqrt(sum);
    }

    normalize() {
        var i;
        var mag = this.magnitude();
        for (i = 0; i < this.rows; i++) {
            this.data[i][0] /= mag;
        }
    }

    scale(s) {
        var i;
        for (i = 0; i < this.rows; i++) {
            this.data[i][0] *= s;
        }
    }

    add(rhs) {
        var i;
        var result = null;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            result = new Vector(this.rows);
            for (i = 0; i < this.rows; i++) {
                result.data[i][0] = this.data[i][0] + rhs.data[i][0];
            }
        }
        return result;
    }

    subtract(rhs) {
        var i;
        var result = null;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            result = new Vector(this.rows);
            for (i = 0; i < this.rows; i++) {
                result.data[i][0] = this.data[i][0] - rhs.data[i][0];
            }
        }
        return result;
    }

    dot(rhs) {
        var i;
        var sum = 0;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            for (i = 0; i < this.rows; i++) {
                sum += this.data[i][0] * rhs.data[i][0];
            }
        }
        return sum;
    }

    cross(rhs) {
        var result = null;
        if (rhs instanceof Vector && this.rows === 3 && rhs.rows === 3) {
            result = new Vector(3);
            result.values = [this.data[1][0] * rhs.data[2][0] - this.data[2][0] * rhs.data[1][0],
                             this.data[2][0] * rhs.data[0][0] - this.data[0][0] * rhs.data[2][0],
                             this.data[0][0] * rhs.data[1][0] - this.data[1][0] * rhs.data[0][0]]
        }
        return result;
    }
}



function mat4x4identity() {
    var result = new Matrix(4, 4);
    result.values = ([[1,0,0,0],
                      [0,1,0,0],
                      [0,0,1,0],
                      [0,0,0,1]]);
    return result;
}

function mat4x4translate(tx, ty, tz) {
    var result = new Matrix(4, 4);
    result.values = ([[1,0,0,tx],
                      [0,1,0,ty],
                      [0,0,1,tz],
                      [0,0,0, 1]]);
    return result;
}

function mat4x4scale(sx, sy, sz) {
    var result = new Matrix(4, 4);
    result.values = ([[sx, 0, 0,0],
                      [ 0,sy, 0,0],
                      [ 0, 0,sz,0],
                      [ 0, 0, 0,1]]);    
    return result;
}

function mat4x4rotatex(theta) {
    var result = new Matrix(4, 4);
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    result.values = ([[1,0,0,0],
                      [0,cosTheta,-sinTheta,0],
                      [0,sinTheta,cosTheta,0],
                      [0,0,0,1]]);
    return result;
}

function mat4x4rotatey(theta) {
    var result = new Matrix(4, 4);
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    result.values = ([[cosTheta,0,sinTheta,0],
                      [0,1,0,0],
                      [-sinTheta,0,cosTheta,0],
                      [0,0,0,1]]);
    return result;
}

function mat4x4rotatez(theta) {
    var result = new Matrix(4, 4);
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    result.values = ([[cosTheta,-sinTheta,0,0],
                      [sinTheta,cosTheta,0,0],
                      [0,0,1,0],
                      [0,0,0,1]]);
    return result;
}

function mat4x4shearxy(shx, shy) {
    var result = new Matrix(4, 4);
    result.values = ([[1,0,shx,0],
                      [0,1,shy,0],
                      [0,0,1,0],
                      [0,0,0,1]]);
    return result;
}

function mat4x4parallel(vrp, vpn, vup, prp, clip) {
    // 1. translate VRP to the origin
    var translateMatrix = mat4x4translate(-vrp.x, -vrp.y, -vrp.z);
    // 2. rotate VRC such that n-axis (VPN) becomes the z-axis,
    //    u-axis becomes the x-axis, and v-axis becomes the y-axis
    var u_axis = vup.cross(n_axis).normalize();
    var v_axis = n_axis.cross(u_axis);
    var n_axis = vpn.normalize();
    var rotateMatrix = new Matrix(4,4);
    rotateMatrix.values = [[u_axis.x, u_axis.y, u_axis.z, 0],
                           [v_axis.x, v_axis.y, v_axis.z, 0],
                           [n_axis.x, n_axis.y, n_axis.z, 0],
                           [0, 0, 0, 1]];
    // 3. shear such that the DOP becomes parallel to the z-axis
    // DOP = CW - PRP;
    var CW = [(clip[0]+clip[1])/2, (clip[2]+clip[3])/2, 0];
    var DOP = [CW[0]-prp.x, CW[1]-prp.y, CW[2]-prp.z];
    var SHXpar = -DOP[0]/DOP[2];
    var SHYpar = -DOP[1]/DOP[2];
    var shparMatrix = mat4x4shearxy(SHXpar, SHYpar);
    // 4. translate and scale into canonical view volume
    //    (x = [-1,1], y = [-1,1], z = [0,-1])
    var CWx = (clip[0]+clip[1])/2;
    var CWy = (clip[2]+clip[3])/2;
    var Sparx = 2/(clip[1]-clip[0]);
    var Spary = 2/(clip[3]-clip[2]);
    var Sparz = 1/(clip[4]-clip[5]);
    var CW_TranslateMatrix = mat4x4translate(-CWx, -CWy, -clip[4]);                         
    var ScaleMatrix = mat4x4scale(Sparx, Spary, Sparz);

    var Npar = ScaleMatrix.mult(CW_TranslateMatrix.mult(shparMatrix.mult(rotateMatrix.mult(translateMatrix))));

    return Npar;
}

function mat4x4perspective(vrp, vpn, vup, prp, clip) {
    console.log("vrp");
    console.log(vrp);

    let n_vrp = vrp;
    n_vrp.normalize();

    console.log("n_vrp");
    console.log(n_vrp);
    console.log("vrp");
    console.log(vrp);


    vpn.normalize();
    let n_axis = vpn; //(normialize vpn to length 1)
    vup.normalize();
    let u_axis = vup.cross(n_axis); //normalized vup cross n axis
    let v_axis = n_axis.cross(u_axis);

    // 1. translate VRP to the origin
    let trans_vrp_to_origin = mat4x4translate(-vrp.x, -vrp.y, -vrp.z);

    // 2. rotate VRC such that n-axis (VPN) becomes the z-axis,
    //    u-axis becomes the x-axis, and v-axis (vup?) becomes the y-axis
    let rotate_axis_mtx = new Matrix(4,4);
    rotate_axis_mtx.values = [[u_axis.x, u_axis.y, u_axis.z, 0],
        [n_axis.x, n_axis.y, n_axis.z, 0],
        [v_axis.x, v_axis.y, v_axis.z, 0],
        [0,        0,        0,        1]];

    // 3. translate PRP to the origin
    let trans_to_origin_mtx = mat4x4translate(-prp.x, -prp.y, -prp.z);

    // 4. shear such that the center line of the view volume becomes the z-axis
    let cop = prp;
    let shx_par = -cop.x/cop.z;
    let shy_par = -cop.y/cop.z;

    let shear_mtx = mat4x4shearxy(shx_par, shy_par);

    // 5. scale into canonical view volume (truncated pyramid)
    //clip (array - umin, umax, vmin, vmax, front, back)
    let umin = clip[0];
    let umax = clip[1];
    let vmin = clip[2];
    let vmax = clip[3];
    let front = clip[4];
    let back = clip[5];

    let vrpz = -(prp.z);

    let sperx = ((2 * vrpz)/((umax-umin) * (vrpz + back)));
    let spery = ((2 * vrpz)/((vmax-vmin) * (vrpz + back)));
    let sperz =((-1) / (vrpz + back));

    let scale_mtx =  mat4x4scale(sperx, spery, sperz)

    //    (x = [z,-z], y = [z,-z], z = [-z_min,-1])

    // put it all together
    // 𝑁_𝑝𝑒𝑟=𝑆_𝑝𝑒𝑟⋅〖𝑆𝐻〗_𝑝𝑎𝑟∙𝑇(−𝑃𝑅𝑃)⋅𝑅⋅𝑇(−𝑉𝑅𝑃)
    let trans_mtx = scale_mtx.mult(shear_mtx.mult(trans_to_origin_mtx.mult(rotate_axis_mtx.mult(trans_vrp_to_origin))));
    return trans_mtx;

}

function mat4x4mper(near) {
    // convert perspective canonical view volume into the parallel one
    var result = new Matrix(4, 4);
    
    return result;
}

function Vector3(x, y, z) {
    var result = new Vector(3);
    result.values = [x, y, z];
    return result;
}

function Vector4(x, y, z, w) {
    var result = new Vector(4);
    result.values = [x, y, z, w];
    return result;
}
