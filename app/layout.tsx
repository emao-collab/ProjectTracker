import type { Metadata } from "next";
import { Providers } from "./providers";
import "@gfm-heart/styles/_reset.scss";
import "@gfm-heart/styles/_helpers.scss";
import "@gfm-heart/components/dist/styles/index.css";

export const metadata: Metadata = {
  title: "Quarterly Design Tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
