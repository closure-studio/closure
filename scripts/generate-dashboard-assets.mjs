import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import {
  AVATAR_FILTER_BASE_LAYERS,
  AVATAR_FILTER_PATTERN,
  AVATAR_FILTER_SCANLINE_OPACITY,
  AVATAR_FILTER_WASH_STOPS,
} from '../src/components/ui/avatar-filter-config.ts';
import { ITEM_ARTWORK_SIZE } from '../src/components/ui/item-artwork-config.ts';
import {
  OPERATOR_PORTRAIT_FILTER,
  OPERATOR_PORTRAIT_GEOMETRY,
} from '../src/features/dashboard/operator-roster/operator-portrait-config.ts';
import { APP_RASTER_COLORS } from '../src/theme/app-colors.ts';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DISPLAY_SIZE = 30;
const PORTRAIT_FILTER_WIDTH = OPERATOR_PORTRAIT_GEOMETRY.sourceWidth;
const PORTRAIT_FILTER_HEIGHT = OPERATOR_PORTRAIT_GEOMETRY.sourceHeight;
const PORTRAIT_FADE_MASK_SIZE = 256;
const RAW_CHANNELS = 4;
const CELL_TICKS_WIDTH = 11;
const CELL_TICKS_HEIGHT = 70;
const CELL_BOTTOM_TRANSITION_HEIGHT = 18;

const CELL_TICK_WIDTHS = [
  8, 5, 11, 6, 9, 4, 7, 10,
  8, 5, 11, 6, 9, 4, 7, 10,
  8, 5, 11, 6, 9, 4, 7, 10,
];

const CELL_BOTTOM_TRANSITION_STOPS = [
  { offset: 0, opacity: 0 },
  { offset: 0.42, opacity: 0.08 },
  { offset: 0.76, opacity: 0.3 },
  { offset: 1, opacity: 0.62 },
];

// Horizontal fade: the right edge curve is the single design input; the left
// edge is mirrored at build time so both sides have the same visual falloff.
// Stops are expressed in layer coordinates, converted from the cell-space
// distances preserved when the layer widened (0.21W / 0.13W / 0.055W from the
// right edge, with layer width OPERATOR_PORTRAIT_GEOMETRY.layerWidthPercent%).
const PORTRAIT_EDGE_FADE_STOPS = [
  { offset: 0, opacity: 1 },
  {
    offset: 1 - 0.21 / (OPERATOR_PORTRAIT_GEOMETRY.layerWidthPercent / 100),
    opacity: 1,
  },
  {
    offset: 1 - 0.13 / (OPERATOR_PORTRAIT_GEOMETRY.layerWidthPercent / 100),
    opacity: 0.74,
  },
  {
    offset: 1 - 0.055 / (OPERATOR_PORTRAIT_GEOMETRY.layerWidthPercent / 100),
    opacity: 0.28,
  },
  { offset: 1, opacity: 0 },
];

// Bottom fade is independent of the horizontal layer width and keeps its
// original curve untouched.
const PORTRAIT_BOTTOM_FADE_STOPS = [
  { offset: 0, opacity: 1 },
  { offset: 0.58, opacity: 1 },
  { offset: 0.74, opacity: 0.74 },
  { offset: 0.89, opacity: 0.28 },
  { offset: 1, opacity: 0 },
];

const ICONS = [
  ...Array.from({ length: 3 }, (_, index) => ({ category: 'elite', name: `elite_${index}` })),
  ...Array.from({ length: 6 }, (_, index) => ({ category: 'potential', name: `potential_${index}` })),
];

const INVENTORY_FILTERS = Object.entries(ITEM_ARTWORK_SIZE).map(
  ([layoutSize, size]) => ({ layoutSize, size }),
);

function parseColor(value) {
  const hexMatch = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value);
  if (hexMatch) {
    return {
      channels: hexMatch.slice(1).map((channel) => Number.parseInt(channel, 16)),
      alpha: 1,
    };
  }

  const rgbaMatch = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d*\.?\d+)\s*\)$/i.exec(value);
  if (rgbaMatch) {
    return {
      channels: rgbaMatch.slice(1, 4).map(Number),
      alpha: Number(rgbaMatch[4]),
    };
  }

  throw new Error(`Unsupported raster color: ${value}`);
}

function tokenColor(token) {
  const value = APP_RASTER_COLORS[token];
  if (!value) {
    throw new Error(`Unsupported AvatarFilter color token: ${token}`);
  }
  return parseColor(value);
}

