import "./globals.css";

export const metadata = {
  title: "Маркетинг: от азов до Олимпа",
  description: "Учитесь думать как маркетолог: диагностика, практика и персональный маршрут."
};

export default function RootLayout({ children }) {
  return <html lang="ru"><body>{children}</body></html>;
}
