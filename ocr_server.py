from typing import Union, List

import cv2
import numpy as np
from PIL import Image
from PIL.Image import Image as ImageClass
from flask import Flask, request
from paddleocr import PaddleOCR, draw_ocr

import os
os.environ['KMP_DUPLICATE_LIB_OK']='True'

app = Flask(__name__)

ocr = PaddleOCR(
    det_model_dir=r'C:\Users\PiaoYang\.paddleocr\ch_ppocr_server_v1.1_det_infer',
    rec_model_dir=r'C:\Users\PiaoYang\.paddleocr\ch_ppocr_server_v1.1_rec_infer',
    use_angle_cls=True, lang="ch", use_gpu=True, rec_batch_num=10)


@app.route('/', methods=['POST'])
def ocr_detect_recognize():
    img_file = request.files['img']
    # 通过文件对象读取，生成图片对象，从RGBA转为RGB。4通道转3通道。模型输入为三个维度
    img_obj = Image.open(img_file).convert('RGB')

    # img_arr = np.fromfile(img_file, np.uint8)
    # IMREAD_UNCHANGED原始通道、带Alpha通道。IMREAD_COLOR RGB通道
    # cv2.imdecode(img_arr, cv2.IMREAD_COLOR )

    result, image_result = ocr_img(img_obj)

    boxes = [line[0] for line in result]
    txts = [line[1][0] for line in result]
    scores = [line[1][1] for line in result]

    image_result.save(f'OCRResult/{img_file.filename}')

    return ''.join(txts)


@app.route('/rec', methods=['POST'])
def ocr_recognize():
    '''
    只进行识别，不进行文字检测
    '''
    img_file = request.files['img']
    img_obj = Image.open(img_file).convert('RGB')

    result = ocr_img_recognize(img_obj)

    txts = [line[0] for line in result]
    scores = [line[1] for line in result]

    return txts[0]


def ocr_img(img: Union[np.ndarray, ImageClass]) -> (List, Image):
    img = np.array(img)

    # 文字检测+识别，需要对图片进行边界填充
    img_padding = cv2.copyMakeBorder(img, 75, 75, 75, 75, cv2.BORDER_CONSTANT,
                                     value=[255, 255, 255])
    result = ocr.ocr(img_padding, cls=True)

    for line in result:
        print(line)

    boxes = [line[0] for line in result]
    txts = [line[1][0] for line in result]
    scores = [line[1][1] for line in result]

    img_result = draw_ocr(img_padding, boxes, txts, scores)
    img_result = Image.fromarray(img_result)

    return (result, img_result)


def ocr_img_recognize(img: Union[np.ndarray, ImageClass]) -> (List, Image):
    img = np.array(img)

    img_padding = cv2.copyMakeBorder(img, 2, 2, 2, 2, cv2.BORDER_CONSTANT,
                                     value=[255, 255, 255])
    result = ocr.ocr(img_padding, cls=True, det=False)

    for line in result:
        print(line)

    txts = [line[0] for line in result]
    scores = [line[1] for line in result]

    return (result)


def ocr_img_path(img_path):
    img_obj = Image.open(img_path).convert('RGB')
    result, image_result = ocr_img(img_obj)
    image_result.save(f'test.png')


app.run(host='0.0.0.0', port=8890, use_reloader=False, debug=True)
