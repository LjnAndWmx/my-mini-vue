import { track, trigger } from "./effect";
import { ReactiveFlags } from './reactive'

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadonly = false){
    return function get(target, key){
        const res = Reflect.get(target,key);
        if(key === ReactiveFlags.IS_REACTIVE){
            return !isReadonly;
        }else if(key === ReactiveFlags.IS_READONLY){
            return isReadonly;
        }
        if(!isReadonly){
            track(target, key);
        }
        // console.log('get开始');
        // console.log(res);
        return res;
    }
}

function createSetter(){
    return function set(target, key, value){
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        // console.log('set开始');
        // console.log(res);
        return res;
    }
}
export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key:${key} set s失败 因为 target是readonly`, target);
        return true;
    }
}