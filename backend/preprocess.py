import cv2
import numpy as np

def resize_with_aspect_ratio(image, width=None, height=None, inter=cv2.INTER_AREA):
    (h, w) = image.shape[:2]
    if width is None and height is None:
        return image
    if width is None:
        r = height / float(h)
        dim = (int(w * r), height)
    else:
        r = width / float(w)
        dim = (width, int(h * r))
    return cv2.resize(image, dim, interpolation=inter)

def rotate_image(image, angle):
    (h, w) = image.shape[:2]
    (cX, cY) = (w / 2, h / 2)
    M = cv2.getRotationMatrix2D((cX, cY), -angle, 1.0)
    cos, sin = np.abs(M[0, 0]), np.abs(M[0, 1])
    nW = int((h * sin) + (w * cos))
    nH = int((h * cos) + (w * sin))
    M[0, 2] += (nW / 2) - cX
    M[1, 2] += (nH / 2) - cY
    return cv2.warpAffine(image, M, (nW, nH))

def perspective_transform(image, corners):
    def order_corner_points(corners):
        corners = [(pt[0][0], pt[0][1]) for pt in corners]
        top_r, top_l, bottom_l, bottom_r = corners[0], corners[1], corners[2], corners[3]
        return (top_l, top_r, bottom_r, bottom_l)

    ordered = order_corner_points(corners)
    (tl, tr, br, bl) = ordered
    width = max(int(np.linalg.norm(np.array(br) - np.array(bl))),
                int(np.linalg.norm(np.array(tr) - np.array(tl))))
    height = max(int(np.linalg.norm(np.array(tr) - np.array(br))),
                 int(np.linalg.norm(np.array(tl) - np.array(bl))))

    dst = np.array([[0, 0], [width - 1, 0],
                    [width - 1, height - 1], [0, height - 1]], dtype="float32")
    ordered = np.array(ordered, dtype="float32")

    M = cv2.getPerspectiveTransform(ordered, dst)
    return cv2.warpPerspective(image, M, (width, height))

def enhance_for_ocr(image, upscale=True, sharpen=True, equalize=False):
    # Convert to grayscale if in color
    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    if upscale:
        image = cv2.resize(image, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)

    if sharpen:
        sharpen_kernel = np.array([[0, -0.5, 0],
                                   [-0.5, 3, -0.5],
                                   [0, -0.5, 0]])
        image = cv2.filter2D(image, -1, sharpen_kernel)

    if equalize:
        image = cv2.equalizeHist(image)

    return image

def extract_receipt_area(image):
    original = image.copy()
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255,
                                   cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY_INV, 11, 3)

    contours = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = contours[0] if len(contours) == 2 else contours[1]
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:3]

    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.015 * peri, True)
        if len(approx) == 4:
            return perspective_transform(original, approx)

    # If no contour was found, return original
    return original

def preprocess(image, upscale=True, sharpen=True, equalize=False):

    # Step 1: Extract receipt region via contour detection
    rectified = extract_receipt_area(image)

    # Step 2: Apply enhancement
    final = enhance_for_ocr(rectified, upscale, sharpen, equalize)
    cv2.imshow("Processed", resize_with_aspect_ratio(final, width=600))
    return final
