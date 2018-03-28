import { vec2, vec3, quat } from 'vmath';
import { LinkedArray } from 'memop';
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

function getProperties(props, obj) {
  for (var prop in props) {
    if (obj[prop] !== undefined) {
      obj[prop] = props[prop];
    }
  }
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

//core
class vtweenEngine {
  constructor() {
    this.activeTasks = new LinkedArray(() => {
      return new Task();
    }, 200);

  }

  create(params = {}) {
    let task = this.activeTasks._pool.alloc();
    task._engine = this;
    task.init(params);
    return task;
  }

  tick(t) {
    let cursor = this.activeTasks._head;
    if (!cursor) {
      return;
    }

    let next = cursor;

    while (cursor) {
      next = cursor._next;
      if (!cursor.paused)
        cursor.tick(t);
      cursor = next;
    }
  }
}

class Task {
  constructor() {

    //callBack
    this.onUpdate = undefined;
    this.onStart = undefined;
    this.onRun = undefined;
    this.onEnd = undefined;

    this.autoplay = true;
    this.paused = true;
    this.began = false;
    this.completed = false;
    this.reversed = false;

    this.direction = 'normal';
    this.easing = easing.linear.none;
    this.loop = 0;
    this.delay = 0;
    this.round = 0;
    this.currentTime = 0;
    this.remaining = 0;
    this.elasticity = 500;
    this.duration = 1000;

    this.now = 0;
    this.startTime = 0;
    this.lastTime = 0;

    this.targets = undefined;
    this.tweens = undefined;

    this._next = null;
    this._prev = null;
    this._engine = null;
  }

  init(params = {}) {
    this.targets = params.targets;
    this.tweens = getTweens(params.properties, this.targets);
    getProperties(params.options, this);

    this.reset();

    if (this.autoplay) {
      this.play();
    }
  }

  adjustTime(time) {
    return this.reversed ? this.duration - time : time;
  }

  toggleTaskDirection() {
    this.reversed = !this.reversed;
  }

  countIteration() {
    if (this.remaining && this.remaining !== true) {
      this.remaining--;
    }
  }

  setCallback(cb) {
    if (this[cb]) this[cb](this);
  }

  setAnimationsProgress(time) {
    const start = this.delay;
    const elapsed = minMaxValue(time - start, 0, this.duration) / this.duration;
    const eased = isNaN(elapsed) ? 1 : this.easing(elapsed);

    this.tweens.forEach((tween) => {
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
    this.currentTime = time;
  }

  setTaskProgress(engineTime) {
    const duration = this.duration;
    const start = this.delay;
    const time = this.adjustTime(engineTime);

    if (time >= 0 || !duration) {
      if (!this.began) {
        this.began = true;
        this.setCallback('onStart');
      }
      this.setCallback('onRun');
    }

    if (time > 0 && time < duration) {
      this.setAnimationsProgress(time);
    }

    this.setCallback('onUpdate');
    if (engineTime >= duration) {
      if (this.remaining) {
        this.startTime = this.now;
        this.countIteration();
        if (this.direction === 'alternate') this.toggleTaskDirection();
      } else {
        this.pause();
        if (!this.completed) {
          this.completed = true;
          this.setCallback('onEnd');
        }
      }
      this.lastTime = 0;
    }
  }

  tick(t) {
    this.now = t;
    if (!this.startTime) this.startTime = this.now;
    const engineTime = this.lastTime + this.now - this.startTime;
    this.setTaskProgress(engineTime);
  }

  seek(time) {
    this.setTaskProgress(this.adjustTime(time));
  }

  pause() {
    if (this._prev) {
      this._prev._next = this._next;
    } else {
      this._engine.activeTasks._head = this._next;
    }

    if (this._next) {
      this._next._prev = this._prev;
    } else {
      this._engine.activeTasks._tail = this._prev;
    }

    this._next = null;
    this._prev = null;
    this._engine.activeTasks._count -= 1;

    this.paused = true;
  }

  play() {
    if (!this.paused) return;
    this.paused = false;
    this.startTime = 0;
    this.lastTime = this.adjustTime(this.currentTime);

    if (!this._engine.activeTasks._tail) {
      this._engine.activeTasks._head = this;
    } else {
      this._engine.activeTasks._tail._next = this;
      this._prev = this._engine.activeTasks._tail;
    }
    this._engine.activeTasks._tail = this;
    this._engine.activeTasks._count += 1;
  }

  reverse() {
    this.toggleTaskDirection();
    this.startTime = 0;
    this.lastTime = this.adjustTime(this.currentTime);
  }

  restart() {
    this.pause();
    this.reset();
    this.play();
  }

  reset() {
    const direction = this.direction;
    const loops = this.loop;
    this.currentTime = 0;
    this.progress = 0;
    this.paused = true;
    this.began = false;
    this.completed = false;
    this.reversed = direction === 'reverse';
    this.remaining = direction === 'alternate' && loops === 1 ? 2 : loops;
    this.setAnimationsProgress(0);
  }
}

export { vtweenEngine };