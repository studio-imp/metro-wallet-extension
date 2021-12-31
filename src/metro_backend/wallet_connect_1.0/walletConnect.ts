import WalletConnect from '@walletconnect/client';



/* --- Note # xavax # we are one @
    walletConnect1.ts contains implementation details and Callbacks for WalletConnect 1.0,
    at this time the version is 1.6.6.

    The wallet connect 2.0 will be implemented when the beta is over.

    The idea is to have all focus be put on the upcoming xavax web3-dApp-link API when
    that is ready, for now we'll use wallet-connect, I am aware that this may be an
    annoyance, sowwy
*/


/*#------------------------------------------------------------------------------------------------------#*/


/* createWallet will create a walletconnect 1.0 connector. We wrap the connector in an object
so we can modfify the value directly with no need for a return type.*/
export async function createWallet(uri: string, client: WalletConnect){
    client = await new WalletConnect({
      uri: uri,
      clientMeta: {
        description: "Metro Wallet",
        url: "https://xavax.io",
        name: "Metro Wallet",
        icons: ["https://data.kayowo.net/xavax_resources/art/icons/xavax_logo_1000x1000.png"]
      }
    });
  
    if (!client.connected) {
      await client.createSession();
    }
    return client;
}