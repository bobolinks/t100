export class Lock {
  isLocked: boolean;
  lockedList: Array < any > ;

  constructor() {
    this.isLocked = false;
    this.lockedList = [];
  }

  /* 若处于未上锁阶段（isLocked = false），则将isLocked改为true，并直接返回promise.resolve;
   *  若处于上锁阶段，则返回一个promise，并将promise的resolve函数记录到lockedList，在unlock时，完成resolve
   */
  lock() {
    if (this.isLocked) {
      return new Promise((rs) => {
        this.lockedList.push(rs);
      });
    } else {
      this.isLocked = true;
      return Promise.resolve();
    }
  }

  /*
   * 1. 将lockList中首个元素移除出列，并且resolve
   * 2. 将this.isLocked更改为false
   */
  unLock() {
    if (this.lockedList.length > 0) {
      const resolveOfLastItem = this.lockedList.shift(); // 公平锁，先进先出
      resolveOfLastItem();
    }
    this.isLocked = false;
  }
}

export default {
  imageFromUrl(url: string) {
    const img = new Image();
    img.src = url;
    return img;
  }
};
