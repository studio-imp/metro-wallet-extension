

/* --- Note # xavax # we are one @
    tokens.ts contains interfaces & classes that contain important information about tokens,

    Note, this is specific to the C-chain, further abstractons to include other chains/subnets will
    be prioritized after beta release of the wallet.
*/


//Token list interface
export interface ITokenList {
    name: string,
    logoURI: string,
    keywords: string[],
    version: {
        major: number,
        minor: number,
        patch: number,
    },
    timestamp: string,
    tokens: [{
        address: string,
        chainId: number,
        name: string,
        symbol: string,
        decimals: number,
        logoURI: string
    }]
}

export interface IToken {
    address: string,
    chainId: number,
    name: string,
    symbol: string,
    decimals: number,
    logoURI: string
}

//All the information about a token the Metro wallet needs to know and store. (We only store info about tokens with a balance > 0)
export interface IMetroToken {
    tokenName: string,
    tokenSymbol: string,
    tokenAddress: string,
    tokenDecimals: number,
    tokenBalance: number, //Token balance in !Whole! units, not Atto, not giga, etc.
    tokenLogoURI: string,
}
//ERC 721 NFTs
export interface IERC721 {
    nftName: string,
    nftSymbol: string,
    nftAddress: string,
    nftPayload: string,
}

//This is what we store to "remember/cache" token info per each address. 
export interface ITokenCache {
    hasSearchedAllTokens: boolean,
    tokenVault: [{
        address: string,
        tokens: IMetroToken[]
    }]
}