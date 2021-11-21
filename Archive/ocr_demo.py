from PIL import Image
from paddleocr import PaddleOCR, draw_ocr
import cv2
# Paddleocr目前支持中英文、英文、法语、德语、韩语、日语，可以通过修改lang参数进行切换
# 参数依次为`ch`, `en`, `french`, `german`, `korean`, `japan`。
# need to run only once to download and load model into memory
ocr = PaddleOCR(
    # det_model_dir=r'C:\Users\PiaoYang\.paddleocr\ch_ppocr_server_v1.1_det_infer',
    use_angle_cls=True, lang="ch")
img_path = 'test.png'
img_padding_path = 'padding.png'

# 对图片进行边界填充
img = cv2.imread(img_path)
img_padding = cv2.copyMakeBorder(img, 75, 75, 75, 75, cv2.BORDER_CONSTANT,
                                 value=[255, 255, 255])
cv2.imwrite(img_padding_path, img_padding)

result = ocr.ocr(img_padding_path, cls=True)
for line in result:
    print(line)

# 显示结果
image = Image.open(img_padding_path).convert('RGB')
boxes = [line[0] for line in result]
txts = [line[1][0] for line in result]
scores = [line[1][1] for line in result]
im_show = draw_ocr(image, boxes, txts, scores,
                   #    font_path='/path/to/PaddleOCR/doc/simfang.ttf'
                   )
im_show = Image.fromarray(im_show)
im_show.save('result.jpg')
