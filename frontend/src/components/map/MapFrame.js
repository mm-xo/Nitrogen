import * as React from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

// Hosts the MapLibre page in a WebView. post() calls into the page; onMessage receives its replies.
export const MapFrame = React.forwardRef(function MapFrame({ html, onMessage }, ref) {
  const web = React.useRef(null);

  React.useImperativeHandle(ref, () => ({
    post: (msg) =>
      web.current?.injectJavaScript(
        `window.nitrogenMap && window.nitrogenMap.handle(${JSON.stringify(msg)}); true;`
      ),
  }));

  return (
    <WebView
      ref={web}
      source={{ html }}
      originWhitelist={["*"]}
      onMessage={(e) => {
        try {
          onMessage(JSON.parse(e.nativeEvent.data));
        } catch {}
      }}
      style={styles.web}
      containerStyle={styles.web}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      setSupportMultipleWindows={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      androidLayerType="hardware"
    />
  );
});

const styles = StyleSheet.create({
  web: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
