import * as React from "react";

// Web host for the MapLibre page. A srcdoc iframe shares this origin, so we can call into it directly.
export const MapFrame = React.forwardRef(function MapFrame({ html, onMessage }, ref) {
  const frame = React.useRef(null);

  React.useImperativeHandle(ref, () => ({
    post: (msg) => frame.current?.contentWindow?.nitrogenMap?.handle(msg),
  }));

  React.useEffect(() => {
    const listener = (e) => {
      if (e.source === frame.current?.contentWindow && e.data?.source === "nitrogen-map") {
        onMessage(e.data.payload);
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [onMessage]);

  return (
    <iframe
      ref={frame}
      srcDoc={html}
      title="Campus map"
      style={{ border: 0, width: "100%", height: "100%", display: "block", background: "transparent" }}
    />
  );
});
