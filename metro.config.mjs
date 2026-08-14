import expoMetroConfig from 'expo/metro-config.js';
import * as tamaguiMetroModule from '@tamagui/metro-plugin';

const { getDefaultConfig } = expoMetroConfig;
const { withTamagui } = tamaguiMetroModule.default;
const config = getDefaultConfig(import.meta.dirname);

export default withTamagui(config);
