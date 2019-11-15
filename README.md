# 3D Projections for Wireframe Rendering

3D Projections starter code using the HTML5 Canvas 2D API

# Self Grading Ruberic
3D Projections (to earn a C: 45 pts) - [X] 45/45 James/Shijun

Implement perspective projection for 3D models: 35 pts - [X] 35/35 James/Shijun

Transform models into canonical view volume - [X] James (perspective),  Shijun (Parallel)
Implement the matrix functions in matrix.js - [X] Shijun
Implement Cohen-Sutherland 3D line clipping - [X] Shijun and James both made a version and we used Shijun's version (because it worked better)
Project onto view plane - [X] Shijun (parallel), James (Perspective)
Draw 2D lines - [X] Shijun

Implement camera movement to change the view of a scene: 10 pts - [X] 10/10 Shijun
Left/right arrow: translate the VRP along the u-axis - [X] Shijun
Up/down arrow: translate the VRP along the n-axis - [X] Shijun


Additional features (to earn a B or A) 15/15

Implement parallel projection for 3D models: 5 pts - [X]  5/5 see above
Follows same steps as perspective - [X]  see above

Generate vertices and edges for common models: 5 pts - [X]  5/5 James/Shijun
Cube: defined by center point, width, height, and depth (1 pt) - [X]  1/1 James
Cone: defined by center point of base, radius, height, and number of sides (1 pt) - [X]  1/1 Shijun
Cylinder: defined by center point, radius, height, and number of sides (1 pt) - [X]  1/1 Shijun
Sphere: defined by center point, radius, number of slices, and number of stacks (2 pts) - [X]  2/2 Shijun

Allow for models to have a rotation animation: 5 pts - [X]  5/5 James
Can be about the x, y, or z axis - [X] James
Defined in terms of revolutions per second - [X] James
Left/right arrow keys rotate view-plane around the v-axis with the PRP as the origin: 5 pts - [  ] 0/5

Total projected score 60/60
