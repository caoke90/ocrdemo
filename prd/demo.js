const PNG = require("pngjs").PNG;
const fs=require('fs')
const getGrayData=require('../develop/getGrayData')
const getV=require('../develop/getV')
const getLineArrByGrayData=require('../develop/getLineArrByGrayData')
const getStrByNum=require('../develop/getStrByNum')
const {sortAdd,sortFind}=require('../develop/sortAdd')
const {renderTextInit,renderTextToImageData}=require('../develop/renderTextToImageData')
renderTextInit()
function changeV(x,y,imageData) {
  let k=4*imageData.width*y+4*x;
  imageData.data[k]=0;
  imageData.data[k+1]=0;
  imageData.data[k+2]=0;
  imageData.data[k+3]=255;
}
function changeV1(x,y,imageData) {
  let k=4*imageData.width*y+4*x;
  // if(imageData.data[k+3]===0){
  imageData.data[k]=255;
  imageData.data[k+1]=0;
  imageData.data[k+2]=0;
  imageData.data[k+3]=255;
  // }

}
function changeV2(x,y,imageData) {
  let k=4*imageData.width*y+4*x;
  imageData.data[k]=255;
  imageData.data[k+1]=255;
  imageData.data[k+2]=255;
  imageData.data[k+3]=0;
}
function changeV3(x,y,imageData) {
  let k=4*imageData.width*y+4*x;
  imageData.data[k]=0;
  imageData.data[k+1]=0;
  imageData.data[k+2]=255;
  imageData.data[k+3]=255;
}

function setOpacity(grayData,imageData) {
  for (let y = 0; y < grayData.height; y++) {
    for (let x = 0; x < grayData.width; x++) {
      const v=getV(x,y,grayData)
      if(v===undefined){
        changeV2(x,y,imageData)
      }else{
        changeV3(x,y,imageData)
      }
    }
  }
}


function getSameH(x,y,grayData) {
  let h=1;
  while (getV(x,y+h,grayData)!==undefined){
    h++;
  }
  return h;
}
function getSameW(x,y,grayData) {
  let h=1;
  while (getV(x+h,y,grayData)!==undefined){
    h++;
  }
  return h;
}
function getTzArr (posArr,grayData) {
  const tzArr=[]
  posArr.forEach(function (pos1,i) {
    const tz=getTz(pos1,grayData)
    tzArr.push(tz)
  })
  return tzArr;
}
function getTz (pos1,grayData) {
  const [x1, y1, x2, y2] = pos1
  const fArr = [];

  for (let x = x1; x < x2; x++) {
    let hu = 0;
    for (let y = y1; y < y2; y++) {
      const v = getV(x, y, grayData)
      if (v !== undefined) {
        hu++;
      }
    }
    if(hu===0&&fArr.length===0){

    }else{
      fArr.push(getStrByNum(hu));
    }

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
    if(hu===0&&fArr.length===0){

    }else{
      fArr.push(getStrByNum(hu));
    }
  }
  return fArr.join('');
}
const prdMap=JSON.parse(fs.readFileSync('prdMap.json').toString())

function saveImageToFile(imageData,filename) {
  var buffer = PNG.sync.write(imageData, {filterType: 4});
  fs.writeFileSync(filename,buffer)
}

function demo () {
  const buff=fs.readFileSync('../data/Arial31.png');
  const imageData=PNG.sync.read(buff)
  const grayData=getGrayData(imageData)
  const posArr=getLineArrByGrayData(grayData)
  //透明
  setOpacity(grayData,imageData)

  const tzArr=getTzArr(posArr,grayData)
  tzArr.forEach(function (tz,m) {
    const pos1=posArr[m]
    const tarr=[]
    let i=0;
    let d='';
    while (i<tz.length){
      if(d===''&&tz[i]==='0'){
        i++
      }else{
        const arr=sortFind(tz,i,prdMap)
        let isOk=true;
        if(arr&&arr[2]===0){
          const data=prdMap[arr[0]]
          if(Array.isArray(data[1])&&Array.isArray(data[1][0])){
            const key2=getTzY([pos1[0]+i,pos1[1],pos1[0]+i+arr[1],pos1[3]],grayData)
            const [n,len,dis]=data[1].sortFindLen(key2)
            if(dis===0){
              tarr.push(data[1][n][1])
            }else{
              //找不到相似的
              isOk=false
            }
          }else if(Array.isArray(data[1])){
            //todo 找出最近的
            tarr.push(data[1][0])
          }else{
            tarr.push(data[1])
          }
        }
        if(isOk){
          if(d){
            tarr.push(d);
            d='';
          }
          i=i+arr[1];
        }else{
          d=d+tz[i];
          if(i===tz.length.length-1&&d){
            tarr.push(d);
            d='';
          }
          i++
        }
      }
    }
    renderTextToImageData(tarr,pos1,imageData)

    if(tarr.length>1){
      console.log('tarr',tarr)
    }
  })

  saveImageToFile(imageData,'demo2.png')
}

demo();