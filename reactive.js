class Dep {
  constructor() {
    this.subscribers = new Set();
  }

  // 收集依赖
  // addEffect(effect) {
  //   this.subscribers.add(effect);
  // }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }
  // 发布通知
  notify() {
    this.subscribers.forEach(effect => {
      effect();
    });
  }
}

// const dep = new Dep();

let activeEffect = null;
function watchEffect(effect) {
  activeEffect = effect;
  effect();
  activeEffect = null;
}

// Map({key: value}): key是一个字符串
// WeakMap({key(对象): value}): key是一个对象, 弱引用
const targetMap = new WeakMap();
function getDep(target, key) {
  // 1.根据对象(target)取出对应的Map对象
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  // 2.取出具体的dep对象
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }
  return dep;
}

function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const dep = getDep(target, key);
      dep.depend(); // 自动收集依赖
      return target[key];
    },
    set(target, key, newValue) {
      const dep = getDep(target, key);
      target[key] = newValue;
      dep.notify();
    }
  });
}

const info = reactive({ count: 2, name: "aaa" });
const foo = reactive({ height: 1.88 });

watchEffect(function () {
  console.log("effect1", info.count * 2);
});
watchEffect(function () {
  console.log("effect2", info.count * info.count);
});
watchEffect(function () {
  console.log("effect3", info.count + 10, info.name);
});
watchEffect(function () {
  console.log("effect4", foo.height);
});

// info.count++;
foo.height = 2;
// dep.notify();
