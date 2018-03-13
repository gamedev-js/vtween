const tap = require('./tap');
const { vtween } = require('../dist/vtween');
const vmath = require('vmath');
const { vec2, vec3 } = vmath;

class entity {
  constructor(params = {}) {
    this.lfloat = params.lfloat;
    this.lvec2 = params.lvec2;
    this.lvec3 = params.lvec3;
  }
}

tap.test('vtween_loop', t => {
  let vec2_a, vec3_a;
  vec2_a = vec2.create();
  vec2.set(vec2_a, 1, 1);
  vec3_a = vec3.create();
  vec3.set(vec3_a, 1, 1, 1);

  let ent_prop = {
    lfloat: 1,
    lvec2: vec2_a,
    lvec3: vec3_a
  }

  const ent = new entity(ent_prop);

  console.log(ent.lvec3);

  const vt = new vtween({
    targets: ent,
    anim: {
      lfloat: 0,
      lvec3: [0, 0, 0],
    },
    properties: {
      loop: true,
    },
  });
  vt.tick(500);
  vt.tick(1500);
  vt.tick(2000);

  console.log(ent.lvec3);

  t.end();
})