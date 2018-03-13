const tap = require('./tap');
const { vtween } = require('../dist/vtween');
const vmath = require('vmath');
const { vec2, vec3 } = vmath;

class entity {
	constructor(params = {}) {
		this.lfloat = params.lfloat;
		this.lvec2 = params.lvec2;
		this.lvec3 = params.lvec3;
	}
}

tap.test('vtween_direction', t => {

	let vec2_a, vec3_a;
	vec2_a = vec2.create();
	vec2.set(vec2_a, 0, 0);


	vec3_a = vec3.create();
	vec3.set(vec3_a, 0, 0, 0);


	let ent_prop = {
		lfloat: 0,
		lvec2: vec2_a,
		lvec3: vec3_a
	}


	ent = new entity(ent_prop);
	console.log(ent.lvec3);

	let vt = new vtween({
		targets: ent,
		anim: {
			lvec3: [1, 1, 1]
		},
		properties: {
			loop: true,
		}
	});
	vt.direction = 'alternate';

	vt.tick(100);
	vt.tick(1200);
	vt.tick(1400);

	console.log(ent.lvec3);
	t.end();

})