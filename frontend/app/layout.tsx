import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import Script from 'next/script';
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SIKERMA POLIBATAM - Sistem Informasi Kerjasama",
  description: "Platform Sistem Informasi Kerjasama Politeknik Negeri Batam",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stripExtensionInjectedAttributes = `
    (function () {
      var attr = 'fdprocessedid';

      function stripAttr(root) {
        if (!root || !root.querySelectorAll) {
          return;
        }

        var nodes = root.querySelectorAll('[' + attr + ']');
        for (var i = 0; i < nodes.length; i += 1) {
          nodes[i].removeAttribute(attr);
        }
      }

      if (typeof document === 'undefined') {
        return;
      }

      stripAttr(document);

      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i += 1) {
          var mutation = mutations[i];

          if (mutation.type === 'attributes' && mutation.attributeName === attr && mutation.target && mutation.target.removeAttribute) {
            mutation.target.removeAttribute(attr);
          }

          if (mutation.type === 'childList' && mutation.addedNodes && mutation.addedNodes.length > 0) {
            for (var j = 0; j < mutation.addedNodes.length; j += 1) {
              var node = mutation.addedNodes[j];
              if (node && node.querySelectorAll) {
                if (node.removeAttribute) {
                  node.removeAttribute(attr);
                }
                stripAttr(node);
              }
            }
          }
        }
      });

      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: [attr],
      });

      window.addEventListener('load', function () {
        stripAttr(document);
      });
    })();
  `;

  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body className={inter.className}>
        <Script id="strip-fdprocessedid" strategy="beforeInteractive">
          {stripExtensionInjectedAttributes}
        </Script>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
