import { ChakraProvider, ColorModeProvider, useToast } from '@chakra-ui/react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { CookiesProvider } from 'react-cookie';
import RootStore from '../stores/stores.jsx';
import theme from '../theme.js';

function MyApp({ Component, pageProps }) {
  const toast = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          await navigator.serviceWorker.register('/authServiceWorker.js');
        } catch {
          toast({
            position: 'bottom',
            title: 'An error occurred.',
            description: 'Please contact Gordon',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
        }
      });
    }
  }, [toast]);

  return (
    <>
      <Head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        <title>ERP</title>
      </Head>
      <RootStore {...pageProps}>
        <ChakraProvider resetCSS theme={theme}>
          <ColorModeProvider
            options={{
              useSystemColorMode: true,
            }}
          >
            <CookiesProvider>
              <div suppressHydrationWarning>
                {typeof window === 'undefined' ? null : <Component {...pageProps} />}
              </div>
            </CookiesProvider>
          </ColorModeProvider>
        </ChakraProvider>
      </RootStore>
    </>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object,
};

export default MyApp;
