module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 54) wires up the react-native-worklets plugin automatically.
    presets: ["babel-preset-expo"],
  };
};
