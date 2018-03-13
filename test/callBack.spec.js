const tap = require('./tap');
const { Easing, vtween } = require('../dist/vtween');
const vmath = require('vmath');
const { vec2, vec3 } = vmath;

class entity {
  constructor(params = {}) {
    this.lfloat = params.lfloat;
    this.lvec2 = params.lvec2;
    this.lvec3 = params.lvec3;
  }
}

tap.test('vtween_base', t => {

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

  ent = new entity(ent_prop);

  let beginFun = function () {
    console.log('begine callback!');
  }
  let endFun = function () {
    console.log('end callback!');
  }
  let runFun = function () {
    console.log('run callback!');
  }
  let updataFun = function () {
    console.log('updata callback!');
  }


  console.log(ent.lvec3);
  let vt = new vtween({
    targets: ent,
    anim: {
      lfloat: 0,
      lvec3: [0, 0, 0],
    },
    properties: {
    }
  });
  vt.onStart = beginFun;
  vt.onEnd = endFun;
  vt.onRun = runFun;
  vt.onUpdate = updataFun;

  vt.tick(500);
  vt.tick(1500);

  console.log(ent.lvec3);
  t.end();
})