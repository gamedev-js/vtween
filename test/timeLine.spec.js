const tap = require('./tap');
const { vtweenEngine } = require('../dist/vtween');
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

var vEngine = new vtweenEngine();

tap.test('timeLine', t => {

  t.test('one track,one key', t => {
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
    let tlParams = {
      tracks: [{
        target: ent.lvec3,
        keys: [{
          value: [1, 1, 1],
          duration: 10,
        }],
      }],
      options: {
        loop: 0,
      }
    };

    let tl = vEngine.createTimeLine(tlParams);

    vEngine.tick(1);
    vEngine.tick(6);
    t.equal_v3(ent.lvec3, [0.5, 0.5, 0.5]);

    t.end();
  });

  t.test('one track,mult key', t => {
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
    let tlParams = {
      tracks: [{
        target: ent.lvec3,
        keys: [{
          value: [1, 1, 1],
          duration: 10,
        }, {
          value: [0, 0, 0],
          duration: 10,
        },
        ],
      }
      ],
      options: {
        loop: 0,
      }
    };

    let tl = vEngine.createTimeLine(tlParams);

    vEngine.tick(1);
    vEngine.tick(12);
    t.equal_v3(ent.lvec3, [0.9, 0.9, 0.9]);

    t.end();
  });

  t.test('mutl track,one key', t => {
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
    let tlParams = {
      tracks: [{
        target: ent.lvec3,
        keys: [{
          value: [1, 1, 1],
          duration: 10,
        }],
      },
      {
        target: ent.lvec2,
        keys: [{
          value: [1, 1],
          duration: 5
        }],
      }],
      options: {
        loop: 0,
      }
    };

    let tl = vEngine.createTimeLine(tlParams);

    vEngine.tick(1);
    vEngine.tick(3);
    t.equal_v2(ent.lvec2, [0.4, 0.4]);
    t.equal_v3(ent.lvec3, [0.2, 0.2, 0.2]);

    t.end();
  });

  t.test('mutl track,mult key', t => {
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
    let tlParams = {
      tracks: [{
        target: ent.lvec3,
        keys: [{
          value: [1, 1, 1],
          duration: 10,
        }, {
          value: [0, 0, 0],
          duration: 10,
        },
        ],
      },
      {
        target: ent.lvec2,
        keys: [{
          value: [1, 1],
          duration: 5
        }],
      }],
      options: {
        loop: 0,
      }
    };

    let tl = vEngine.createTimeLine(tlParams);

    vEngine.tick(1);
    vEngine.tick(3);
    t.equal_v2(ent.lvec2, [0.4, 0.4]);
    t.equal_v3(ent.lvec3, [0.2, 0.2, 0.2]);
    vEngine.tick(12);
    t.equal_v2(ent.lvec2, [1, 1]);
    t.equal_v3(ent.lvec3, [0.9, 0.9, 0.9]);

    t.end();
  });

  t.end();
})