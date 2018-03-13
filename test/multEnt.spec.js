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

tap.test('mult_ent', t => {
  let vec2_a, vec3_a;
  vec2_a = vec2.create();
  vec2.set(vec2_a, 1, 1);
  vec3_a = vec3.create();
  vec3.set(vec3_a, 1, 1, 1);

  const ent_prop = {
    lfloat: 1,
    lvec2: vec2_a,
    lvec3: vec3_a
  }

  const ent_1 = new entity(ent_prop);
  const ent_2 = new entity(ent_prop);

  console.log(ent_1.lvec3);
  console.log(ent_2.lvec3);

  const vt = new vtween({
    targets: [ent_1, ent_2],
    anim: {
      lvec3: [0, 0, 0],
    },
  });
  vt.tick(500);
  vt.tick(1000);

  console.log(ent_1.lvec3);
  console.log(ent_2.lvec3);
  
  t.end();
})