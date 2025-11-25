const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const latToPercent = (lat) => {
  const normalized = (-lat + 90) / 180; // 0 en top, 1 en bottom
  return clamp(normalized * 100, 0, 100);
};

export const lonToPercent = (lon) => {
  const normalized = (lon + 180) / 360; // 0 left, 1 right
  return clamp(normalized * 100, 0, 100);
};
