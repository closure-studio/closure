import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import {
  Atlas,
  Canvas,
  Circle,
  LinearGradient,
  Rect,
  Shader,
  Skia,
  rect,
  useTexture,
  vec,
} from '@shopify/react-native-skia';
import {
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

const REFERENCE_VIEWPORT = {
  width: 402,
  height: 874,
  particles: 90,
} as const;

const AREA_SCALE_EXPONENT = 0.75;

function getFlowParticleCount(width: number, height: number) {
  const safeWidth = Number.isFinite(width) ? Math.max(1, width) : 1;
  const safeHeight = Number.isFinite(height) ? Math.max(1, height) : 1;
  const area = safeWidth * safeHeight;
  const referenceArea = REFERENCE_VIEWPORT.width * REFERENCE_VIEWPORT.height;

  // Sublinear area scaling keeps phones dense without letting large displays grow linearly.
  return Math.max(
    1,
    Math.round(REFERENCE_VIEWPORT.particles * Math.pow(area / referenceArea, AREA_SCALE_EXPONENT)),
  );
}

const PARTICLE_RADIUS = 1.8;
const PARTICLE_TEXTURE_SIZE = 6;
const PARTICLE_TEXTURE_CENTER = PARTICLE_TEXTURE_SIZE / 2;
const PARTICLE_FIELD_OPACITY = 0.9;
const PARTICLE_BASE_ALPHA = 0.08;
const PARTICLE_ALPHA_RANGE = 0.2;
const SIMULATION_STEP_MS = 16;
const BACKDROP_FRAME_STEP_MS = 1000 / 30;
const MAX_FRAME_DELTA_MS = BACKDROP_FRAME_STEP_MS * 2;
const AURORA_GLOW_HEIGHT = 320;

const AURORA_GLOW_SHADER = Skia.RuntimeEffect.Make(`
  uniform float time;
  uniform float viewportWidth;
  layout(color) uniform float4 tint;
  layout(color) uniform float4 secondaryTint;

  float gaussian(float distance, float spread) {
    float normalized = distance / spread;
    return exp(-0.5 * normalized * normalized);
  }

  half4 main(float2 pos) {
    const float tau = 6.28318530718;
    const float glowHeight = 320.0;

    float x = clamp(pos.x / max(viewportWidth, 1.0), 0.0, 1.0);
    float y = clamp(pos.y / glowHeight, 0.0, 1.0);
    float phase = time * 0.2;

    float mainCenter =
      16.0 + x * 24.0 + x * x * 134.0 +
      sin(x * tau * 1.08 + phase) * 9.0 +
      sin(x * tau * 2.15 - phase * 0.62 + 0.7) * 4.0;
    float mainDistance = abs(pos.y - mainCenter);
    float mainHalo = gaussian(mainDistance, 42.0);
    float mainCore = gaussian(mainDistance, 17.0);
    float mainEnvelope = mix(0.48, 1.0, smoothstep(0.06, 0.88, x));
    float mainLight = (mainHalo * 0.055 + mainCore * 0.105) * mainEnvelope;

    float topGlow = pow(max(0.0, 1.0 - y), 1.55) * 0.13;
    float totalLight = topGlow + mainLight;
    float alpha = min(0.24, totalLight);

    float3 mainColor = secondaryTint.rgb;
    mainColor = mix(mainColor, float3(1.0), mainCore * 0.14);
    float3 color = (
      tint.rgb * topGlow +
      mainColor * mainLight
    ) / max(totalLight, 0.0001);
    return half4(color * alpha, tint.a * alpha);
  }
`);

function seededRandomUnit(index: number, salt: number) {
  'worklet';
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function readParticleValue(values: Float32Array, index: number) {
  'worklet';
  const value = values[index];
  if (value === undefined) throw new RangeError('Particle field index is outside its allocated buffers.');
  return value;
}

function flowAngle(x: number, y: number, timeMs: number) {
  'worklet';
  return (
    Math.sin(x * 0.0016 + timeMs * 0.0003) +
    Math.cos(y * 0.0021 - timeMs * 0.00042) +
    Math.sin((x + y) * 0.0011 + timeMs * 0.0002)
  ) * Math.PI;
}

type ParticleField = {
  count: number;
  generations: Float32Array;
  positionsX: Float32Array;
  positionsY: Float32Array;
  remainingLife: Float32Array;
  timing: {
    renderAccumulatorMs: number;
    simulationAccumulatorMs: number;
    simulationTimeMs: number;
  };
  velocitiesX: Float32Array;
  velocitiesY: Float32Array;
};

function applyAlpha(color: string, alpha: number) {
  if (!/^#[\da-f]{6}$/i.test(color)) return color;
  const alphaHex = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0');
  return `${color}${alphaHex}`;
}

function useIsAppActive() {
  const [isActive, setIsActive] = useState(
    () => AppState.currentState === null || AppState.currentState === 'active',
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setIsActive(state === 'active');
    });
    return () => subscription?.remove();
  }, []);

  return isActive;
}

