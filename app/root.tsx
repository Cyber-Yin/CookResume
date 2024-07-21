import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";

import { Toaster } from "./components/Toaster/provider";
import "./tailwind.css";

export const links: LinksFunction = () => {
  return [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600;700&display=swap",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://font.sec.miui.com/font/css?family=MiSans:400,600,700:Chinese_Simplify,Latin&display=swap",
    },
  ];
};

export const meta: MetaFunction = () => {
  return [
    { title: "酷客简历 - 免费开源的在线简历编辑器" },
    { name: "description", content: "免费开源的在线简历编辑器" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

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
      <body
        className={`${pathname === "/iframe/preview" ? "bg-custom" : "bg-custom-secondary"}`}
      >
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
