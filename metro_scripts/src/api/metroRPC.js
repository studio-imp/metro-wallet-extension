

/* --- Note # xavax # we are one @
    metroRPC.js contains classes n constants that simplify passing messages
    from the hard_working_metro_worker.js <---> metro_fluid_injector.js
    as well as metro_injected_fluids <--->  metro_fluid_injector.js.
*/


export const MetroRPC = {
    //Open or closes the metro popup, ex the popup when you open the wallet through a dex.
    'CLOSE_POPUP': 'closePopup',
    'OPEN_POPUP': 'openPopup',

    //Approve, Reject, Or Request access to the wallet addresses, this connects the dApp to the wallet.
    'APPROVE_ACCESS': 'approveAccess',
    'REJECT_ACCESS': 'rejectAccess',
    'REQUEST_ACCESS': 'requestAccess',

    //Updates the chainId.
    'CHANGE_CHAIN_ID': 'changeChainId',
    //Updates the chainId.
    'CHANGE_ACCOUNTS': 'changeAccounts',


    //Closes connection with the specified dApp.
    'CLOSE_CONNECTION': 'closeConnection',

    //Adds a new transaction to track (sends notification if its accepted n stuff...)
    'ADD_TRANSACTION': 'addTransaction',
    'GET_SUCCESFUL_TRANSACTIONS': 'getSuccessfulTransactions',
    'CLEAR_PENDING_TRANSACTIONS': 'clearPendingTransactions',


    //Initializes cached seed (which is encrypted)
    'INIT_WORKER_VAULT': 'initWorkerVault',
    //requests the cached seed (encrypted)
    'REQUEST_SEED': 'requestSeed',
    //Deletes the stored vault (seed n shit) from the worker.
    'DELETE_VAULT': 'deleteVault',

    //Returns a map containing all the ports the wallet has approved connection for.
    'GET_CURRENT_CONNECTIONS': 'getCurrentConnections',
    'DELETE_PORT': 'deletePort' //Deletes a connection.

}

/* I chose to also have EVM RPC constants, variables named EVM_'METHOD' instead of the ETH prefix since it makes more sense to me. */
export const EVMRPC = {
    'EVM_GET_BLOCK_BY_NUMBER': 'eth_getBlockByNumber',
    'EVM_GET_BALANCE': 'eth_getBalance',
    'EVM_CALL': 'eth_call',
    'EVM_SEND_TRANSACTION': 'eth_sendTransaction',
    'EVM_GET_TRANSACTION_RECEIPT': 'eth_getTransactionReceipt',
    'EVM_ESTIMATE_GAS': 'eth_estimateGas',
    'EVM_BLOCK_NUMBER': 'eth_blockNumber',
    'EVM_GAS_PRICE': 'eth_gasPrice',
}

//Just a wrapper for requests to make things easier.
export class MetroRequest {
    method;
    data;
    constructor(method, data) {
        this.method = method;
        this.data = data;
    }
    
    /**
     * Returns a promise containing the RPC Response.
     * ____
     * @param {string} rpcURL The URL/URI the method will post the request to.
     */
    postJsonRPC(rpcURL) {
        return fetch(rpcURL, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                method: this.method,
                params: this.data,
                id: 1,
                jsonrpc: '2.0'
            })
        })
    }
}

