import { extend } from "../shared";

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    private _fn: any;
    deps = [];
    active = true;
    onStop? :() => void;//任意值
    public scheduler:Function | undefined;
    constructor(fn, scheduler?:Function) {
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        //1.会收集依赖
        //shouldTrack 来做区分
        if(!this.active){
            return this._fn();
        }
        //set
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();

        //reset
        shouldTrack = false;
        return result;
    }
    stop(){
        if(this.active){
            cleanupEffect(this);
            this.onStop && this.onStop();
            this.active = false;
        }
        
    }
}

function cleanupEffect(effect){
    effect.deps.forEach((dep: any)=>{
        dep.delete(effect);
    });
    effect.deps.length = 0;
}

const targetMap = new Map();
//收集依赖
export function track (target, key) {
    if(!isTracking()) return;
    //target -> key ->dep
    let depMap = targetMap.get(target);
    
    if(!depMap){
        depMap = new Map();
        targetMap.set(target, depMap);
    }

    let dep = depMap.get(key);
    if(!dep){
        dep = new Set();
        depMap.set(key, dep);
    }
    if (dep.has(activeEffect)) return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
    // console.log(dep)
}
function isTracking(){
    return shouldTrack && activeEffect !== undefined
}

//触发依赖
export function trigger(target, key){
    let depMap = targetMap.get(target);
    let dep = depMap.get(key);

    for (const effect of dep) {
        if(effect.scheduler){
            effect.scheduler();
        }else{
            effect.run();
        }
    }
}


export function effect(fn,options: any = {}) {
    //fn
    const _effect = new ReactiveEffect(fn, options.scheduler);//面向对象思想
    // _effect.onStop = options.onStop;
    //options
    Object.assign(_effect, options);
    //extend
    extend(_effect, options);
    _effect.run();

    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect;

    // return _effect.run.bind(_effect);
    return runner;
}

export function stop(runner){
    runner.effect.stop();
}
