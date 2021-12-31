import { utils } from 'ethers';
import { BigNumber } from 'bignumber.js';

/* --- Note # xavax # we are one @
    decodeEVMTx.ts is a simple utility module that converts supported function calls + their data to data that
    can be displayed in UI. Obviously spoofing transactions is a possible attack vector, this will be
    stated in the UI.
*/



export enum TransactionTypes {
    SWAP_EXACT_AVAX_FOR_TOKENS,
    SWAP_EXACT_TOKENS_FOR_AVAX,
}

export interface IFunctionData {
    functionName: string, //The name of the function.
    functionParameterData: string[]
}

/**Decodes transaction data with a specific amount of functions available,
 * 
 * @param txData A hex string containing the entire transaction data.
 */
export async function decodeTransactionData(txData: any) {
    let functionPointer: string = (txData.data as string).slice(0, 10);
    switch(functionPointer) {
        //swapExactAVAXForTokens
        case '0xa2a1623d' : {
            let functionData: IFunctionData = {
                functionName: 'swapExactAVAXForTokens',
                functionParameterData: [],
            }
            //Value of AVAX for the swap.
            functionData.functionParameterData.push(txData.value);
            functionData.functionParameterData.push((txData.data as string).slice(10, 64 + 10));

            return functionData;
        }
        //swapExactTokensForAVAX
        case '0x676528d1' : {
            let functionData: IFunctionData = {
                functionName: 'swapExactTokensForAVAX',
                functionParameterData: [],
            }
            functionData.functionParameterData.push((txData.data as string).slice(10, 64 + 10));
            functionData.functionParameterData.push((txData.data as string).slice(10 + 64 + 10, 64 + (10 + 64)));
            console.log(functionData);
            return functionData;
        }
        default : {
            return;
        }
    }
}