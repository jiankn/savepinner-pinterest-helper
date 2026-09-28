export function planCrop(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const values = [sourceWidth, sourceHeight, targetWidth, targetHeight].map(Number);
  if (values.some((value) => !Number.isInteger(value) || value < 1)) {
    throw new Error("Source and target dimensions must be positive integers.");
  }

  const [width, height, ratioWidth, ratioHeight] = values;
  const targetRatio = ratioWidth / ratioHeight;
  const sourceRatio = width / height;
  let cropWidth = width;
  let cropHeight = height;

  if (sourceRatio > targetRatio) {
    cropWidth = Math.max(1, Math.min(width, Math.round(height * targetRatio)));
  } else if (sourceRatio < targetRatio) {
    cropHeight = Math.max(1, Math.min(height, Math.round(width / targetRatio)));
  }

  const x = Math.floor((width - cropWidth) / 2);
  const y = Math.floor((height - cropHeight) / 2);
  const retainedPercent = (cropWidth * cropHeight * 100) / (width * height);

  return {
    sourceWidth: width,
    sourceHeight: height,
    targetRatio: `${ratioWidth}:${ratioHeight}`,
    cropWidth,
    cropHeight,
    x,
    y,
    removedLeft: x,
    removedRight: width - cropWidth - x,
    removedTop: y,
    removedBottom: height - cropHeight - y,
    retainedPercent,
  };
}
