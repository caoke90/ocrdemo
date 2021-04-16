function getGrayData(imageData){
  const grayData={
    width:imageData.width,
    height:imageData.height,
    data:[]
  }
  for(let y=0;y<imageData.height;y++){
    for(let x=0;x<imageData.width;x++){
      const k=4*imageData.width*y+4*x
      grayData.data.push(parseInt((imageData.data[k]+imageData.data[k+1]+imageData.data[k+2])/15));
    }
  }
  return grayData;
}
module.exports=getGrayData
