import { vec2, vec3, quat } from 'vmath';
import { easing } from './easing';

function minMaxValue(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function cloneObject(o) {
  let clone = {};
  for (let p in o) clone[p] = o[p];
  return clone;
}

function replaceObjectProps(o1, o2) {
  let o = cloneObject(o1);
  for (let p in o1) o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
  return o;
}

function mergeObjects(o1, o2) {
  let o = cloneObject(o1);
  for (let p in o2) {
    if (o1[p] === undefined) {
      o[p] = o2[p];
    } else {
      o[p] = o1[p];
    }
  }
  return o;
}

const defaultInstanceSettings = {
  update: undefined,
  begin: undefined,
  run: undefined,
  complete: undefined,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  offset: 0,
  duration: 1000,
  delay: 0,
  easing: undefined,
  elasticity: 500,
  round: 0,
  currentTime: 0,
  progress: 0,
  paused: true,
  began: false,
  completed: false,
  reversed: false,
  remaining: 0,
}

function getTweens(properties, targets) {
  const tweens = properties;
  let ret;
  let ret_length;
  let tweenArr = [];

  if (targets instanceof Array) {
    for (let i = 0; i < targets.length; i++) {
      for (let tweenProperty in tweens) {
        if (targets[i][tweenProperty] === undefined) {
          continue;
        }

        if (tweens[tweenProperty].length === 1) {
          ret = tweens[tweenProperty][0];
          ret_length = 1;
        } else if (tweens[tweenProperty].length === 2) {
          ret = vec2.create();
          vec2.set(ret, tweens[tweenProperty][0], tweens[tweenProperty][1]);
          ret_length = 2;
        } else if (tweens[tweenProperty].length === 3) {
          ret = vec3.create();
          vec3.set(ret, tweens[tweenProperty][0], tweens[tweenProperty][1], tweens[tweenProperty][2]);
          ret_length = 3;
        } else if (tweens[tweenProperty].length === 4) {
          ret = quat.create();
          quat.set(ret, tweens[tweenProperty][0], tweens[tweenProperty][1], tweens[tweenProperty][2], tweens[tweenProperty][3]);
          ret_length = 4;
        }

        tweenArr.push({
          tweenTarget: targets[i][tweenProperty],
          toLength: ret_length,
          to: ret,
          from: cloneObject(targets[i][tweenProperty])
        });
      }
    }
  } else {
    for (let tweenProperty in tweens) {
      if (targets[tweenProperty] === undefined) {
        continue;
      }

      if (tweens[tweenProperty].length === 1) {
        ret = tweens[tweenProperty][0];
        ret_length = 1;
      } else if (tweens[tweenProperty].length === 2) {
        ret = vec2.create();
        vec2.set(ret, tweens[tweenProperty][0], tweens[tweenProperty][1]);
        ret_length = 2;
      } else if (tweens[tweenProperty].length === 3) {
        ret = vec3.create();
        vec3.set(ret, tweens[tweenProperty][0], tweens[tweenProperty][1], tweens[tweenProperty][2]);
        ret_length = 3;
      } else if (tweens[tweenProperty].length === 4) {
        ret = quat.create();
        quat.set(ret, tweens[tweenProperty][0], tweens[tweenProperty][1], tweens[tweenProperty][2], tweens[tweenProperty][3]);
        ret_length = 4;
      }

      tweenArr.push({
        tweenTarget: targets[tweenProperty],
        toLength: ret_length,
        to: ret,
        from: cloneObject(targets[tweenProperty])
      });
    }
  }

  return tweenArr;
}

function createNewInstance(params) {
  const instanceSettings = replaceObjectProps(defaultInstanceSettings, params.options);
  const targets = params.targets;
  const tweens = getTweens(params.properties, targets);
  if (!instanceSettings.easing) instanceSettings.easing = easing.linear.none;
  return mergeObjects(instanceSettings, {
    children: [],
    targets: targets,
    tweens: tweens,
  });
}

//core
class Group {
  constructor() {
    this._vtweens = [];
  }

  add(task) {
    this._vtweens.push(task);
  }

  remove(task) {
    const i = this._vtweens.indexOf(instance);
    if (i > -1) this._vtweens.splice(i, 1);
  }

  tick(t) {
    const vtweensLength = this._vtweens.length;
    for (let i = 0; i < vtweensLength; ++i) {
      if (!this._vtweens[i] || this._vtweens[i].paused) continue;

      this._vtweens[i].tick(t);
    }
  }
}
var vtweenEngine = new Group();

function vtween(params = {}) {
  let now, startTime, lastTime = 0;

  let resolve = null;

  let instance = createNewInstance(params);

  function toggleInstanceDirection() {
    instance.reversed = !instance.reversed;
  }

  function adjustTime(time) {
    return instance.reversed ? instance.duration - time : time;
  }

  function syncInstanceChildren(time) {
    const children = instance.children;
    const childrenLength = children.length;
    if (time >= instance.currentTime) {
      for (let i = 0; i < childrenLength; i++) children[i].seek(time);
    } else {
      for (let i = childrenLength; i--;) children[i].seek(time);
    }
  }

  function setCallback(cb) {
    if (instance[cb]) instance[cb](instance);
  }

  function countIteration() {
    if (instance.remaining && instance.remaining !== true) {
      instance.remaining--;
    }
  }

  function setAnimationsProgress(insTime) {
    const insOffset = instance.offset;
    const insStart = insOffset + instance.delay;
    const elapsed = minMaxValue(insTime - insStart, 0, instance.duration) / instance.duration;
    const eased = isNaN(elapsed) ? 1 : instance.easing(elapsed);

    instance.tweens.forEach((tween) => {
      if (tween.toLength === 1) {
        tween.tweenTarget = ((tween.to - tween.from) * eased) + tween.from;
      } else if (tween.toLength === 2) {
        vec2.lerp(tween.tweenTarget, tween.from, tween.to, eased);
      } else if (tween.toLength === 3) {
        vec3.lerp(tween.tweenTarget, tween.from, tween.to, eased);
      } else if (tween.toLength === 4) {
        quat.lerp(tween.tweenTarget, tween.from, tween.to, eased);
      }
    });
    instance.currentTime = insTime;
  }

  function setInstanceProgress(engineTime) {
    const insDuration = instance.duration;
    const insOffset = instance.offset;
    const insStart = insOffset + instance.delay;
    const insTime = adjustTime(engineTime);
    if (instance.children.length) syncInstanceChildren(insTime);

    if (insTime >= insStart || !insDuration) {
      if (!instance.began) {
        instance.began = true;
        setCallback('begin');
      }
      setCallback('run');
    }

    if (insTime > insOffset && insTime < insDuration) {
      setAnimationsProgress(insTime, insStart);
    }

    setCallback('update');
    if (engineTime >= insDuration) {
      if (instance.remaining) {
        startTime = now;
        if (instance.direction === 'alternate') toggleInstanceDirection();
      } else {
        instance.pause();
        if (!instance.completed) {
          instance.completed = true;
          setCallback('complete');
        }
      }
      lastTime = 0;
    }
  }

  instance.reset = function () {
    const direction = instance.direction;
    const loops = instance.loop;
    instance.currentTime = 0;
    instance.progress = 0;
    instance.paused = true;
    instance.began = false;
    instance.completed = false;
    instance.reversed = direction === 'reverse';
    instance.remaining = direction === 'alternate' && loops === 1 ? 2 : loops;
    setAnimationsProgress(0);
    for (let i = instance.children.length; i--;) {
      instance.children[i].reset();
    }
  }

  instance.tick = function (t) {
    now = t;
    if (!startTime) startTime = now;
    const engineTime = lastTime + now - startTime;
    setInstanceProgress(engineTime);
  }

  instance.seek = function (time) {
    setInstanceProgress(adjustTime(time));
  }

  instance.pause = function () {
    instance.paused = true;
  }

  instance.play = function () {
    if (!instance.paused) return;
    instance.paused = false;
    startTime = 0;
    lastTime = adjustTime(instance.currentTime);
  }

  instance.reverse = function () {
    toggleInstanceDirection();
    startTime = 0;
    lastTime = adjustTime(instance.currentTime);
  }

  instance.restart = function () {
    instance.pause();
    instance.reset();
    instance.play();
  }

  instance.reset();

  if (instance.autoplay) instance.play();

  vtweenEngine.add(instance);

  return instance;
}

export { vtween, vtweenEngine };