const PNG = require("pngjs").PNG;
const fs=require('fs')
const getGrayData=require('./getGrayData')
const getV=require('./getV')
const getLineArrByGrayData=require('./getLineArrByGrayData')
const getStrByNum=require('./getStrByNum')
const getTextArr=require('./getTextArr')
const {sortAdd,sortFind}=require('./sortAdd')
const renderTextToImageData=require('./renderTextToImageData')
// const mekflink=require('./mekflink')

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
    fArr.push(getStrByNum(hu));
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
  return fArr.join('');
}
/*
textArr 文字库
tzArr 特征
rectArr 文字数据
 */
let oneMap=[]
if(!fs.existsSync('oneMap.json')){
  const buff=fs.readFileSync('./Arial.png');
  const imageData=PNG.sync.read(buff)
  const grayData=getGrayData(imageData)
  const posArr=getLineArrByGrayData(grayData)
  setOpacity(grayData,imageData)
  let index=0;
  const textArr=getTextArr();
  const wzAllArr=[]
  const tzAllArr=[]
  posArr.forEach(function (pos1,i) {
    const tz=getTz(pos1,grayData)
    const tzY=getTzY(pos1,grayData)
    tzAllArr.push([tz,tzY])
    wzAllArr.push(textArr[index])
    renderTextToImageData(textArr[index],pos1,imageData)
    index++;
    if(index===textArr.length){
      index=0;
    }
  })

  tzAllArr.forEach(function ([tz,tzY],i) {
    const val=wzAllArr[i];
    sortAdd(tz,tzY,val,oneMap,posArr[i])
  })

  fs.writeFileSync('oneMap.json',JSON.stringify(oneMap))

  // oneMap.forEach(function (item) {
  //   if(item.data.length>1){
  //     console.log(item)
  //     item.data.forEach(function (arr) {
  //       renderTextToImageData(arr[0],arr[2],imageData)
  //     })
  //   }
  // })
  saveImageToFile(imageData,'demo2.png')
}else{
  oneMap=JSON.parse(fs.readFileSync('oneMap.json').toString())
}


function saveImageToFile(imageData,filename) {
  var buffer = PNG.sync.write(imageData, {filterType: 4});
  fs.writeFileSync(filename,buffer)
}

function demo () {
  const buff=fs.readFileSync('./test.png');
  const imageData=PNG.sync.read(buff)
  const grayData=getGrayData(imageData)
  const posArr=getLineArrByGrayData(grayData)
  //透明
  for (let y = 0; y < grayData.height; y++) {
    for (let x = 0; x < grayData.width; x++) {
      const v=getV(x,y,grayData)
      if(v===undefined){
        changeV2(x,y,imageData)
      }
    }
  }

  const tzArr=getTzArr(posArr,grayData)
  tzArr.forEach(function (tz,m) {
    const tarr=[]
    const darr=[]
    let i=0;
    let pre=0;
    let d='';
    while (i<tz.length){
      if(d===''&&tz[i]==='0'){
        i++
      }else{
        const arr=sortFind(tz,i,oneMap)
        if(arr&&arr[2]===0){
          const obj=oneMap[arr[0]]
          tarr.push(obj.data)
          if(d){
            tarr.push(d)
            d=''
          }
          i=i+arr[1];
        }else{
          d=d+tz[i]
          if(i===tz.length.length-1&&d){
            tarr.push(d)
            d=''
          }
          i++
        }
      }

    }

    const pos1=posArr[m]
    // renderTextToImageData(tarr,pos1,imageData)

    if(tarr.length>0){
      console.log(tarr)
    }
  })

  saveImageToFile(imageData,'demo2.png')
}

// demo();