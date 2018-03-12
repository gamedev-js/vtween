
const tap =require('./tap');
const {vtween}=require('../dist/vtween');
const vmath = require('vmath');
const {vec2,vec3,quat}=vmath;

class entity{
    constructor(params = {}){
        this.lfloat=params.lfloat;
        this.lvec2=params.lvec2;
        this.lvec3=params.lvec3;
        this.lquat=params.lquat;
    }
}

tap.test('vtween_base',t=>{
    
    let vec2_a,vec3_a,quat_a;
    vec2_a = vec2.create();
    vec2.set(vec2_a,0,0);
    
    
    vec3_a = vec3.create();
    vec3.set(vec3_a,0,0,0);

    quat_a = quat.create();
    quat.set(quat_a,0,0,0,0);

    
    let ent_prop={
        lfloat : 1,
        lvec2 : vec2_a,
        lvec3 : vec3_a,
        lquat : quat_a
    }
    

    ent=new entity(ent_prop);
    console.log(ent);
    
    let vt = new vtween({targets :ent,
        anim:{
            lfloat : 1,
            lvec2 : [1,1],
            lvec3 : [1,1,1],
            lquat : [1,1,1,1]
        },
    });
    vt.tick(500);
    vt.tick(1000);
    
    
    console.log(ent);
    t.end();
    
})