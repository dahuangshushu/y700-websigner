// COI ServiceWorker - 修复 GitHub Pages WebWorker/WASM 跨域问题
// 基于 https://github.com/gzuidhof/coi-serviceworker

if ('serviceWorker' in navigator) {
  (async () => {
    // 避免无限重载
    const reloadedBySelf = sessionStorage.getItem('coiReloadedBySelf');
    const shouldRegister = () => !reloadedBySelf;

    if (shouldRegister()) {
      try {
        const registration = await navigator.serviceWorker.register('/coi-sw.js', { scope: './' });
        // 标记已注册
        sessionStorage.setItem('coiReloadedBySelf', 'true');
        
        // 等待 SW 激活
        await new Promise((resolve) => {
          if (registration.active) {
            resolve();
            return;
          }
          registration.addEventListener('updatefound', () => {
            const sw = registration.installing;
            if (sw) {
              sw.addEventListener('statechange', () => {
                if (sw.state === 'activated') {
                  resolve();
                }
              });
            }
          });
        });
        
        // 重载页面以应用隔离策略
        window.location.reload();
      } catch (e) {
        console.warn('ServiceWorker 注册失败:', e);
      }
    }
  })();
}