import Script from "next/script";

export default function Wrapper({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Script src="bootstrap-icons/font/bootstrap-icons.css" />
      <Script src="bootstrap/dist/css/bootstrap.min.css" />
      <Script src="bootstrap/dist/js/bootstrap.bundle.min" />
    </>
  );
}
