import { track, trigger } from "./effect";

export const enum ReactiveFlags {
    IS_REACTIVE= '__v_isReactive'
}
export const mutableHandlers =  {
    get(target, key, receiver) {  //receiver就是Proxy自己
        if(key === ReactiveFlags.IS_REACTIVE) {
            return true
        }
        track(target, 'get', key)
        //去代理对象上取值
        return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
        let oldValue = target[key];
        let result = Reflect.set(target, key, value, receiver);
        if(oldValue != value) {  //值变化了
            //要更新
            trigger(target, 'set', key, value, oldValue)
        }
        return result
    }
}

