
class ReactiveEffect {
    private _fn: any;

    constructor(fn) {
        this._fn = fn;
    }
    run() {
        activeEffect = this;
        this._fn();
    }
}


const targetMap = new Map();
export function track (target, key) {
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

    dep.add(activeEffect);
    console.log(dep)
}


export function trigger(target, key){
    let depMap = targetMap.get(target);
    let dep = depMap.get(key);

    for (const effect of dep) {
        effect.run();
    }
}

let activeEffect;
export function effect(fn) {
    //fn
    const _effect = new ReactiveEffect(fn);//面向对象思想

    _effect.run();
}