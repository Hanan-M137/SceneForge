# SceneForge

project for Fundamentals of Computer Graphics (240212100).

One p5.js program with 5 modules. Everything in it (shapes, colours, depth) is
generated from a single number: the last 4 digits of the student ID.

#The Seed
seed = 6455

Three values are derived from it:
- `n = 15` → number of shapes
- `p = 6` → palette size (number of colours)
- `d = 6` → Sierpinski recursion depth

#How to Run
1. Open the project in the [p5.js Web Editor](https://editor.p5js.org)
2. Press ▶ to run
3. Use the keyboard to navigate:

| Key | Action |
|---|---|
| `0` | Back to the main menu |
| `1` | Module 1 - Draw the scene |
| `2` | Module 2 - Sierpinski gasket |
| `3` | Module 3 - Transform the scene |
| `4` | Module 4 - 3-D view |
| `5` | Module 5 - Measure & compare |

#The Five Modules

**Module 1 — Draw the Scene**
Draws 15 shapes (rectangles, circles, triangles), with colours, sizes and positions
all generated from the seed.
Bonus: press `A` to toggle alpha blending, so overlapping shapes mix instead of one
hiding the other.

**Module 2 — Sierpinski Gasket**
Draws the Sierpinski gasket using recursion, and shows how many triangles were drawn.
Bonus: the same fractal is drawn next to it using the chaos game, for comparison.

**Module 3 — Transform the Scene**
Draws the same shapes twice, applying transforms in a different order each time
(translate → rotate → scale, and the reverse), to show that order changes the result.
Bonus: one shape animates continuously using `frameCount`.

**Module 4 — 3-D View**
Renders the scene as 3-D solids (box, sphere, cone) viewed through a real camera.

| Key | Action |
|---|---|
| `P` | Perspective projection |
| `O` | Orthographic projection |
| `C` | Toggle camera orbit (bonus) |

**Module 5 — Measure & Compare**
Measures 4 algorithms (shapes drawn, fractal triangles, scene transforms, recursive
calls), compares the measured counts against the theoretical formulas, and plots
the results.

| Key | Action |
|---|---|
| `T` | Toggle between the theoretical analysis table and the measured results |

#The Random Number Generator

Every "random" value in the project (colour, position, size...) does not come from
p5.js's built-in `random()`. It comes from a hand-written generator (an LCG) that is
entirely driven by the seed:

next(x) = (1103515245 * x + 12345) % 2147483648

This means the same seed always produces exactly the same scene — fully reproducible.
