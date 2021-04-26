const PNG = require("pngjs").PNG;
const fs=require('fs')
const getGrayData=require('./getGrayData')
const getV=require('./getV')
const getLineArrByGrayData=require('./getLineArrByGrayData')
const getStrByNum=require('./getStrByNum')
const getTextArr=require('./getTextArr')
const {sortAdd}=require('./sortAdd')
const {renderTextInit,renderTextToImageData}=require('./renderTextToImageData')
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
/*
textArr 文字库
tzArr 特征
rectArr 文字数据
 */
const textArr=getTextArr();
const pngArr=[]
for(let i=12;i<33;i++){
  pngArr.push(`Arial${i}.png`);
}
pngArr.reverse()
let oneMap=[]
if(!fs.existsSync('oneMap.json')){
  pngArr.forEach(function (filename) {
    const buff=fs.readFileSync('../data/'+filename);
    const imageData=PNG.sync.read(buff)
    const grayData=getGrayData(imageData)
    const posArr=getLineArrByGrayData(grayData)
    setOpacity(grayData,imageData)
    console.log(filename,posArr.length)
    posArr.forEach(function (pos1,i) {
      const tz=getTz(pos1,grayData)
      const tzY=getTzY(pos1,grayData)
      sortAdd(tz,tzY,textArr[i],oneMap)
      // renderTextToImageData(textArr[i]||'t',pos1,imageData)
    })
    saveImageToFile(imageData,'../'+filename)
  })

  fs.writeFileSync('oneMap.json',JSON.stringify(oneMap))

}else{
  oneMap=JSON.parse(fs.readFileSync('oneMap.json').toString())
}
const prdMap=[]
oneMap.forEach(function (arr) {
  const data=arr[1]
  if(data.length===1){
    if(Array.isArray(data[0][1])){
      console.log(data[0][1])
    }
    prdMap.push([arr[0],data[0][1]])
  }else{
    prdMap.push(arr)
  }
})
fs.writeFileSync('../prd/prdMap.json',JSON.stringify(prdMap))

function saveImageToFile(imageData,filename) {
  var buffer = PNG.sync.write(imageData, {filterType: 4});
  fs.writeFileSync(filename,buffer)
}