function blendPixel(pixels, index, color, alpha) {
  if (alpha <= 0) {
    return;
  }

  const destinationAlpha = pixels[index + 3] / 255;
  const sourceAlpha = alpha;
  const outputAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha);
  if (outputAlpha <= 0) {
    return;
  }

  for (let channel = 0; channel < 3; channel += 1) {
    const destinationPremultiplied = (pixels[index + channel] / 255) * destinationAlpha;
    const sourcePremultiplied = (color[channel] / 255) * sourceAlpha;
    const outputPremultiplied = sourcePremultiplied + destinationPremultiplied * (1 - sourceAlpha);
    pixels[index + channel] = Math.round((outputPremultiplied / outputAlpha) * 255);
  }

  pixels[index + 3] = Math.round(outputAlpha * 255);
}

function interpolateColor(left, right, progress) {
  return left.map((channel, index) => channel + (right[index] - channel) * progress);
}

function getStopSegment(stops, progress) {
  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];
  if (!firstStop || !lastStop) {
    throw new Error('At least one gradient stop is required');
  }

  if (progress <= firstStop.offset) {
    return { leftStop: firstStop, rightStop: firstStop, progress: 0 };
  }
  if (progress >= lastStop.offset) {
    return { leftStop: lastStop, rightStop: lastStop, progress: 0 };
  }

  for (let index = 1; index < stops.length; index += 1) {
    const rightStop = stops[index];
    const leftStop = stops[index - 1];
    if (!rightStop || !leftStop || progress > rightStop.offset) continue;

    const span = rightStop.offset - leftStop.offset;
    if (span <= 0) {
      throw new Error(`Gradient stops must be strictly ordered: ${leftStop.offset}, ${rightStop.offset}`);
    }

    return {
      leftStop,
      rightStop,
      progress: (progress - leftStop.offset) / span,
    };
  }

  throw new Error(`Unable to locate gradient stop segment at progress ${progress}`);
}

function getWashColor(x, y, width, height) {
  const gradientX = width;
  const gradientY = -height;
  const pointX = x;
  const pointY = y - height;
  const gradientLengthSquared = gradientX ** 2 + gradientY ** 2;
  const progress = Math.max(
    0,
    Math.min(1, (pointX * gradientX + pointY * gradientY) / gradientLengthSquared),
  );
  const { leftStop, rightStop, progress: localProgress } = getStopSegment(
    AVATAR_FILTER_WASH_STOPS,
    progress,
  );
  const rightColor = tokenColor(rightStop.color);
  const leftColor = tokenColor(leftStop.color);
  const leftAlpha = leftStop.opacity * leftColor.alpha;
  const rightAlpha = rightStop.opacity * rightColor.alpha;
  return {
    color: interpolateColor(leftColor.channels, rightColor.channels, localProgress),
    alpha: leftAlpha + (rightAlpha - leftAlpha) * localProgress,
  };
}

function renderAvatarFilter({
  pixels,
  width,
  height,
  patternScale,
  clipToExistingAlpha,
  scanlineColorToken,
  scanlineOpacity,
}) {
  const baseLayers = AVATAR_FILTER_BASE_LAYERS.map((layer) => {
    const color = tokenColor(layer.color);
    return {
      channels: color.channels,
      alpha: layer.opacity * color.alpha,
    };
  });
  const scanlineColor = tokenColor(scanlineColorToken);
  const scanlineAlpha = scanlineOpacity * scanlineColor.alpha;
  const patternHeight = AVATAR_FILTER_PATTERN.height * patternScale;
  const patternRowHeight = AVATAR_FILTER_PATTERN.rowHeight * patternScale;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const maskAlpha = clipToExistingAlpha ? pixels[pixelIndex + 3] / 255 : 1;
      if (maskAlpha <= 0) {
        continue;
      }

      // Every filter layer is clipped by the original icon alpha when rendering an icon.
      for (const layer of baseLayers) {
        blendPixel(pixels, pixelIndex, layer.channels, layer.alpha * maskAlpha);
      }

      const wash = getWashColor(x, y, width, height);
      blendPixel(pixels, pixelIndex, wash.color, wash.alpha * maskAlpha);

      if (y % patternHeight < patternRowHeight) {
        blendPixel(
          pixels,
          pixelIndex,
          scanlineColor.channels,
          scanlineAlpha * maskAlpha,
        );
      }
    }
  }
}

