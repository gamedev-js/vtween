const tap = require('./tap');
const { easing, vtween, vtweenEngine } = require('../dist/vtween');
const vmath = require('vmath');
const { vec2, vec3, quat } = vmath;

class entity {
  constructor(params = {}) {
    this.lfloat = params.lfloat;
    this.lvec2 = params.lvec2;
    this.lvec3 = params.lvec3;
    this.lquat = params.lquat;
  }
}

tap.test('vtween', t => {

  t.test('vtween Play', t => {
    let vec2A, vec3A, quatA;
    vec2A = vec2.create();
    vec2.set(vec2A, 0, 0);
    vec3A = vec3.create();
    vec3.set(vec3A, 0, 0, 0);
    quatA = quat.create();
    quat.set(quatA, 0, 0, 0, 0);

    const entProp = {
      lfloat: 1,
      lvec2: vec2A,
      lvec3: vec3A,
      lquat: quatA
    }

    let ent = new entity(entProp);
    let vtween1 = vtween({
      targets: ent,
      properties: {
        lvec2: [1, 1],
        lvec3: [1, 1, 1],
      },
      options: {
        autoplay: false,
      }
    });
    vtween1.play();
    vtweenEngine.tick(500);
    vtweenEngine.tick(800);

    t.equal_v3(ent.lvec3, [0.3, 0.3, 0.3]);
    vtweenEngine.tick(1000);
    t.equal_v3(ent.lvec3, [0.5, 0.5, 0.5]);

    t.end();
  });

  t.test('Multiple Entities', t => {
    let vec2A, vec3A, quatA;
    vec2A = vec2.create();
    vec2.set(vec2A, 0, 0);
    vec3A = vec3.create();
    vec3.set(vec3A, 0, 0, 0);
    quatA = quat.create();
    quat.set(quatA, 0, 0, 0, 0);

    const entProp = {
      lfloat: 1,
      lvec2: vec2A,
      lvec3: vec3A,
      lquat: quatA
    }

    let ent1 = new entity(entProp);
    let ent2 = new entity(entProp);
    let vtween1 = vtween({
      targets: [ent1, ent2],
      properties: {
        lvec2: [1, 1],
        lvec3: [1, 1, 1],
      },
      options: {
      }
    });

    vtweenEngine.tick(500);
    vtweenEngine.tick(800);
    t.equal_v3(ent1.lvec3, [0.3, 0.3, 0.3]);
    t.equal_v3(ent2.lvec3, [0.3, 0.3, 0.3]);
    vtweenEngine.tick(1000);
    t.equal_v3(ent1.lvec3, [0.5, 0.5, 0.5]);
    t.equal_v3(ent2.lvec3, [0.5, 0.5, 0.5]);

    t.end();
  });

  t.test('vtween Pause', t => {
    let vec2A, vec3A, quatA;
    vec2A = vec2.create();
    vec2.set(vec2A, 0, 0);
    vec3A = vec3.create();
    vec3.set(vec3A, 0, 0, 0);
    quatA = quat.create();
    quat.set(quatA, 0, 0, 0, 0);

    const entProp = {
      lfloat: 1,
      lvec2: vec2A,
      lvec3: vec3A,
      lquat: quatA
    }

    let ent = new entity(entProp);
    let vtween1 = vtween({
      targets: ent,
      properties: {
        lvec2: [1, 1],
        lvec3: [1, 1, 1],
      },
      options: {
      }
    });
    vtween1.pause();
    vtweenEngine.tick(500);
    vtweenEngine.tick(800);
    t.equal_v3(ent.lvec3, [0, 0, 0]);
    vtweenEngine.tick(1000);
    t.equal_v3(ent.lvec3, [0, 0, 0]);

    t.end();
  });

  t.test('vtween Pause', t => {
    let vec2A, vec3A, quatA;
    vec2A = vec2.create();
    vec2.set(vec2A, 0, 0);
    vec3A = vec3.create();
    vec3.set(vec3A, 0, 0, 0);
    quatA = quat.create();
    quat.set(quatA, 0, 0, 0, 0);

    const entProp = {
      lfloat: 1,
      lvec2: vec2A,
      lvec3: vec3A,
      lquat: quatA
    }

    let ent = new entity(entProp);
    let vtween1 = vtween({
      targets: ent,
      properties: {
        lvec2: [1, 1],
        lvec3: [1, 1, 1],
      },
      options: {
      }
    });
    vtween1.pause();
    vtweenEngine.tick(500);
    vtweenEngine.tick(800);
    t.equal_v3(ent.lvec3, [0, 0, 0]);
    vtweenEngine.tick(1000);
    t.equal_v3(ent.lvec3, [0, 0, 0]);

    t.end();
  });

  t.test('vtween Pause and Play', t => {
    let vec2A, vec3A, quatA;
    vec2A = vec2.create();
    vec2.set(vec2A, 0, 0);
    vec3A = vec3.create();
    vec3.set(vec3A, 0, 0, 0);
    quatA = quat.create();
    quat.set(quatA, 0, 0, 0, 0);

    const entProp = {
      lfloat: 1,
      lvec2: vec2A,
      lvec3: vec3A,
      lquat: quatA
    }

    let ent = new entity(entProp);
    let vtween1 = vtween({
      targets: ent,
      properties: {
        lvec2: [1, 1],
        lvec3: [1, 1, 1],
      },
      options: {
      }
    });

    vtweenEngine.tick(500);
    vtweenEngine.tick(800);
    t.equal_v3(ent.lvec3, [0.3, 0.3, 0.3]);
    vtween1.pause();
    vtweenEngine.tick(1000);
    t.equal_v3(ent.lvec3, [0.3, 0.3, 0.3]);
    vtween1.play();
    vtweenEngine.tick(1000);
    vtweenEngine.tick(1200);
    t.equal_v3(ent.lvec3, [0.5, 0.5, 0.5]);

    t.end();
  });

  t.test('vtween Restart', t => {
    let vec2A, vec3A, quatA;
    vec2A = vec2.create();
    vec2.set(vec2A, 0, 0);
    vec3A = vec3.create();
    vec3.set(vec3A, 0, 0, 0);
    quatA = quat.create();
    quat.set(quatA, 0, 0, 0, 0);

    const entProp = {
      lfloat: 1,
      lvec2: vec2A,
      lvec3: vec3A,
      lquat: quatA
    }
    let ent = new entity(entProp);
    let vtween1 = vtween({
      targets: ent,
      properties: {
        lvec2: [1, 1],
        lvec3: [1, 1, 1],
      },
      options: {
        autoplay: false,
      }
    });
    vtween1.play();
    vtweenEngine.tick(500);
    vtweenEngine.tick(800);
    t.equal_v3(ent.lvec3, [0.3, 0.3, 0.3]);
    vtween1.restart();
    vtweenEngine.tick(800);
    vtweenEngine.tick(1000);
    t.equal_v3(ent.lvec3, [0.2, 0.2, 0.2]);

    t.end();
  });

  t.test('vtween Reverse', t => {
    let vec2A, vec3A, quatA;
    vec2A = vec2.create();
    vec2.set(vec2A, 0, 0);
    vec3A = vec3.create();
    vec3.set(vec3A, 0, 0, 0);
    quatA = quat.create();
    quat.set(quatA, 0, 0, 0, 0);

    const entProp = {
      lfloat: 1,
      lvec2: vec2A,
      lvec3: vec3A,
      lquat: quatA
    }

    let ent = new entity(entProp);
    let vtween1 = vtween({
      targets: ent,
      properties: {
        lvec2: [1, 1],
        lvec3: [1, 1, 1],
      },
      options: {
        autoplay: false,
      }
    });
    vtween1.play();
    vtweenEngine.tick(500);
    vtweenEngine.tick(800);
    t.equal_v3(ent.lvec3, [0.3, 0.3, 0.3]);
    vtweenEngine.tick(1000);
    t.equal_v3(ent.lvec3, [0.5, 0.5, 0.5]);
    vtween1.reverse();
    vtweenEngine.tick(1000);
    vtweenEngine.tick(1200);
    t.equal_v3(ent.lvec3, [0.3, 0.3, 0.3]);

    t.end();
  });

  t.end();
})