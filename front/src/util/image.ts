declare const cv: any;
export type CvMat = any;

export const ImageUtils = {
  imageBeautify(image: CvMat, beautifyProps: any) {
    // filter beautify
    return this.faceBeautify(image, beautifyProps.smooth.value, beautifyProps.detail.value);

    /*
    const src = new cv.Mat(this.store.bestSnapshot.image);
    const dst = new cv.Mat();

    cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
    // filter bilateral
    const bilateral = filters.bilateral.props;
    cv.bilateralFilter(src, dst, bilateral.diameter.value, bilateral.sigmaColor.value, bilateral.sigmaSpace.value, cv.BORDER_DEFAULT);

    src.delete();

    return dst;

    const size = filters.clahe.props.tileGridSize.value;
    const clahe = new cv.CLAHE(filters.clahe.props.clipLimit.value, new cv.Size(size, size));
    const rgbaPlanes = new cv.MatVector();
    const rgbaPlanesNew = new cv.MatVector();

    cv.split(this.store.bestSnapshot.image, rgbaPlanes);
    const r = rgbaPlanes.get(0);
    const rr = new cv.Mat();
    clahe.apply(r, rr);
    rgbaPlanesNew.push_back(rr);
    const g = rgbaPlanes.get(1);
    const gg = new cv.Mat();
    clahe.apply(g, gg);
    rgbaPlanesNew.push_back(gg);
    const b = rgbaPlanes.get(2);
    const bb = new cv.Mat();
    clahe.apply(b, bb);
    rgbaPlanesNew.push_back(bb);
    cv.merge(rgbaPlanesNew, dst);

    r.delete();
    rr.delete();
    g.delete();
    gg.delete();
    b.delete();
    bb.delete();
    rgbaPlanes.delete();
    rgbaPlanesNew.delete();
    clahe.delete();

    return dst;
    */
  },

  faceBeautify(image: any, value1: any, value2: any) {
    let dst = new cv.Mat();
    if(value1 == null || value1 == undefined)	value1 = 3;//磨皮系数
    if(value2 == null || value2 == undefined)	value2 = 1;//细节系数 0.5 - 2

    var dx = value1 * 5;//双边滤波参数
    var fc = value1 * 12.5;//参数
    var p = 0.1;//透明度

    let temp1 = new cv.Mat(), temp2 = new cv.Mat(), temp3 = new cv.Mat(), temp4 = new cv.Mat();

    const imageTmp = new cv.Mat();
    cv.cvtColor(image, imageTmp, cv.COLOR_RGBA2RGB, 0);

    cv.bilateralFilter(imageTmp, temp1, dx, fc, fc);//bilateralFilter(Src)

    let temp22 = new cv.Mat();
    cv.subtract(temp1, imageTmp, temp22);//bilateralFilter(Src) - Src

    cv.add(temp22, new cv.Mat(imageTmp.rows, image.cols, imageTmp.type(), new cv.Scalar(128, 128, 128, 128)), temp2);//bilateralFilter(Src) - Src + 128

    cv.GaussianBlur(temp2, temp3, new cv.Size(2 * value2 - 1, 2 * value2 - 1), 0, 0);
    //2 * GuassBlur(bilateralFilter(Src) - Src + 128) - 1

    let temp44 = new cv.Mat();
    temp3.convertTo(temp44, temp3.type(), 2, -255);
    //2 * GuassBlur(bilateralFilter(Src) - Src + 128) - 256

    cv.add(imageTmp, temp44, temp4);
    cv.addWeighted(imageTmp, p, temp4, 1-p, 0.0, dst);
    //Src * (100 - Opacity)

    cv.add(dst, new cv.Mat(imageTmp.rows, imageTmp.cols, imageTmp.type(), new cv.Scalar(10, 10, 10, 0)), dst);
    //(Src * (100 - Opacity) + (Src + 2 * GuassBlur(bilateralFilter(Src) - Src + 128) - 256) * Opacity) /100

    imageTmp.delete();
    temp1.delete();
    temp2.delete();
    temp3.delete();
    temp4.delete();
    temp22.delete();
    temp44.delete();

    return dst;
  },

  calcClarity(image: any): number {
    const dstImage = new cv.Mat();
    //转化为灰度图
    cv.cvtColor(image, dstImage, cv.COLOR_BGRA2GRAY, 0);

    const laplacianDstImage = new cv.Mat();
    //阈值太低会导致正常图片被误断为模糊图片，阈值太高会导致模糊图片被误判为正常图片
    cv.Laplacian(dstImage, laplacianDstImage, cv.CV_16U);

    //图像的平均灰度
    const value = cv.mean(laplacianDstImage)[0];

    dstImage.delete();
    laplacianDstImage.delete();

    return value;
  }
}
