import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0E0E0E" />
        <meta name="application-name" content="Dekin" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Dekin" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerScript }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

const serviceWorkerScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    fetch('/sw.js', { method: 'HEAD', cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) return;
        return navigator.serviceWorker.register('/sw.js');
      })
      .catch(function () {
        // The service worker is generated only for production web exports.
      });
  });
}
`;
