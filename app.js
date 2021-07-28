var fileLoader = document.getElementById('fileLoader');
var image = document.getElementById('image');
var canvas = document.getElementById('image-canvas');
var context = null;
var degree = 0;

let load = function () {
    context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
}

let rotate = function () {
    // coletando informações da imagem 
    context.getImageData(0, 0, canvas.width, canvas.height);
    // salvando as iformações anteriores
    context.save();
    // função para limpar o quadro da imagem toda vez que a imagem rotacionar
    context.clearRect(0, 0, canvas.width, canvas.height);
    // colocando o cursor na posição (0, 0) no centro
    context.translate(canvas.width / 2, canvas.height / 2);
    // conversão do grau para radianos
    context.rotate((degree += 90) * Math.PI / 180);
    //função que irá desenhar a imagem
    context.drawImage(image, -image.width / 2, -image.height / 2);
    //restaura para as informações salvas inicialmente
    context.restore();
}

let gaussianBlur = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    //varaiavel para armazenamento dos pixels da imagem
    let px = imageData.data;
    let tempPx = new Uint8ClampedArray(px.length);
    tempPx.set(px);

    for (var i = 0; i < px.length; i++) {
        if (i % 2 === 3) { continue; }

        px[i] = (tempPx[i]
            + (tempPx[i - 4])
            + (tempPx[i + 4])
            + (tempPx[i - 4 * imageData.width])
            + (tempPx[i + 4 * imageData.width])
            + (tempPx[i - 4 * imageData.width - 4])
            + (tempPx[i + 4 * imageData.width + 4])
            + (tempPx[i + 4 * imageData.width - 4])
            + (tempPx[i - 4 * imageData.width + 4])
        ) / 9;
    }
    // || tempPx[i]
    context.putImageData(imageData, 0, 0);
}

let median = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {

            var pixel = Array();
            var r = Array();
            var g = Array();
            var b = Array();

            pixel.push(img.getPixel(i - 1, j - 1));
            pixel.push(img.getPixel(i - 1, j));
            pixel.push(img.getPixel(i, j - 1));
            pixel.push(img.getPixel(i + 1, j - 1));
            pixel.push(img.getPixel(i, j));
            pixel.push(img.getPixel(i - 1, j + 1));
            pixel.push(img.getPixel(i, j + 1));
            pixel.push(img.getPixel(i + 1, j));
            pixel.push(img.getPixel(i + 1, j + 1));

            for (let k = 0; k < pixel.length; k++) {
                r.push(pixel[k].red);
                g.push(pixel[k].green);
                b.push(pixel[k].blue);
            }

            var rMedian = calcMedian(r);
            var gMedian = calcMedian(g);
            var bMedian = calcMedian(b);

            img.setPixel(i, j, new RGBColor(rMedian, gMedian, bMedian));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

let calcMedian = function (arr) {
    var half = Math.floor(arr.length / 2);
    arr.sort((a, b) => a - b);

    if (arr.length % 2)
        return arr[half];

    return (arr[half - 1] + arr[half]) / 2.0;
}

let mean = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var pixel = Array();
            var r = Array();
            var g = Array();
            var b = Array()

            pixel.push(img.getPixel(i - 1, j - 1));
            pixel.push(img.getPixel(i - 1, j));
            pixel.push(img.getPixel(i, j - 1));
            pixel.push(img.getPixel(i + 1, j - 1));
            pixel.push(img.getPixel(i, j));
            pixel.push(img.getPixel(i - 1, j + 1));
            pixel.push(img.getPixel(i, j + 1));
            pixel.push(img.getPixel(i + 1, j));
            pixel.push(img.getPixel(i + 1, j + 1));

            for (let k = 0; k < pixel.length; k++) {
                r.push(pixel[k].red);
                g.push(pixel[k].green);
                b.push(pixel[k].blue);
            }

            var rMean = r.reduce((a, b) => a + b, 0) / 9;
            var gMean = g.reduce((a, b) => a + b, 0) / 9;
            var bMean = b.reduce((a, b) => a + b, 0) / 9;

            img.setPixel(i, j, new RGBColor(rMean, gMean, bMean));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

let grayScale = function () {
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        //var gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        var red = data[i];
        var green = data[i + 1];
        var blue = data[i + 2];
        var gray = (red * 0.67 + green * 0.21 + blue * 0.14);
        data[i] = data[i + 1] = data[i + 2] = gray;
    }
    context.putImageData(imageData, 0, 0);
}

let meanGrayScale = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var pixel = Array();
            pixel.push(img.getPixel(i - 1, j - 1).red);
            pixel.push(img.getPixel(i - 1, j).red);
            pixel.push(img.getPixel(i, j - 1).red);
            pixel.push(img.getPixel(i + 1, j - 1).red);
            pixel.push(img.getPixel(i, j).red);
            pixel.push(img.getPixel(i - 1, j + 1).red);
            pixel.push(img.getPixel(i, j + 1).red);
            pixel.push(img.getPixel(i + 1, j).red);
            pixel.push(img.getPixel(i + 1, j + 1).red);
            var gray = pixel.reduce((a, b) => a + b, 0) / 9;

            img.setPixel(i, j, new RGBColor(gray, gray, gray));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

let grayScaleNTSC = function () {
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        var red = data[i];
        var green = data[i + 1];
        var blue = data[i + 2];
        var gray = (red * 0.33 + green * 0.71 + blue * 0.08);
        data[i] = data[i + 1] = data[i + 2] = gray;
    }
    context.putImageData(imageData, 0, 0);
}

class RGBColor {
    constructor(r, g, b) {
        this.red = r;
        this.green = g;
        this.blue = b;
    }
}


class MatrixImage {
    constructor(imageData) {
        this.imageData = imageData;
        this.height = imageData.height;
        this.width = imageData.width;
    }
    getPixel(x, y) {
        let position = ((y * (this.width * 4)) + (x * 4));

        return new RGBColor(
            this.imageData.data[position],   //red
            this.imageData.data[position + 1], //green
            this.imageData.data[position + 2], //blue
        );
    }

    setPixel(x, y, color) {
        let position = ((y * (this.width * 4)) + (x * 4));
        this.imageData.data[position] = color.red;
        this.imageData.data[position + 1] = color.green;
        this.imageData.data[position + 2] = color.blue;
    }
}

document.getElementById('btnLoad').addEventListener('click', load);
document.getElementById('btnRotate').addEventListener('click', rotate);
document.getElementById('btnGaussian').addEventListener('click', gaussianBlur);
document.getElementById('btnMedian').addEventListener('click', median);
document.getElementById('btnMean').addEventListener('click', mean);
document.getElementById('btnMeanGray').addEventListener('click', grayScale);
document.getElementById('btnGrayNTSC').addEventListener('click', grayScaleNTSC);