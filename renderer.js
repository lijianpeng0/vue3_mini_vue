const h = (tag, props, children) => {
  return {
    tag,
    props,
    children
  };
};

const mount = (vnode, container) => {
  // 创建真实dom; 在vnode 上保留 el
  const el = (vnode.el = document.createElement(vnode.tag));

  // 设置属性
  if (vnode.props) {
    for (let key in vnode.props) {
      const value = vnode.props[key];

      // 以 on 开头是方法
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  // 处理children
  if (vnode.children) {
    if (typeof vnode.children === "string") {
      el.textContent = vnode.children;
    } else {
      vnode.children.forEach(item => {
        mount(item, el);
      });
    }
  }

  // 将生成的 dom 树挂载到 根节点
  container.appendChild(el);
  console.log(vnode);
};

// patch 方法 比较新旧vnode n1:旧node n2:新node
const patch = (n1, n2) => {
  // 如果 tag 不相同 直接移除 重新 mount
  if (n1.tag !== n2.tag) {
    const parentEl = n1.el.parentElement;
    parentEl.removeChild(n1.el);
    mount(n2, parentEl);
  } else {
    // 取出 n1.el 保存给 n2.el
    const el = (n2.el = n1.el);
    console.log(n1.el);
    // 处理 props
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    // 设置 newProps
    for (const key in newProps) {
      const newValue = newProps[key];
      const oldValue = oldProps[key];
      if (newValue !== oldValue) {
        // 以 on 开头是方法
        if (key.startsWith("on")) {
          el.addEventListener(key.slice(2).toLowerCase(), newValue);
        } else {
          el.setAttribute(key, newValue);
        }
      }
    }

    // 移除 oldProps
    for (const key in oldProps) {
      // 判断 newProps 中有没有 这个 key
      // 以 on 开头是方法
      if (key.startsWith("on")) {
        const oldvalue = oldProps[key];
        el.removeEventListener(key.slice(2).toLowerCase(), oldvalue);
      } else {
        if (!(key in newProps)) {
          el.removeAttribute(key);
        }
      }
    }

    // 处理 children
    const newChildren = n2.children;
    const oldChildren = n1.children;

    if (typeof newChildren === "string") {
      if (typeof oldChildren === "string") {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren;
        }
      } else {
        el.innerHTML = newChildren;
      }
    } else {
      // newChildren 是一个数组
      if (typeof oldChildren === "string") {
        el.innerHTML = "";
        newChildren.forEach(item => {
          mount(item, el);
        });
      } else {
        // oldChildren 也是一个数组
        // 获取两个 children 中更小的 length
        const commonLength = Math.min(oldChildren.length, newChildren.length);

        for (let i = 0; i < commonLength; i++) {
          // 长度相同的部分进行 patch
          patch(oldChildren[i], newChildren[i]);
        }

        if (newChildren.length > oldChildren.length) {
          // 截去长度相同部分  剩余部分进行挂载 mount
          newChildren.slice(oldChildren.length).forEach(item => {
            mount(item, el);
          });
        }

        if (newChildren.length < oldChildren.length) {
          // 截去长度相同部分  剩余部分进行卸载 源码中为(unmount)
          oldChildren.slice(newChildren.length).forEach(item => {
            el.removeChild(item.el);
          });
        }
      }
    }
  }
};
