import { vec2, vec3, quat } from 'vmath';

function minMaxValue(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function cloneObject(o) {
  let clone = {};
  for (let p in o) clone[p] = o[p];
  return clone;
}

function getProperties(props, obj) {
  for (let prop in props) {
    if (obj[prop] !== undefined) {
      obj[prop] = props[prop];
    }
  }
}

function getTweens(anim, targets) {
  const tweens = anim;
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

class vtween {
  constructor(params = {}) {
    this.now = 0
    this.startTime = 0;
    this.lastTime = 0;
    this.delay = 0;
    this.duration = 1000;
    this.easing = easing.linear.none;
    this.direction = '';
    this.loop = false;
    this.reversed = false;
    this.autoPlay = false;
    this.begin = false;
    this.end = false;
    this.onUpdate = null;
    this.onStart = null;
    this.onRun = null;
    this.onEnd = null;

    this.targets = params.targets;
    this.properties = getProperties(params.properties, this);
    this.tweens = getTweens(params.anim, this.targets);
  }

  adjustTime(time) {
    return this.reversed ? this.duration - time : time;
  }

  toggleDirection() {
    this.reversed = !this.reversed;
  }

  pause() { }

  reverse() {
    toggleInstanceDirection();
    this.startTime = 0;
    this.lastTime = this.adjustTime(this.now);
  }

  tick(t) {
    this.now = t;
    if (!this.startTime) this.startTime = this.now;
    const engineTime = this.lastTime + this.now - this.startTime;
    const insTime = this.adjustTime(engineTime);
    const insStart = this.delay;

    if (insTime >= this.startTime || !this.duration) {
      if (!this.begin) {
        this.begin = true;
        if (this.onStart !== null) {
          this.onStart();
        }
      }
      if (this.onRun !== null) {
        this.onRun();
      }
    }

    const elapsed = minMaxValue(insTime - insStart, 0, this.duration) / this.duration;
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

    if (this.onUpdate !== null) {
      this.onUpdate();
    }

    if (engineTime >= this.duration) {
      if (this.loop) {
        this.startTime = this.now;
        if (this.direction == 'alternate') {
          this.toggleDirection();
        }
      } else {
        if (!this.end) {
          this.pause();
          this.end = true;
          if (this.onEnd !== null) {
            this.onEnd();
          }
        }
      }
      this.lastTime = 0;
    }
  }
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

export { easing, vtween };