const getV=require('./getV')
const getStrByNum=require('./getStrByNum')
function getTzArr (posArr,grayData) {
  const tzArr=[]
  posArr.forEach(function (pos1,i) {
    const tz=getTz(pos1,grayData)
    tzArr.push(tz)
  })
  return tzArr;
}
function getSameW(v,x,y,grayData) {
  let w=1;
  while (v===getV(x+w,y,grayData)){
    w++;
  }
  return w;
}
function getSameH(v,x,y,grayData) {
  let h=1;
  while (v===getV(x,y+h,grayData)){
    h++;
  }
  return h;
}
function getTz (pos1,grayData) {
  const [x1, y1, x2, y2] = pos1
  const fArr = [];

  for (let x = x1; x < x2; x++) {
    let hu = 0;
    for (let y = y1; y < y2;y++ ) {
      const v = getV(x, y, grayData)
      if (v !== undefined) {
        hu++;
      }
    }
    fArr.push(getStrByNum(hu));
  }
  while (fArr[0]==='0'){
    fArr.shift()
  }
  while (fArr[fArr.length-1]==='0'){
    fArr.pop()
  }
  return fArr.join('');
}
function getTzY (pos1,grayData) {
  const [x1, y1, x2, y2] = pos1
  const fArr = [];
  for (let y = y1; y < y2; y++) {
    let hu = 0;
    for (let x = x1; x < x2; x++) {
      const v = getV(x, y, grayData)
      if (v !== undefined) {
        hu++;
      }
    }
    fArr.push(getStrByNum(hu));
  }
  while (fArr[0]==='0'){
    fArr.shift()
  }
  while (fArr[fArr.length-1]==='0'){
    fArr.pop()
  }
  return fArr.join('');
}
module.exports={
  getTzArr,
  getTz,
  getTzY
}