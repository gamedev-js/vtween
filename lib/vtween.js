import { vec2, vec3, quat } from 'vmath';

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
  round: 0
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

  return mergeObjects(instanceSettings, {
    children: [],
    targets: targets,
    tweens: tweens
  });
}

//core
let activeInstances = [];

var vtweenEngine = {
  tick: function (t) {
    const activeLength = activeInstances.length;
    if (activeLength) {
      let i = 0;
      while (i < activeLength) {
        if (activeInstances[i]) activeInstances[i].tick(t);
        i++;
      }
    }
  },
  instanceNum: function () {
    return activeInstances.length;
  }
}

function vtween(params = {}) {
  let now, startTime, lastTime = 0;

  let resolve = null;

  let instance = createNewInstance(params);
  instance.easing = easing.linear.none;

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
    const i = activeInstances.indexOf(instance);
    if (i > -1) activeInstances.splice(i, 1);
    instance.paused = true;
  }

  instance.play = function () {
    if (!instance.paused) return;
    instance.paused = false;
    startTime = 0;
    lastTime = adjustTime(instance.currentTime);
    activeInstances.push(instance);
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

  return instance;
}

var easing = {
  linear: {
    none: function (k) {
      return k;
    }
  },
  quadratic: {
    in: function (k) {
      return k * k;
    },
    out: function (k) {
      return k * (2 - k);
    },
    inOut: function (k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k;
      }
      return - 0.5 * (--k * (k - 2) - 1);
    }
  },
  cubic: {
    in: function (k) {
      return k * k * k;
    },
    out: function (k) {
      return --k * k * k + 1;
    },
    inOut: function (k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k;
      }
      return 0.5 * ((k -= 2) * k * k + 2);
    }
  },
  quartic: {
    in: function (k) {
      return k * k * k * k;
    },
    out: function (k) {
      return 1 - (--k * k * k * k);
    },
    inOut: function (k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k * k;
      }
      return - 0.5 * ((k -= 2) * k * k * k - 2);
    }
  },
  quintic: {
    in: function (k) {
      return k * k * k * k * k;
    },
    out: function (k) {
      return --k * k * k * k * k + 1;
    },
    InOut: function (k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k * k * k;
      }
      return 0.5 * ((k -= 2) * k * k * k * k + 2);
    }
  },
  sinusoidal: {
    in: function (k) {
      return 1 - Math.cos(k * Math.PI / 2);
    },
    out: function (k) {
      return Math.sin(k * Math.PI / 2);
    },
    inOut: function (k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }
  },
  exponential: {
    in: function (k) {
      return k === 0 ? 0 : Math.pow(1024, k - 1);
    },
    out: function (k) {
      return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);
    },
    inOut: function (k) {
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      if ((k *= 2) < 1) {
        return 0.5 * Math.pow(1024, k - 1);
      }
      return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);
    }
  },
  circular: {
    in: function (k) {
      return 1 - Math.sqrt(1 - k * k);
    },
    out: function (k) {
      return Math.sqrt(1 - (--k * k));
    },
    inOut: function (k) {
      if ((k *= 2) < 1) {
        return - 0.5 * (Math.sqrt(1 - k * k) - 1);
      }
      return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    }
  },
  elastic: {
    in: function (k) {
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
    },
    out: function (k) {
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
    },
    inOut: function (k) {
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      k *= 2;
      if (k < 1) {
        return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
      }
      return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;
    }
  },
  back: {
    in: function (k) {
      var s = 1.70158;
      return k * k * ((s + 1) * k - s);
    },
    out: function (k) {
      var s = 1.70158;
      return --k * k * ((s + 1) * k + s) + 1;
    },
    inOut: function (k) {
      var s = 1.70158 * 1.525;
      if ((k *= 2) < 1) {
        return 0.5 * (k * k * ((s + 1) * k - s));
      }
      return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    }
  },
  bounce: {
    in: function (k) {
      return 1 - TWEEN.Easing.Bounce.Out(1 - k);
    },
    out: function (k) {
      if (k < (1 / 2.75)) {
        return 7.5625 * k * k;
      } else if (k < (2 / 2.75)) {
        return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
      } else if (k < (2.5 / 2.75)) {
        return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
      } else {
        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
      }
    },
    inOut: function (k) {
      if (k < 0.5) {
        return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
      }
      return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
    }
  }
};

export { easing, vtween, vtweenEngine };