function interpolateStopOpacity(stops, progress) {
  const { leftStop, rightStop, progress: localProgress } = getStopSegment(stops, progress);
  return leftStop.opacity + (rightStop.opacity - leftStop.opacity) * localProgress;
}

function mirrorGradientStops(stops) {
  return [...stops]
    .reverse()
    .map(({ offset, opacity }) => ({ offset: 1 - offset, opacity }));
}

function alphaAt(data, width, x, y) {
  return data[(y * width + x) * RAW_CHANNELS + 3] ?? 0;
}

function assertPortraitFadeMask(data) {
  const last = PORTRAIT_FADE_MASK_SIZE - 1;
  const cornerAlphas = [
    alphaAt(data, PORTRAIT_FADE_MASK_SIZE, 0, 0),
    alphaAt(data, PORTRAIT_FADE_MASK_SIZE, last, 0),
    alphaAt(data, PORTRAIT_FADE_MASK_SIZE, 0, last),
    alphaAt(data, PORTRAIT_FADE_MASK_SIZE, last, last),
  ];
  const centerAlpha = alphaAt(
    data,
    PORTRAIT_FADE_MASK_SIZE,
    Math.floor(last / 2),
    Math.floor(last / 2),
  );
  const bottomCenterAlpha = alphaAt(
    data,
    PORTRAIT_FADE_MASK_SIZE,
    Math.floor(last / 2),
    last,
  );

  if (cornerAlphas.some((alpha) => alpha !== 0) || centerAlpha === 0 || bottomCenterAlpha !== 0) {
    throw new Error('Portrait fade mask failed its transparent-edge alpha invariant');
  }
}

function assertScanlineDifference(data, width, height) {
  if (height < 2) {
    throw new Error('A scanline filter requires at least two rows for validation');
  }

  const hasDifference = Array.from({ length: width }, (_, x) => {
    const firstRowIndex = x * RAW_CHANNELS;
    const secondRowIndex = (width + x) * RAW_CHANNELS;
    return Array.from({ length: RAW_CHANNELS }, (_, channel) =>
      data[firstRowIndex + channel] !== data[secondRowIndex + channel],
    ).some(Boolean);
  }).some(Boolean);

  if (!hasDifference) {
    throw new Error('Generated scanline filter has no difference between adjacent rows');
  }
}

function firstTransparentAlphaIndex(data) {
  for (let index = 3; index < data.length; index += RAW_CHANNELS) {
    if (data[index] === 0) {
      return index;
    }
  }

  return -1;
}

async function writeRawImage(outputPath, data, width, height, format) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const image = sharp(data, {
    raw: {
      width,
      height,
      channels: RAW_CHANNELS,
    },
  });

  if (format === 'webp') {
    await image.webp({ lossless: true }).toFile(outputPath);
  } else {
    await image.png({ compressionLevel: 9 }).toFile(outputPath);
  }

  const metadata = await sharp(outputPath).metadata();
  if (
    metadata.width !== width ||
    metadata.height !== height ||
    metadata.format !== format ||
    metadata.channels !== RAW_CHANNELS ||
    metadata.hasAlpha !== true
  ) {
    throw new Error(
      `Generated asset metadata mismatch for ${outputPath}: expected ${width}x${height} ${format} RGBA`,
    );
  }
}

