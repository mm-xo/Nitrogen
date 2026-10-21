// Extends app.json. Android builds get native Google Maps when GOOGLE_MAPS_ANDROID_API_KEY is set
// (in .env locally, or as an EAS environment variable); without it the app falls back to MapLibre.
module.exports = ({ config }) => {
  const key = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  return {
    ...config,
    plugins: key
      ? [...config.plugins, ["react-native-maps", { androidGoogleMapsApiKey: key }]]
      : config.plugins,
    extra: { ...config.extra, googleMapsAndroid: !!key },
  };
};
