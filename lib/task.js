import { vec2, vec3, vec4, color3, color4, quat } from 'vmath';
import { easing } from './easing';

function minMaxValue(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function getCloneFromType(type, value) {
  if (type === 'float') {
    return value;
  } else if (type === 'vec2') {
    return vec2.clone(value);
  } else if (type === 'vec3') {
    return vec3.clone(value);
  } else if (type === 'quat') {
    return quat.clone(value);
  }

  return null;
}

function getValueFromType(type, value) {
  let ret;

  if (type === 'float') {
    return value;
  } else if (type === 'vec2') {
    ret = vec2.create();
    vec2.set(ret, value[0], value[1]);
    return ret;
  } else if (type === 'vec3') {
    ret = vec3.create();
    vec3.set(ret, value[0], value[1], value[2]);
    return ret;
  } else if (type === 'quat') {
    ret = quat.create();
    quat.set(ret, value[0], value[1], value[2], value[3]);
    return ret;
  }

  return null;
}

function lerpFromType(type) {
  if (type === 'float') {
    return (to, from, t) => { ((to - from) * t) + from; };
  } else if (type === 'vec2') {
    return vec2.lerp;
  } else if (type === 'vec3') {
    return vec3.lerp;
  } else if (type === 'quat') {
    return quat.lerp;
  }
}

function _createAnimations(targets, props, opts) {
  let anims = [];
  let maxDuration = opts.duration;

  if (targets instanceof Array) {
    for (let i = 0; i < targets.length; ++i) {
      let target = targets[i];

      for (let name in props) {
        let propInfo = props[name];

        let duration = propInfo.duration;
        if (duration === undefined) {
          duration = opts.duration;
        } else {
          if (duration >= maxDuration) {
            maxDuration = duration;
          }
        }

        let delay = propInfo.delay;
        if (delay === undefined) {
          delay = opts.delay;
        }

        let easing = propInfo.easing;
        if (easing === undefined) {
          easing = opts.easing;
        }

        let elasticity = propInfo.elasticity;
        if (elasticity === undefined) {
          elasticity = opts.elasticity;
        }

        let type = propInfo.type;

        let to = getValueFromType(type, propInfo.value);

        let from = getCloneFromType(type, target[name]);

        anims.push({
          target,
          property: name,
          type: type,
          duration,
          delay,
          easing,
          elasticity,
          lerp: lerpFromType(type),
          to: to,
          from: from
        });
      }
    }
  }
  opts.duration = maxDuration;

  return anims;
}

export default class Task {
  constructor(engine, targets, props, opts) {
    this._next = null;
    this._prev = null;
    this._engine = engine;

    // animation options
    this.loop = 1;
    if (opts.loop !== undefined) {
      this.loop = opts.loop;
    }

    this.direction = 'normal';
    if (opts.direction !== undefined) {
      this.direction = opts.direction;
    }

    this.autoplay = true;
    if (opts.autoplay !== undefined) {
      this.autoplay = opts.autoplay;
    }

    this.duration = 1000;
    if (opts.duration !== undefined) {
      this.duration = opts.duration;
    }

    // callbacks
    this.update = opts.update;
    this.start = opts.start;
    this.run = opts.run;
    this.end = opts.end;

    // create animations
    this._animations = _createAnimations(targets, props, opts);

    this.paused = true;
    this.began = false;
    this.completed = false;
    this.reversed = false;

    this.currentTime = 0;
    this.remaining = 0;
    this.now = 0;
    this.startTime = 0;
    this.lastTime = 0;

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
    for (let i = 0; i < this._animations.length; ++i) {
      let anim = this._animations[i];

      const elapsed = minMaxValue(time - anim.delay, 0, anim.duration) / anim.duration;
      const eased = isNaN(elapsed) ? 1 : anim.easing(elapsed);
      
      anim.lerp(anim.target[anim.property],anim.from, anim.to, eased);
    }

    this.currentTime = time;
  }

  _setProgress(t) {
    const tDuration = this.duration;
    const tTime = this.adjustTime(t);
    
    if (tTime >= 0 || !tDuration) {
      if (!this.began) {
        this.began = true;
        this.setCallback('start');
      }
      this.setCallback('run');
    }

    if (tTime > 0 && tTime < tDuration) {
      this.setAnimationsProgress(tTime);
    }

    this.setCallback('update');
    if (t >= tDuration) {
      if (this.remaining) {
        this.startTime = this.now;
        this.countIteration();
        if (this.direction === 'alternate') this.toggleTaskDirection();
      } else {
        this.pause();
        if (!this.completed) {
          this.completed = true;
          this.setCallback('end');
        }
      }
      this.lastTime = 0;
    }
  }

  tick(t) {
    this.now = t;
    if (!this.startTime) this.startTime = this.now;
    const engineTime = this.lastTime + this.now - this.startTime;
    this._setProgress(engineTime);
  }

  seek(time) {
    this._setProgress(this.adjustTime(time));
  }

  pause() {
    this._engine._remove(this);
    this.paused = true;
  }

  play() {
    if (!this.paused) {
      return;
    }
    this.paused = false;
    this.startTime = 0;
    this.lastTime = this.adjustTime(this.currentTime);

    this._engine._add(this);
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