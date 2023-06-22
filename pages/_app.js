import Head from "next/head";
import "../styles/globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Outfit } from "next/font/google";
import Script from "next/script";
config.autoAddCss = false;

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <script src="https://js.stripe.com/v3/"></script>
        <script src="https://crypto-js.stripe.com/crypto-onramp-outer.js"></script>
      </Head>
      <main className={`${outfit.variable} font-body`}>
        <Component {...pageProps} />
      </main>
    </UserProvider>
  );
}

export default App;
