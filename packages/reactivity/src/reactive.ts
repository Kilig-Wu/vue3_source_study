import { isObject } from "@vue/shared";
import { mutableHandlers, ReactiveFlags } from "./baseHandler";

//将数据转成响应式的数据 只能做对象的代理
const reactiveMap = new WeakMap()   //key只能是对象

export function reactive(target) {
    if(!isObject(target)) {
        return
    }
    if(target[ReactiveFlags.IS_REACTIVE]) {
        return target   //如果目标对象是一个代理对象，直接将该对象返回
    }
    let exitProxy = reactiveMap.get(target);
    if(exitProxy) {
        return exitProxy   //避免一个对象多次代理，代理对象却不相等(返回同一个代理)
    }
    //并没有重新定义属性,只是代理,在取值的时候会调用
    const proxy = new Proxy(target, mutableHandlers)
    reactiveMap.set(target, proxy)
    return proxy
}