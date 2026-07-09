export const metadata = {
  title: 'Доставка Трекер',
  description: 'Трекинг доставок на филиалы',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
