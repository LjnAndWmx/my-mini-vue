
class ReactiveEffect {
    private _fn: any;

    constructor(fn, public scheduler?) {
        this._fn = fn;
    }
    run() {
        activeEffect = this;
        return this._fn();
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
        if(effect.scheduler){
            effect.scheduler();
        }else{
            effect.run();
        }
    }
}

let activeEffect;
export function effect(fn,options: any = {}) {
    //fn
    const _effect = new ReactiveEffect(fn, options.scheduler);//面向对象思想

    _effect.run();

    return _effect.run.bind(_effect);
}