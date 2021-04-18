const PNG = require("pngjs").PNG;
const fs=require('fs')
const getGrayData=require('./getGrayData')
const getV=require('./getV')
const getLineArrByGrayData=require('./getLineArrByGrayData')
const getStrByNum=require('./getStrByNum')
const getTextArr=require('./getTextArr')
require('./sortAdd')
// const renderTextToImageData=require('./renderTextToImageData')
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

const buff=fs.readFileSync('./Arial.png');
// const buff=fs.readFileSync('test/test.png');
// const buff=fs.readFileSync('test/tt.png');
// const buff=fs.readFileSync('test/test2.png');
// const buff=fs.readFileSync('test/t2.png');
const imageData=PNG.sync.read(buff)
const grayData=getGrayData(imageData)
const tempArr=getLineArrByGrayData(grayData)

for (let y = 0; y < grayData.height; y++) {
  for (let x = 0; x < grayData.width; x++) {
    const v=getV(x,y,grayData)
    if(v===undefined){
      changeV2(x,y,imageData)
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
const tzArr=[]
const posArr=[]
tempArr.forEach(function (pos1,i) {
  const [x1,y1,x2,y2]=pos1
  const h1=y2-y1
  if(h1<50){
    const fArr=[];
    for(let x=x1;x<x2;x++){
      let hu=0;
      let allY=0;

      for(let y=y1;y<y2;y++){
        const v=getV(x,y,grayData)
        if(v!==undefined){
          allY=allY+y
          hu++;
        }
      }
     // let add=0
     //  if(2*allY>hu*(y1+y2-1)){
     //    add=8;
     //  }
      fArr.push(getStrByNum(hu));
      // fArr.push(getStrByNum(add));
    }
    tzArr.push(fArr.join(''))
    posArr.push(pos1)
  }
})
/*
textArr 文字库
tzArr 特征
posArr 区域
rectArr 文字数据
 */

const textArr=getTextArr();
let n=0;
let repeatN=0;
const oneMap={}
const oneArr=[]
const wzArr=[]
posArr.forEach(function (pos1,i) {
  const str=tzArr[i];
  const text=textArr[n];
  const [n2,len,dis]=oneArr.sortFindLen(str)
  if(dis===1){
    if(n2!==-1&&len===oneArr[n2].length){
      console.log(dis,wzArr[n2],text)
      oneArr.splice(n2,1,str)
      wzArr.splice(n2,1,text)
    }else{
      oneArr.splice(n2+1,0,str)
      wzArr.splice(n2+1,0,text)
    }
  }else if(dis===-1){
    if(len!==str.length){
      oneArr.splice(n2,0,str)
      wzArr.splice(n2,0,text)
    }else{
      console.log(dis,text,wzArr[n2])
    }
  }else if(text!==wzArr[n2]){
    console.log(text,wzArr[n2])
  }
  // if(!oneMap[tz]){
  //   oneMap[tz]=textArr[n];
  // }else if(oneMap[tz]!==textArr[n]){
  //   repeatN++;
  //   console.log(tz,textArr[n],oneMap[tz])
  // }
  // mekflink.add(tz,textArr[n])
  n++;
  if(n===textArr.length){
    n=0;
  }
})
console.log(oneArr.length,posArr.length)
// fs.writeFileSync('oneMap.json',JSON.stringify(oneMap))

// if(fs.existsSync('data.json')){
//   const data=JSON.parse(fs.readFileSync('data.json').toString())
//   mekflink.AMap=data.AMap||mekflink.AMap
//   mekflink.BMap=data.BMap||mekflink.BMap
//   mekflink.CMap=data.CMap||mekflink.CMap
// }
//
// // fs.writeFileSync('data.json',JSON.stringify(mekflink.getData()))
// mekflink.makeGl();
//
// function learn(isShow) {
//   let rNum=0;
//   let eNum=0;
//   let n=0
// //识别
//   posArr.forEach(function (pos1,i) {
//     const text=mekflink.fastSolve(tzArr[i])
//     if(text[0]===textArr[n]&&text.length===1){
//       rNum++
//     }else{
//       eNum++
//       mekflink.add(tzArr[i],textArr[n])
//     }
//     // console.log(text)
//     renderTextToImageData(text,pos1,imageData)
//     n++;
//     if(n===textArr.length){
//       n=0;
//     }
//   })
//   mekflink.makeGl();
//   console.log(rNum,eNum,rNum/posArr.length,repeatN)
//   // fs.writeFileSync('data.json',JSON.stringify(mekflink.getData()))
//   if(rNum+repeatN+repeatN>posArr.length){
//
//   }else{
//     // learn()
//   }
// }
// learn()
//
// function saveImageToFile(imageData,filename) {
//   var buffer = PNG.sync.write(imageData, {filterType: 4});
//   fs.writeFileSync(filename,buffer)
// }
// saveImageToFile(imageData,'demo2.png')
