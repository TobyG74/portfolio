/**
 * Building collision, as rotated rectangles.
 *
 * Pure maths, no THREE and no React, because this is exactly the kind of code
 * that looks right and is quietly wrong: a sign error in the rotation only
 * shows up as "buildings you can walk into at an angle", which is easy to
 * blame on the model. scripts/check-collision.mjs pins it.
 */

/**
 * Rotate a point about the Y axis, matching three's own convention:
 *   x' =  x cos a + z sin a
 *   z' = -x sin a + z cos a
 * Writing this as a plain 2D rotation instead flips the sense of the angle,
 * which rotates every blocker the wrong way by twice the building's yaw.
 */
/** Enough passes to escape a cluster, few enough to never stall a frame. */
const MAX_PASSES = 6;

export function rotateY(x, z, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c + z * s, -x * s + z * c];
}

/**
 * @param shapes  [{ id, x, z, rot, hx, hz }] half extents in the shape's own
 *                frame, which is what `set` later refines from the real model
 */
export function makeBlockers(shapes) {
  const list = shapes.map((s) => ({ ...s }));
  const index = new Map(list.map((b) => [b.id, b]));

  return {
    list,

    /** Called once a building knows its true footprint. */
    set(id, hx, hz) {
      const b = index.get(id);
      if (b) {
        b.hx = hx;
        b.hz = hz;
      }
    },

    /** True when a point of the given radius overlaps any building. */
    blocked(x, z, radius = 0) {
      for (const b of list) {
        const [lx, lz] = rotateY(x - b.x, z - b.z, -b.rot);
        if (Math.abs(lx) < b.hx + radius && Math.abs(lz) < b.hz + radius) return true;
      }
      return false;
    },

    /**
     * Pushes a point out of any building it has ended up inside.
     *
     * Repeated until nothing moves, because a single pass is not enough where
     * buildings sit close together: escaping one can drop you straight into
     * its neighbour, and the point ends up inside after a pass that looked
     * like it had done its job.
     */
    resolve(x, z, radius = 0.45) {
      for (let pass = 0; pass < MAX_PASSES; pass++) {
        let moved = false;

        for (const b of list) {
          // into the building's own frame, where the box is axis aligned
          let [lx, lz] = rotateY(x - b.x, z - b.z, -b.rot);
          const ex = b.hx + radius;
          const ez = b.hz + radius;
          if (Math.abs(lx) >= ex || Math.abs(lz) >= ez) continue;

          // out along whichever wall is nearest, so you slide rather than jump
          const overX = ex - Math.abs(lx);
          const overZ = ez - Math.abs(lz);
          if (overX < overZ) lx = (lx < 0 ? -1 : 1) * ex;
          else lz = (lz < 0 ? -1 : 1) * ez;

          const [wx, wz] = rotateY(lx, lz, b.rot);
          x = b.x + wx;
          z = b.z + wz;
          moved = true;
        }

        if (!moved) break;
      }
      return [x, z];
    },
  };
}
