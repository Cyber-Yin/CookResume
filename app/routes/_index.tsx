import type { MetaFunction } from "@remix-run/node";

import Header from "@/components/Header";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return <Header />;
}