function createParticleField(count: number, width: number, height: number): ParticleField {
  const positionsX = new Float32Array(count);
  const positionsY = new Float32Array(count);
  const velocitiesX = new Float32Array(count);
  const velocitiesY = new Float32Array(count);
  const remainingLife = new Float32Array(count);
  const generations = new Float32Array(count);
  const timing = {
    renderAccumulatorMs: 0,
    simulationAccumulatorMs: 0,
    simulationTimeMs: 0,
  };

  for (let index = 0; index < count; index += 1) {
    positionsX[index] = seededRandomUnit(index, 1) * width;
    positionsY[index] = seededRandomUnit(index, 2) * height;
    remainingLife[index] = seededRandomUnit(index, 3) * 100;
  }

  return { count, generations, positionsX, positionsY, remainingLife, timing, velocitiesX, velocitiesY };
}

function simulateParticleStep(particleField: ParticleField, width: number, height: number) {
  'worklet';
  const { count, generations, positionsX, positionsY, remainingLife, timing, velocitiesX, velocitiesY } = particleField;
  const simulationTimeMs = timing.simulationTimeMs + SIMULATION_STEP_MS;
  timing.simulationTimeMs = simulationTimeMs;

  for (let index = 0; index < count; index += 1) {
    const positionX = readParticleValue(positionsX, index);
    const positionY = readParticleValue(positionsY, index);
    const angle = flowAngle(positionX, positionY, simulationTimeMs);
    let nextVelocityX = (readParticleValue(velocitiesX, index) + Math.cos(angle) * 0.06) * 0.94;
    let nextVelocityY = (readParticleValue(velocitiesY, index) + Math.sin(angle) * 0.06) * 0.94;
    let nextPositionX = positionX + nextVelocityX;
    let nextPositionY = positionY + nextVelocityY;
    let nextRemainingLife = readParticleValue(remainingLife, index) - 1;

    if (nextPositionX < 0 || nextPositionX > width || nextPositionY < 0 || nextPositionY > height || nextRemainingLife < 0) {
      const generationNumber = readParticleValue(generations, index) + 1;
      const particleKey = index + generationNumber * 97;
      generations[index] = generationNumber;
      nextPositionX = seededRandomUnit(particleKey, 5) * width;
      nextPositionY = seededRandomUnit(particleKey, 6) * height;
      nextVelocityX = 0;
      nextVelocityY = 0;
      nextRemainingLife = 60 + seededRandomUnit(particleKey, 7) * 120;
    }

    positionsX[index] = nextPositionX;
    positionsY[index] = nextPositionY;
    velocitiesX[index] = nextVelocityX;
    velocitiesY[index] = nextVelocityY;
    remainingLife[index] = nextRemainingLife;
  }
}

function advanceParticleField(particleField: ParticleField, width: number, height: number, frameDeltaMs: number) {
  'worklet';
  const elapsedMs = Math.min(MAX_FRAME_DELTA_MS, Math.max(0, frameDeltaMs));
  particleField.timing.renderAccumulatorMs += elapsedMs;

  if (particleField.timing.renderAccumulatorMs < BACKDROP_FRAME_STEP_MS) return false;

  const renderElapsedMs = particleField.timing.renderAccumulatorMs - (particleField.timing.renderAccumulatorMs % BACKDROP_FRAME_STEP_MS);
  particleField.timing.renderAccumulatorMs -= renderElapsedMs;
  particleField.timing.simulationAccumulatorMs += renderElapsedMs;

  while (particleField.timing.simulationAccumulatorMs >= SIMULATION_STEP_MS) {
    simulateParticleStep(particleField, width, height);
    particleField.timing.simulationAccumulatorMs -= SIMULATION_STEP_MS;
  }

  return true;
}

export type FlowParticleFieldProps = {
  height: number;
  secondaryTint: string;
  tint: string;
  width: number;
};

