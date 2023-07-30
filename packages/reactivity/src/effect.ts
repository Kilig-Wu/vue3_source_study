export let activeEffect = undefined;
function cleanupEffect(effect) {
    const { deps } = effect;  //deps里面装的是name对应的set， age对应的set
    for(let i = 0; i < deps.length; i++) {
        deps[i].delete(effect)  //解除effect，重新依赖收集
    }
    effect.deps.length = 0;
}
class ReactiveEffect {
    parent = null;
    active = true;  //这个effect默认是激活
    deps = [];
    constructor(public fn) {

    }
    run() {
        if(!this.active) {   //这里表示非激活的情况，只需要执行函数，不需要进行依赖收集
            this.fn()
        }

        //这里就要依赖收集了 核心就是将当前的effect和稍后渲染的属性关联在一起
        try {
            this.parent = activeEffect;
            activeEffect = this;
            cleanupEffect(this);
            return this.fn()   //当稍后取值操作的时候 就可以获取到全局的activeEffect了
        } finally {
            activeEffect = this.parent;
            this.parent = null
        }
    }
}
export function effect(fn) {
    //这里fn可以根据状态变化重新执行 effect可以嵌套写
    const _effect = new ReactiveEffect(fn)  //创建响应式effect
    _effect.run()  //默认先执行一次
}

//一个effect对应多个effect， 一个属性对应多个effect(多对多)
const targetMap = new WeakMap();
export function track(target, type, key) {
    //weakmap =  { 对象(map)： { name: new Set([effect1, effect2]) }}
    //对象的某个属性-》可能对应多个effect
    if(!activeEffect) {
        return
    }
    let depsMap = targetMap.get(target);  //第一次没有
    if(!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }

    let dep = depsMap.get(key)
    if(!dep) {
        depsMap.set(key, (dep = new Set()))
    }
    let shouldTrack = !dep.has(activeEffect)
    if(shouldTrack) {
        dep.add(activeEffect)
        activeEffect.deps.push(dep)  //让effect也记住对应的dep,稍后清理的时候会用到
    }
}

export function trigger(target, type, key, value, oldValue) {
    const depsMap = targetMap.get(target)
    if(!depsMap) return   //触发的值不在模板中
    let effects= depsMap.get(key);  //找到了属性对应的effect
    if(effects) {
        effects = new Set(effects);
        effects.forEach(effect => {
            //我们在执行effect的时候又要执行自己 那我们需要屏蔽掉 不要无限调用
            if(effect !== activeEffect) {
                effect.run()  //更新
            }
        });
    }
}