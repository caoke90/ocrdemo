const PNG = require("pngjs").PNG;
const fs=require('fs')
const getGrayData=require('./getGrayData')
const getV=require('./getV')
const getLineArrByGrayData=require('./getLineArrByGrayData')
const getStrByNum=require('./getStrByNum')
const getTextArr=require('./getTextArr')
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
  imageData.data[k+1]=255;
  imageData.data[k+2]=0;
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

/*
textArr 文字库
tzArr 特征
rectArr 文字数据
 */
const textArr=getTextArr();
const buff=fs.readFileSync('../data/Arial12.png');
const imageData=PNG.sync.read(buff)
const grayData=getGrayData(imageData)
const posArr=getLineArrByGrayData(grayData)
setOpacity(grayData,imageData)
let index=0;

const wzAllArr=[]
posArr.forEach(function (pos1,i) {
  wzAllArr.push(textArr[index])
  // renderTextToImageData(textArr[index],pos1,imageData)
  const [x1,y1,x2,y2,num]=pos1
  for(let j=y1;j<y2;j++){
    changeV1(x1-1,j,imageData)
    changeV1(x2,j,imageData)
  }
  for(let i=x1;i<x2;i++){
    changeV1(i,y1-1,imageData)
    changeV1(i,y2,imageData)
  }
  index++;
  if(index===textArr.length){
    index=0;
  }
})
console.log(posArr.length,textArr.length)
saveImageToFile(imageData,'demo2.png')


function saveImageToFile(imageData,filename) {
  var buffer = PNG.sync.write(imageData, {filterType: 4});
  fs.writeFileSync(filename,buffer)
}
