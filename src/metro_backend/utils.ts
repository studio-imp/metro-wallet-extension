import { Avalanche} from "avalanche"
import { EVMAPI } from "avalanche/dist/apis/evm";
import {IToken, ITokenCache } from "./tokens";
import { RequestResponseData } from "avalanche/dist/common";


/**Retruns the token Name of the given token address, if it exists...
 */
export async function getTokenName(tokenAddress: string): Promise<RequestResponseData> {

    let nodeDetails= {
        IP: 'api.avax-test.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43113,
        PROTOCOL: 'https'
    };
    if(localStorage.getItem("NetworkSettings")) {
        nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
    }else {
        localStorage.setItem("NetworkSettings", JSON.stringify(nodeDetails));
    }

    let cChain: EVMAPI = new Avalanche(nodeDetails.IP, nodeDetails.PORT, nodeDetails.PROTOCOL, nodeDetails.NETWORK_ID).CChain();

    let tx = {
                 /*name()*/
        "data": "0x06fdde03",
        "to": tokenAddress,
    }
    return cChain.callMethod("eth_call", [tx, "latest"], "ext/bc/C/rpc");
}
/**Gets the token symbol
 */
export async function getTokenSymbol(tokenAddress: string): Promise<RequestResponseData> {
    let nodeDetails= {
        IP: 'api.avax-test.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43113,
        PROTOCOL: 'https'
    };
    if(localStorage.getItem("NetworkSettings")) {
        nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
    }else {
        localStorage.setItem("NetworkSettings", JSON.stringify(nodeDetails));
    }

    let cChain: EVMAPI = new Avalanche(nodeDetails.IP, nodeDetails.PORT, nodeDetails.PROTOCOL, nodeDetails.NETWORK_ID).CChain();

    let tx = {
                 /*name()*/
        "data": "0x95d89b41",
        "to": tokenAddress,
    }
    return cChain.callMethod("eth_call", [tx, "latest"], "ext/bc/C/rpc");
}
/**
 * Gets the smallest denomination of the token, i.e the smallest "piece" it can be divided into.
 */
export async function getTokenDecimals(tokenAddress: string): Promise<RequestResponseData> {
    let nodeDetails= {
        IP: 'api.avax-test.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43113,
        PROTOCOL: 'https'
    };
    if(localStorage.getItem("NetworkSettings")) {
        nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
    }else {
        localStorage.setItem("NetworkSettings", JSON.stringify(nodeDetails));
    }

    let cChain: EVMAPI = new Avalanche(nodeDetails.IP, nodeDetails.PORT, nodeDetails.PROTOCOL, nodeDetails.NETWORK_ID).CChain();


    let tx = {
                 /*name()*/
        "data": "0x313ce567",
        "to": tokenAddress,
    }
    return cChain.callMethod("eth_call", [tx, "latest"], "ext/bc/C/rpc");
}

/**
 * Gets the transaction receipt
 */
 export async function getTransactionReceipt(txHash: string): Promise<RequestResponseData> {
    let nodeDetails= {
        IP: 'api.avax-test.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43113,
        PROTOCOL: 'https'
    };
    if(localStorage.getItem("NetworkSettings")) {
        nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
    }else {
        localStorage.setItem("NetworkSettings", JSON.stringify(nodeDetails));
    }

    let cChain: EVMAPI = new Avalanche(nodeDetails.IP, nodeDetails.PORT, nodeDetails.PROTOCOL, nodeDetails.NETWORK_ID).CChain();
    return cChain.callMethod("eth_getTransactionReceipt", [txHash], "ext/bc/C/rpc");
}

/**
 * Adds a new token to the list, I will change the entire behaviour of the token list eventually so this is temporary.
 */
export function addTokenToList(token: IToken, addressIndex: number) {

    let nodeDetails= {
        IP: 'api.avax-test.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43113,
        PROTOCOL: 'https'
    };
    if(localStorage.getItem("NetworkSettings")) {
        nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
    }else {
        localStorage.setItem("NetworkSettings", JSON.stringify(nodeDetails));
    }

    let currentTokensList: ITokenCache = JSON.parse(localStorage.getItem("TokenCache" + nodeDetails.CHAIN_ID + "_" + addressIndex) || "{}");

    currentTokensList.tokenVault.tokens.push({
        tokenName: token.name,
        tokenSymbol: token.symbol,
        tokenAddress: token.address,
        tokenDecimals: token.decimals,
        tokenBalance: 0,
        tokenLogoURI: token.logoURI != "" ? token.logoURI : "",
    });

    localStorage.setItem("TokenCache" + nodeDetails.CHAIN_ID + "_" + addressIndex, JSON.stringify(currentTokensList));
}