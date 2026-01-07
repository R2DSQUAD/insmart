import "./globals.css";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import IntlProviderWrapper from "./components/IntlProviderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // lang 파라미터를 클라이언트에서만 감지 (SSR에서 window/searchParams 사용 불가)
  // 기본값 ko, 클라이언트에서만 동적으로 변경
  let lang = "ko";
  let messages = require("../messages/ko.json");
  // 클라이언트에서만 동적 변경은 IntlProviderWrapper 내부에서 처리 가능
  return (
    <html lang={lang}>
      <body className="root">
        <IntlProviderWrapper locale={lang} messages={messages}>
          <Header />
          <main className="container">{children}</main>
          <Footer />
        </IntlProviderWrapper>
      </body>
    </html>
  );
}
