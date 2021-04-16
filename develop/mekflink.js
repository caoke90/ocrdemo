/**
 文字识别 隐马尔可夫模型
 共3+n种状态S B Mn E
 AMap 为状态转移概率矩阵 4*4,表示从{S B M E}到{S B M E}的概率
 BMap 为当前字属于某种状态{S B M E}的概率
 * */
//有限状态
const S = ['S', 'B', 'Mn', 'E']

const mekflink = {
  empty: {S: 0.05},
  AMap: {
    'S-S': 1000,
    'S-B': 1000,
    'E-B': 1000,
    'E-S': 1000,
  },
  getData(){
    const obj={
      AMap:this.AMap,
      BMap:this.BMap,
      CMap:this.CMap,
    }
    return obj;
  },
  BMap: {},
  CMap: {},//用于识别结果
  DMap:{},
  AMapGl: {},
  BMapGl: {},
  add(text, val) {
    this.DMap[text]=val;
    if (text.length > 1) {
      for (let i = 0; i < text.length; i++) {
        if (i === 0) {
          this.push(text[i], 'B')
          const t0 = 'E';
          const t1 = 'B';
          this.pushState(t0, t1, text[text.length - 1], text[i], val)
        } else {
          const t0 = i === 1 ? 'B' : 'M' + (i - 1);
          const t1 = i === text.length - 1 ? 'E' : 'M' + i;
          this.push(text[i], t1)
          this.pushState(t0, t1, text[i - 1], text[i], val)
        }
      }
    } else {

    }
  },
  pushState(t0N, t1N, t0, t1, val) {
    const AMap = this.AMap;
    const key = t0N + '-' + t1N
    if (!AMap[key]) {
      AMap[key] = 0
    }
    AMap[key]++;

    const CMap = this.CMap;
    const key2 = key + '-' + t0 + '-' + t1
    if (!CMap[key2]) {
      CMap[key2] = []
    }
    if (CMap[key2].indexOf(val) === -1) {
      CMap[key2].push(val)
    }
  },
  push(key, state) {
    const BMap = this.BMap
    if (!BMap[key]) {
      BMap[key] = {
        S:1
      }
    }
    if (!BMap[key][state]) {
      BMap[key][state] = 0
    }
    BMap[key][state]++;
  },
  //生成模型
  makeGl() {
    const AMap = this.AMap;
    const BMap = this.BMap;
    const AMapGl = this.AMapGl;
    const BMapGl = this.BMapGl;
    //统计A
    const AMapT = {}
    for (let key in AMap) {
      const [t0, t1] = key.split('-')
      if (!AMapT[t0]) {
        AMapT[t0] = 0;
      }
      AMapT[t0] = AMapT[t0] + AMap[key];
    }
    for (let key in AMap) {
      const [t0, t1] = key.split('-')
      AMapGl[key] = AMap[key] / AMapT[t0]
    }
    //统计B
    for (let key in BMap) {
      let t = 0;
      for (let k in BMap[key]) {
        t = t + BMap[key][k]
      }
      const obj = Object.create(this.empty)
      for (let k in BMap[key]) {
        obj[k] = BMap[key][k] / t
      }
      BMapGl[key] = obj;
    }
    return {
      AMapGl, BMapGl
    }
  },
  getT1Arr(t0Obj, BObj) {
    const AMapGl = this.AMapGl;
    const t1Obj = [];
    let allgl = 0;
    for (let t1 in BObj) {
      let maxLink;
      t0Obj.forEach(function (link) {
        const t0 = link.t0;
        const k = t0 + '-' + t1;
        if (AMapGl[k]) {
          const gl = link.gl * AMapGl[k] * BObj[t1]
          if (gl > 0) {
            if (!maxLink) {
              maxLink = {
                t0: t1,
                gl: gl,
                data: link.data
              }
            } else if (gl > maxLink.gl) {
              maxLink = {
                t0: t1,
                gl: gl,
                data: link.data
              }
            }
          }
        }
      })
      if (maxLink && maxLink.gl * (t1Obj.length + 1) > allgl) {
        allgl = allgl + maxLink.gl;
        maxLink.data = maxLink.data + '-' + maxLink.t0
        t1Obj.push(maxLink)
      }
    }
    t1Obj.forEach(function (link) {
      link.gl = link.gl * 100 / allgl;
    })
    return t1Obj;
  },
  fastSolve(text) {
    const AMapGl = this.AMapGl;
    const BMapGl = this.BMapGl;
    const CMap = this.CMap;
    const DMap = this.DMap;
    const len = text.length;
    // console.log('状态转移概率',AMapGl)
    // console.log('特征统计概率',BMapGl)
    //马尔可夫链条
    //获取当前状态可能的下一个状态
    let t0Obj = [{
      t0: 'S',
      gl: 1,
      data: 'S'
    }, {
      t0: 'B',
      gl: 1,
      data: 'B'
    }]
    for (let i = 1; i < len; i++) {
      t0Obj = this.getT1Arr(t0Obj, BMapGl[text[i]] || Object.create(this.empty))
    }
    t0Obj.sort(function (p1, p2) {
      return p2.gl - p1.gl
    })
    if (t0Obj.length > 0) {
      const arr = t0Obj[0].data.split('-');

      let start;
      const data = [];
      for (let i = 0; i < len; i++) {
        if (arr[i] === 'B') {
          start = i;
        } else if (arr[i] === 'E') {
          data.push([start, i + 1])
        }
      }
      const result = []
      data.forEach(function (tArr) {
        const key=text.substring(tArr[0],tArr[1])
        if(DMap[key]){
          result.push(DMap[key])
          return;
        }
        const kmap = {}
        let kmax;
        let premax;
        let alen = tArr[1] - tArr[0];
        for (let i = tArr[0]; i < tArr[1]; i++) {
          let key;
          if(i===tArr[0]){
            key='E'+'-'+'B'+'-'+text[i - 1] + '-' + text[i]
          }else{
            key = arr[i - 1] + '-' + arr[i] + '-' + text[i - 1] + '-' + text[i]
          }
          if (CMap[key]) {
            CMap[key].forEach(function (k, h) {
              if (!kmap[k]) {
                kmap[k] = 1;
              } else {
                kmap[k]++;
              }
              kmax = kmax || k;
              if (kmax !== k && kmap[k] >= kmap[kmax]) {
                premax = kmax;
                kmax = k;
              }
            })
            if (premax && kmap[premax] + (alen--) < kmap[kmax]) {
              break;
            }
          }
        }
        if (kmax) {
          result.push(kmax)
        }
      })
      return result
    }
  }
}
if(typeof module==='object'){
  module.exports = mekflink;
}
// console.time('time')
// // // demo
// const arrH=[{
//   labels:['ddm6bieggfge6222'],
//   key:'文',
//   name:'文',
// },{
//   labels:['ddm6biegdfge6222'],
//   key:'字',
//   name:'字',
// },{
//   labels:['ddm6biegefge6222'],
//   key:'识',
//   name:'识',
// },{
//   labels:['ddm6biegsfge6222'],
//   key:'别',
//   name:'别',
// },{
//   labels:['ddm6biefgfge6222'],
//   key:'！',
//   name:'！',
// }]
// arrH.forEach(function (item) {
//   item.labels.forEach(function (str) {
//     mekflink.add(str,item.key)
//   })
// })
// mekflink.makeGl()
// const text='ddm6bieggfge622212121ddm6biegdfge6222sfsaffsafddm6biegefge6222adfadddm6biegsfge6222ddm6biefgfge6222ddm6biefgf6';
// const arr=mekflink.fastSolve(text);
// console.timeEnd('time')
// console.log(arr)