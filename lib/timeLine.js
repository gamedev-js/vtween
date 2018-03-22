
/*
timeLine -> track -> key
{
    tracks : [{
            target:ent.pos,
            keys:[{
                  value : [1,1,1],
                  duration : 10  
                },
            ],
        }
    ],
    option : loop
}
*/

import { vec2, vec3, quat } from 'vmath';
import { easing } from './easing';

function minMaxValue(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function getOptions(optionsProp, obj) {
  for (var prop in optionsProp) {
    if (obj[prop] !== undefined) {
      obj[prop] = props[prop];
    }
  }
}

function changeType(val) {
  let ret;
  let retLength;
  if (val.length === 1) {
    ret = val[0];
    retLength = 1;
  } else if (val.length === 2) {
    ret = vec2.create();
    vec2.set(ret, val[0], val[1]);
    retLength = 2;
  } else if (val.length === 3) {
    ret = vec3.create();
    vec3.set(ret, val[0], val[1], val[2]);
    retLength = 3;
  } else if (val.length === 4) {
    ret = quat.create();
    quat.set(ret, val[0], val[1], val[2], val[3]);
    retLength = 4;
  }
  return { object: ret, objectLength: retLength };
}

function getKeys(trackTarget, keysProp) {
  let keys = [];
  let prevKey;

  for (let i = 0; i < keysProp.length; i++) {
    const keyProp = keysProp[i];
    const duration = keyProp.duration !== undefined ? keyProp.duration : 1;
    const delay = keyProp.delay !== undefined ? keyProp.delay : 0;
    const startTime = prevKey ? prevKey.endTime : 0;
    const value = changeType(keyProp.value);
    let key = {
      duration: duration,
      delay: delay,
      startTime: startTime,
      endTime: startTime + duration + delay,
      to: value.object,
      from: prevKey ? prevKey.to : Object.assign(trackTarget),
      sign: value.objectLength,
    }

    prevKey = key;
    keys.push(key);
  }

  return keys;
}

function getTracks(tracksProp) {
  let tracks = [];
  for (let i = 0; i < tracksProp.length; i++) {
    const trackProp = tracksProp[i];
    let keys = getKeys(trackProp.target, trackProp.keys);

    const startTime = keys[0].startTime;
    const lastKeyId = keys.length - 1;
    const endTime = keys[lastKeyId].endTime;
    const duration = endTime - startTime;

    let track = {
      target: trackProp.target,
      keys: keys,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
    }
    tracks.push(track);
  }

  return tracks;
}

//find max duration
function findMaxDuration(tracks) {
  let maxDuration = 0;
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].duration >= maxDuration) {
      maxDuration = tracks[i].duration;
    }
  }
  return maxDuration;
}

class timeLine {
  constructor(params = {}) {
    this.tracks = getTracks(params.tracks);
    this.duration = findMaxDuration(this.tracks);
    this.direction = 'normal';
    this.now = 0;
    this.startTime = 0;
    this.endTime = 0;
    this.lastTime = 0;
    this.currentTime = 0;
    this.remaining = 0;
    this.autoplay = true;
    this.paused = true;
    this.began = false;
    this.completed = false;
    this.reversed = false;
    this.onUpdate = undefined;
    this.onStart = undefined;
    this.onRun = undefined;
    this.onEnd = undefined;

    getOptions(params.options, this);
    this.reset();

    if (this.autoplay) this.play();
  }

  tick(t) {
    this.now = t;
    if (!this.startTime) this.startTime = this.now;
    const engineTime = this.lastTime + this.now - this.startTime;
    this.setTimeLineProgress(engineTime);
  }

  setTimeLineProgress(engineTime) {
    const tlduration = this.duration;
    const tlTime = this.adjustTime(engineTime);

    if (tlTime >= 0 || !tlduration) {
      if (!this.began) {
        this.began = true;
        this.setCallback('onStart');
      }
      this.setCallback('onRun');
    }

    if (tlTime > 0 && tlTime < tlduration) {
      this.setTracksProgress(tlTime);
    }

    this.setCallback('onUpdate');
    if (engineTime >= tlduration) {
      if (this.remaining) {
        this.startTime = this.now;
        this.countIteration();
        if (this.direction === 'alternate') this.toggleTimeLineDirection();
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

  setTracksProgress(tlTime) {
    for (let i = 0; i < this.tracks.length; i++) {
      const track = this.tracks[i];

      for (let j = 0; j < track.keys.length; j++) {
        const key = track.keys[j];
        if (key.startTime <= tlTime && key.endTime >= tlTime) {
          //compute elapsed
          const elapsed = minMaxValue(tlTime - key.startTime - key.delay, 0, key.duration) / key.duration;
          const eased = isNaN(elapsed) ? 1 : elapsed;//this.easing(elapsed);

          //lerp
          if (key.sign === 1) {
            track.target = ((key.to - key.from) * eased) + key.from;
          } else if (key.sign === 2) {
            vec2.lerp(track.target, key.from, key.to, eased);
          } else if (key.sign === 3) {
            vec3.lerp(track.target, key.from, key.to, eased);
          } else if (key.sign === 4) {
            quat.lerp(track.target, key.from, key.to, eased);
          }

          break;
        } else if (key.startTime > tlTime) {
          //lerp
          if (key.sign === 1) {
            track.target = ((key.to - key.from) * 0) + key.from;
          } else if (key.sign === 2) {
            vec2.lerp(track.target, key.from, key.to, 0);
          } else if (key.sign === 3) {
            vec3.lerp(track.target, key.from, key.to, 0);
          } else if (key.sign === 4) {
            quat.lerp(track.target, key.from, key.to, 0);
          }
        } else if (key.endTime < tlTime) {
          //lerp
          if (key.sign === 1) {
            track.target = ((key.to - key.from) * 1) + key.from;
          } else if (key.sign === 2) {
            vec2.lerp(track.target, key.from, key.to, 1);
          } else if (key.sign === 3) {
            vec3.lerp(track.target, key.from, key.to, 1);
          } else if (key.sign === 4) {
            quat.lerp(track.target, key.from, key.to, 1);
          }
        }
      }
    }
    this.currentTime = tlTime;
  }

  adjustTime(time) {
    return this.reversed ? this.duration - time : time;
  }

  setCallback(cb) {
    if (this[cb]) this[cb](this);
  }

  toggleTimeLineDirection() {
    this.reversed = !this.reversed;
  }

  countIteration() {
    if (this.remaining && this.remaining !== true) {
      this.remaining--;
    }
  }

  pause() {
    this.paused = true;
  }

  reverse() {
    this.toggleTimeLineDirection();
    this.startTime = 0;
    this.lastTime = this.adjustTime(this.currentTime);
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
    this.setTracksProgress(0);
  }

  play() {
    if (!this.paused) return;
    this.paused = false;
    this.startTime = 0;
    this.lastTime = this.adjustTime(this.currentTime);
  }

  restart() {
    this.pause();
    this.reset();
    this.play();
  }
}

export { timeLine };

