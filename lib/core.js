import LinkedArray from './linked-array';
import Task from './task';
import { easing } from './easing';

//core
export default class VTween {
  constructor() {
    this._activeTasks = new LinkedArray();
  }

  newTask(targets, props, opts) {
    if (opts.duration === undefined) {
      opts.duration = 1000;
    }
    if (opts.delay === undefined) {
      opts.delay = 0;
    }
    if (opts.easing === undefined) {
      opts.easing = easing.linear.none;
    }
    if (opts.elasticity === undefined) {
      opts.elasticity = 500;
    }

    if (Array.isArray(targets) === false) {
      targets = [targets];
    }

    return new Task(this, targets, props, opts);
  }

  _add(task) {
    this._activeTasks.add(task);
  }

  _remove(task) {
    this._activeTasks.remove(task);
  }

  tick(dt) {
    if (this._activeTasks.length === 0) {
      return;
    }

    let cursor = this._activeTasks.head;
    let next = cursor;

    while (cursor) {
      next = cursor._next;
      cursor.tick(dt);
      cursor = next;
    }
  }
}