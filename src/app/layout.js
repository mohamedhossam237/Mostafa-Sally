import { Cairo, Amiri } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "كتب كتاب سالي & مصطفى 💍",
  description: "دعوة لحضور عقد قران سالي السيد ومصطفى الخطيب بكفر أبو شوارب يوم الأربعاء ٢ سبتمبر ٢٠٢٦",
  openGraph: {
    title: "كتب كتاب سالي & مصطفى 💍",
    description: "دعوة لحضور عقد قران سالي السيد ومصطفى الخطيب بكفر أبو شوارب يوم الأربعاء ٢ سبتمبر ٢٠٢٦",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable}`}>
      <body>{children}</body>
    </html>
  );
}
