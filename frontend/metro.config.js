const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// supabase realtime-js ships an ESM entry Metro can't resolve; point it at the CJS build.
const supabaseRealtimePath = path.dirname(
  require.resolve("@supabase/realtime-js/package.json")
);
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "./lib/transformers" &&
    context.originModulePath?.includes("realtime-js")
  ) {
    return {
      filePath: path.join(supabaseRealtimePath, "dist/main/lib/transformers.js"),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