async function generateIcon(outputRoot, { category, name }) {
  const sourcePath = path.join(PROJECT_ROOT, 'assets', 'images', 'operators', category, `${name}.webp`);
  const outputDirectory = path.join(
    outputRoot,
    'assets',
    'images',
    'operators',
    category,
    'prerendered',
  );
  const outputPath = path.join(outputDirectory, `${name}.webp`);

  const sourceMetadata = await sharp(sourcePath).metadata();
  const outputSize = Math.max(sourceMetadata.width ?? 0, sourceMetadata.height ?? 0);
  if (outputSize === 0) {
    throw new Error(`Unable to determine dimensions for ${sourcePath}`);
  }

  const { data, info } = await sharp(sourcePath)
    .resize({
      width: outputSize,
      height: outputSize,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const transparentAlphaIndex = firstTransparentAlphaIndex(data);
  if (transparentAlphaIndex === -1) {
    throw new Error(`Expected transparent pixels in ${sourcePath}`);
  }

  renderAvatarFilter({
    pixels: data,
    width: info.width,
    height: info.height,
    patternScale: info.width / DISPLAY_SIZE,
    clipToExistingAlpha: true,
    scanlineColorToken: 'appScanline',
    scanlineOpacity: AVATAR_FILTER_SCANLINE_OPACITY,
  });
  if (data[transparentAlphaIndex] !== 0) {
    throw new Error(`Prerendered icon lost transparent pixels: ${sourcePath}`);
  }
  await writeRawImage(outputPath, data, info.width, info.height, 'webp');

  return outputPath;
}

async function generatePortraitFilter(outputRoot) {
  const outputPath = path.join(
    outputRoot,
    'assets',
    'images',
    'operators',
    'portrait-filter.webp',
  );
  const data = Buffer.alloc(PORTRAIT_FILTER_WIDTH * PORTRAIT_FILTER_HEIGHT * 4);
  renderAvatarFilter({
    pixels: data,
    width: PORTRAIT_FILTER_WIDTH,
    height: PORTRAIT_FILTER_HEIGHT,
    patternScale: 1,
    clipToExistingAlpha: false,
    scanlineColorToken: OPERATOR_PORTRAIT_FILTER.scanlineColor,
    scanlineOpacity: OPERATOR_PORTRAIT_FILTER.scanlineOpacity,
  });
  assertScanlineDifference(data, PORTRAIT_FILTER_WIDTH, PORTRAIT_FILTER_HEIGHT);
  await writeRawImage(outputPath, data, PORTRAIT_FILTER_WIDTH, PORTRAIT_FILTER_HEIGHT, 'webp');
  return outputPath;
}

async function generatePortraitFadeMask(outputRoot) {
  const outputPath = path.join(
    outputRoot,
    'assets',
    'images',
    'operators',
    'portrait-fade-mask.png',
  );
  const data = Buffer.alloc(PORTRAIT_FADE_MASK_SIZE * PORTRAIT_FADE_MASK_SIZE * 4);
  const leftStops = mirrorGradientStops(PORTRAIT_EDGE_FADE_STOPS);

  for (let y = 0; y < PORTRAIT_FADE_MASK_SIZE; y += 1) {
    const progressY = y / (PORTRAIT_FADE_MASK_SIZE - 1);
    const bottomAlpha = interpolateStopOpacity(PORTRAIT_BOTTOM_FADE_STOPS, progressY);

    for (let x = 0; x < PORTRAIT_FADE_MASK_SIZE; x += 1) {
      const progressX = x / (PORTRAIT_FADE_MASK_SIZE - 1);
      const leftAlpha = interpolateStopOpacity(leftStops, progressX);
      const rightAlpha = interpolateStopOpacity(PORTRAIT_EDGE_FADE_STOPS, progressX);
      const maskAlpha = Math.round(leftAlpha * rightAlpha * bottomAlpha * 255);
      const pixelIndex = (y * PORTRAIT_FADE_MASK_SIZE + x) * 4;

      data[pixelIndex] = 255;
      data[pixelIndex + 1] = 255;
      data[pixelIndex + 2] = 255;
      data[pixelIndex + 3] = maskAlpha;
    }
  }
  assertPortraitFadeMask(data);

  await writeRawImage(
    outputPath,
    data,
    PORTRAIT_FADE_MASK_SIZE,
    PORTRAIT_FADE_MASK_SIZE,
    'png',
  );
  return outputPath;
}

async function generateCellTicks(outputRoot) {
  const data = Buffer.alloc(CELL_TICKS_WIDTH * CELL_TICKS_HEIGHT * 4);
  const color = tokenColor('appRule');

  CELL_TICK_WIDTHS.forEach((tickWidth, index) => {
    const y = index * 3;
    for (let x = 0; x < tickWidth; x += 1) {
      const pixelIndex = (y * CELL_TICKS_WIDTH + x) * 4;
      data[pixelIndex] = color.channels[0];
      data[pixelIndex + 1] = color.channels[1];
      data[pixelIndex + 2] = color.channels[2];
      data[pixelIndex + 3] = Math.round(color.alpha * 255);
    }
  });

  const outputPath = path.join(
    outputRoot,
    'assets',
    'images',
    'operators',
    'cell-ticks.webp',
  );
  await writeRawImage(outputPath, data, CELL_TICKS_WIDTH, CELL_TICKS_HEIGHT, 'webp');
  return outputPath;
}

async function generateCellBottomTransition(outputRoot) {
  const data = Buffer.alloc(CELL_BOTTOM_TRANSITION_HEIGHT * 4);
  const color = tokenColor('appBackground');

  for (let y = 0; y < CELL_BOTTOM_TRANSITION_HEIGHT; y += 1) {
    const progress = y / (CELL_BOTTOM_TRANSITION_HEIGHT - 1);
    const alpha = interpolateStopOpacity(CELL_BOTTOM_TRANSITION_STOPS, progress);
    data[y * 4] = color.channels[0];
    data[y * 4 + 1] = color.channels[1];
    data[y * 4 + 2] = color.channels[2];
    data[y * 4 + 3] = Math.round(alpha * 255);
  }

  const outputPath = path.join(
    outputRoot,
    'assets',
    'images',
    'operators',
    'cell-bottom-transition.png',
  );
  await writeRawImage(outputPath, data, 1, CELL_BOTTOM_TRANSITION_HEIGHT, 'png');
  return outputPath;
}

async function generateInventoryFilter(outputRoot, { layoutSize, size }) {
  const outputPath = path.join(
    outputRoot,
    'assets',
    'images',
    'inventory',
    `grid-filter-${layoutSize}.webp`,
  );
  const data = Buffer.alloc(size * size * 4);

  renderAvatarFilter({
    pixels: data,
    width: size,
    height: size,
    patternScale: 1,
    clipToExistingAlpha: false,
    scanlineColorToken: 'appScanline',
    scanlineOpacity: AVATAR_FILTER_SCANLINE_OPACITY,
  });
  assertScanlineDifference(data, size, size);
  await writeRawImage(outputPath, data, size, size, 'webp');
  return outputPath;
}

async function generateAssets(outputRoot) {
  return Promise.all([
    ...ICONS.map((icon) => generateIcon(outputRoot, icon)),
    ...INVENTORY_FILTERS.map((filter) => generateInventoryFilter(outputRoot, filter)),
    generatePortraitFadeMask(outputRoot),
    generatePortraitFilter(outputRoot),
    generateCellTicks(outputRoot),
    generateCellBottomTransition(outputRoot),
  ]);
}

async function checkGeneratedAssets(outputRoot, generatedPaths, comparisonRoot = PROJECT_ROOT) {
  const stalePaths = [];

  for (const generatedPath of generatedPaths) {
    const relativePath = path.relative(outputRoot, generatedPath);
    const expected = await fs.readFile(generatedPath);
    let actual;
    try {
      actual = await fs.readFile(path.join(comparisonRoot, relativePath));
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        stalePaths.push(relativePath);
        continue;
      }
      throw error;
    }

    if (!expected.equals(actual)) {
      stalePaths.push(relativePath);
    }
  }

  if (stalePaths.length > 0) {
    throw new Error(
      `Dashboard assets are missing or stale:\n${stalePaths.map((assetPath) => `- ${assetPath}`).join('\n')}\nRun npm run assets:generate-dashboard.`,
    );
  }
}

async function main() {
  const argumentsList = process.argv.slice(2);
  const checkMode = argumentsList.length === 1 && argumentsList[0] === '--check';
  if (argumentsList.length > 0 && !checkMode) {
    throw new Error(`Unsupported arguments: ${argumentsList.join(' ')}`);
  }

  const outputRoot = checkMode
    ? await fs.mkdtemp(path.join(os.tmpdir(), 'closure-dashboard-assets-'))
    : PROJECT_ROOT;
  let deterministicRoot;

  try {
    const generatedPaths = await generateAssets(outputRoot);
    if (checkMode) {
      await checkGeneratedAssets(outputRoot, generatedPaths);
      deterministicRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'closure-dashboard-assets-repeat-'));
      await generateAssets(deterministicRoot);
      await checkGeneratedAssets(outputRoot, generatedPaths, deterministicRoot);
      console.log(`Verified ${generatedPaths.length} generated dashboard assets and deterministic output.`);
      return;
    }

    console.log(`Generated ${generatedPaths.length} dashboard assets.`);
    for (const generatedPath of generatedPaths) {
      console.log(path.relative(PROJECT_ROOT, generatedPath));
    }
  } finally {
    if (checkMode) {
      await fs.rm(outputRoot, { recursive: true, force: true });
      if (deterministicRoot) {
        await fs.rm(deterministicRoot, { recursive: true, force: true });
      }
    }
  }
}

await main();
