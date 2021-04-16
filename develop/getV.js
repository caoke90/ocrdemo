module.exports=function (x,y,grayData) {
  return grayData.data[y*grayData.width+x];
}