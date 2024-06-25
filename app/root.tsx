import { NextUIProvider } from "@nextui-org/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { Toaster } from "./components/Toaster/provider";
import "./tailwind.css";

export const links: LinksFunction = () => {
  return [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600;700&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://font.sec.miui.com/font/css?family=MiSans:400,600,700:Chinese_Simplify,Latin&display=swap",
    },
  ];
};

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-custom-secondary">
        <NextUIProvider>
          {children}
          <ScrollRestoration />
          <Scripts />
        </NextUIProvider>
        <Toaster />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