export default function FlowParticleField({
  width,
  height,
  tint,
  secondaryTint,
}: FlowParticleFieldProps) {
  const reducedMotion = useReducedMotion();
  const isAppActive = useIsAppActive();
  const particleCount = getFlowParticleCount(width, height);
  const particleField = useMemo(() => createParticleField(particleCount, width, height), [height, particleCount, width]);
  const tintChannels = useMemo(() => Array.from(Skia.Color(tint)), [tint]);
  const secondaryTintChannels = useMemo(() => Array.from(Skia.Color(secondaryTint)), [secondaryTint]);
  const fallbackAuroraColors = useMemo(
    () => [
      applyAlpha(tint, 0.2),
      applyAlpha(secondaryTint, 0.11),
      applyAlpha(tint, 0),
    ],
    [secondaryTint, tint],
  );
  const particleSpriteRects = useMemo(
    () => Array.from({ length: particleCount }, () => rect(0, 0, PARTICLE_TEXTURE_SIZE, PARTICLE_TEXTURE_SIZE)),
    [particleCount],
  );
  const particleColors = useMemo(() => {
    const baseColor = Skia.Color(tint);
    return Array.from({ length: particleCount }, (_, index) => {
      const color = new Float32Array(baseColor);
      color[3] = PARTICLE_BASE_ALPHA + seededRandomUnit(index, 4) * PARTICLE_ALPHA_RANGE;
      return color;
    });
  }, [particleCount, tint]);
  const particleTexture = useTexture(
    <Circle
      cx={PARTICLE_TEXTURE_CENTER}
      cy={PARTICLE_TEXTURE_CENTER}
      r={PARTICLE_RADIUS}
      color="white"
    />,
    { width: PARTICLE_TEXTURE_SIZE, height: PARTICLE_TEXTURE_SIZE },
  );
  const initialTransforms = useMemo(
    () => Array.from({ length: particleCount }, (_, index) => Skia.RSXform(
      1,
      0,
      readParticleValue(particleField.positionsX, index) - PARTICLE_TEXTURE_CENTER,
      readParticleValue(particleField.positionsY, index) - PARTICLE_TEXTURE_CENTER,
    )),
    [particleCount, particleField],
  );
  const transforms = useSharedValue(initialTransforms);
  const auroraTime = useSharedValue(0);
  const auroraUniforms = useDerivedValue(() => ({
    time: auroraTime.value,
    viewportWidth: width,
    tint: tintChannels,
    secondaryTint: secondaryTintChannels,
  }));

  const frameCallback = useFrameCallback((frameInfo) => {
    'worklet';
    const shouldRender = advanceParticleField(
      particleField,
      width,
      height,
      frameInfo.timeSincePreviousFrame ?? SIMULATION_STEP_MS,
    );
    if (!shouldRender) return;

    transforms.modify((values) => {
      for (let index = 0; index < particleCount; index += 1) {
        const transform = values[index];
        if (!transform) throw new RangeError('Particle transform index is outside its allocated buffer.');
        transform.set(
          1,
          0,
          readParticleValue(particleField.positionsX, index) - PARTICLE_TEXTURE_CENTER,
          readParticleValue(particleField.positionsY, index) - PARTICLE_TEXTURE_CENTER,
        );
      }
      return values;
    }, true);
    auroraTime.set(particleField.timing.simulationTimeMs / 1000);
  }, false);

  useEffect(() => {
    frameCallback.setActive(!reducedMotion && isAppActive);
    return () => frameCallback.setActive(false);
  }, [frameCallback, isAppActive, reducedMotion]);

  return (
    <Canvas
      style={{ position: 'absolute', top: 0, left: 0, width, height, pointerEvents: 'none' }}
    >
      <Rect x={0} y={0} width={width} height={Math.min(height, AURORA_GLOW_HEIGHT)}>
        {AURORA_GLOW_SHADER ? (
          <Shader source={AURORA_GLOW_SHADER} uniforms={auroraUniforms} />
        ) : (
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, AURORA_GLOW_HEIGHT)}
            colors={fallbackAuroraColors}
            positions={[0, 140 / AURORA_GLOW_HEIGHT, 1]}
          />
        )}
      </Rect>
      <Atlas
        image={particleTexture}
        sprites={particleSpriteRects}
        transforms={transforms}
        colors={particleColors}
        colorBlendMode="modulate"
        opacity={PARTICLE_FIELD_OPACITY}
      />
    </Canvas>
  );
}
