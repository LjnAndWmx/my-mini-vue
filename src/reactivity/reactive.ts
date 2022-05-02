import { track, trigger } from "./effect";

function createGetter(isReadonly = false){
    return function get(target, key){
        const res = Reflect.get(target,key);
        if(!isReadonly){
            track(target, key);
        }
        return res;
    }
}

export function reactive(raw) {
    return new Proxy(raw, {

        get:createGetter(),
        set(target, key, value){
            const res = Reflect.set(target, key, value);

            //TODO 触发依赖
            trigger(target, key);
            return res;
        }
    })
}

export function readonly(raw){
    return new Proxy(raw, {
        get:createGetter(true),
        set(target, key, value){
            return true;
        }
    })
}