import { WindowPostMessageStream } from '@metamask/post-message-stream';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import {MetroRequest} from './api/metroRPC.js';

/* --- Note # xavax # we are one @
    metro_injected_fluids.js is an injected script that provides an EIP-1193 provider to the website that
    it is injected into. This script is injected by metro_fluid_injector.js.
    In order to connect/communicate with the actual metro wallet, we use a stream from this script to the
    metro_contentscript.js. The metro_contentscript.js then uses runtime.postMessage() to communicate to
    the hard_working_metro_worker.js. This worker will then handle all the calls & data, and procede to
    communicate with the wallet backend.
*/

//The EIP1193 API at window.ethereum. I hate this, but sadly its what most (basically all) dApps  are using...
window.ethereum = {
  isConnected: () => isConnected(),
  on: (event, callback) => on(event, callback),
  off: (event, callback) => removeListener(event, callback),
  removeListener: (event, callback) => removeListener(event, callback),
  request: ({method, params}) => request({method, params}),
  sendAsync: (request, callback) => sendAsync(request, callback),
  addListener: (event, callback) => on(event, callback),
  enable: () => enable(),
  send: (...args) => send(...args),

  chainId: "",
  networkId: "0x1",
  isMetaMask: true,
  isMetro: true,
}


//Create a new metroState, this can be viewed as the information the dApp will have about the wallet.
let metroState = new MetroState();

//Our event emitter that we'll be using for important things such as JSONRPC requests.
const ev = new SafeEventEmitter();
ev.setMaxListeners(500);


/* State of the metro injected contents <--> metro backend communication */
class MetroState {
  chainId = "";
  accounts = [];
  isConnectedToWallet = false;

  jsonRPCURL = "";

  hasRejectedConnection = false;

  constructor() { }

  /* Change or Update accounts (the addresses that are available to the dApp) */
  changeAccounts(newAccounts){
    if(this.isConnectedToWallet == true) {
      ev.emit("accountsChanged", newAccounts);
      this.accounts = newAccounts;
    }
  }
  /* Change the chainId */
  changeChain(newChainId){
    if(this.isConnectedToWallet == true) {
      ev.emit("chainChanged", newChainId);
      this.chainId = newChainId;
    }
  }
  /* Approve the dApp-Wallet connection, by Approve, we mean telling the dApp about our accounts and allowing RPC calls. */
  approveConnection(chainId, accounts, jsonRPCURL) {
    this.jsonRPCURL = jsonRPCURL;

    window.ethereum.chainId = this.chainId;
    this.isConnectedToWallet = true;

    
    this.chainId = chainId;
    this.accounts = accounts

    window.ethereum.chainId = chainId;
    window.ethereum.isConnected = true;
    
    if(accounts != this.accounts) {
      this.changeAccounts(accounts);
    }

    //ev.emit("connect", chainId);
    //ev.emit("changeAccounts", accounts);

    /*
     
    if(this.isConnectedToWallet == true) {
      ev.emit("accountsChanged", accounts);
    }
     */

    return accounts;
  }
  /* Reject the dApps request to get accounts/connect to the wallet, or close an existing connection.*/
  rejectConnection() {
    this.isConnectedToWallet = false;
    this.hasRejectedConnection = true;
    return {
      code: 4100,
      message: "Metro has Rejected revealing addresses."
    }
  }
  /* Disconnect the dApp from the provider, in other words disconnect from the dApp.*/
  disconnect() {
    if(this.isConnectedToWallet == false) {
      console.warn("disconnect was called despite not being disconnected, emitting dc events anyways...");
    }
    ev.emit("disconnect");
    ev.emit("close");
    ev.emit("accountsChanged", []);
    this.accounts = [];
    this.isConnectedToWallet = false;
  }

  /* Requests "connection" to the wallet, this usually pops-up a modal to the user. */
  requestConnection() {
    injectToContentStream.write({
      method: "requestAccess",
      params: [{
        from: document.location.hostname,
      }]
    });
  }
}


/* Stream from contentscript to this injected script, we use this stream to eventually communicate with the wallet.*/
const injectToContentStream = new WindowPostMessageStream({
  name: 'metro-inject',
  target: 'metro-contentscript'
});

injectToContentStream.on('data', (data) => {
  if(data.method === "approveAccess") {
    //I know, data.data, leave me alone...
    metroState.approveConnection(data.data.chainId, data.data.accounts, data.data.jsonRpcUrl);
  }
  if(data.method === "rejectAccess") {
    metroState.rejectConnection();
  }
  if(data.method === "disconnect") {
    metroState.disconnect();
  }
  if(data.method === "eth_getBlockByNumber") {
    ev.emit("eth_getBlockByNumber", data.data);
  }
  if(data.method === "eth_blockNumber") {
    ev.emit("eth_blockNumber", data.data);
  }
  if(data.method === "eth_getBalance") {
    ev.emit("eth_getBalance", data.data);
  }
  if(data.method === "eth_call") {
    ev.emit("eth_call", data.data);
  }
  if(data.method === "eth_estimateGas") {
    ev.emit("eth_estimateGas", data.data);
  }
  if(data.method === "eth_gasPrice") {
    ev.emit("eth_gasPrice", data.data);
  }
  if(data.method === "eth_getTransactionReceipt") {
    ev.emit("eth_getTransactionReceipt", data.data);
  }
  if(data.method === "eth_sendTransaction") {
    ev.emit("eth_sendTransaction", data.data);
  }
}) 

/* Remove a EIP1193 provider event listener */
function removeListener(event, callback){
  ev.removeListener(event, callback);
}

/* EIP1193 request method, may be a jsonRPC, may be anything :p */
function request({method, params}) {

  /*
  if(method == 'eth_accounts') {
    return new Promise(function(resolve, reject) {
      resolve([]);
    });
  }
   */

  if(method == 'eth_chainId') {

    return new Promise(function(resolve, reject) {
      injectToContentStream.write({
        method: method,
        params: params
      });
      resolve(metroState.chainId);
    });
  }

  if(method == 'eth_getBalance') {
    injectToContentStream.write({
      method: method,
      params: params
    });
    return new Promise(function(resolve, reject){
      //Wait for a response for 10 seconds, otherwise we reject.
      ev.prependOnceListener("eth_getBalance", (responseJson) => {
        if(responseJson.result != null) {
          return resolve(responseJson.result);
        } else {
          return reject(responseJson);
        }
      });
    });
  }

  if(method === 'eth_call') {
    
    //Decided to do eth_call's directly here, no reason to not do that here, just less overhead...
    return new Promise(function(resolve, reject){
      let req = new MetroRequest(method, params);
      req.postJsonRPC(metroState.jsonRPCURL).then((response) => {
          response.json().then((json) => {
            if(json.result) {
              return resolve(json.result);
            } else {
              return reject(responseJson);
            }
          });
      }).catch((e) => {
        return reject(e);
      });
    }); 

    /* TODO: remove this (kept for reasons...)
    injectToContentStream.write({
      method: method,
      params: params
    });
    return new Promise(function(resolve, reject){
      //Wait for a response for 10 seconds, otherwise we reject.
      ev.prependOnceListener("eth_call", (responseJson) => {
        if(responseJson.result != null) {
          return resolve(responseJson.result);
        } else {
          return reject(responseJson);
        }
      });
    });
     */
  }
  if(method === "eth_sendTransaction") {
    injectToContentStream.write({
      method: method,
      params: [{
        data: params,
        from: document.location.hostname,
      }]
    });

    return new Promise(function(resolve, reject){
      //Wait for a response for 10 seconds, otherwise we reject.
      ev.prependOnceListener("eth_sendTransaction", (responseJson) => {
        if(responseJson != "REJECT" && responseJson.result) {
          return resolve(responseJson.result);
        } else {
          return reject({
            message: "Metro Wallet Rejected the transaction on your behalf ٩[◕‿◕｡]"
          });
        }
      });
    });
  }
  if(method === 'eth_getTransactionReceipt') {
    injectToContentStream.write({
      method: method,
      params: params
    });

    return new Promise(function(resolve, reject){
      //Wait for a response for 10 seconds, otherwise we reject.
      ev.prependOnceListener("eth_getTransactionReceipt", (responseJson) => {
        if(typeof responseJson.result != null) {
          return resolve(responseJson.result);
        } else {
          return reject({
            message: "Transaction still pending..."
          });
        }
      });
    });
  }
  

  if(method === 'eth_estimateGas') {
    injectToContentStream.write({
      method: method,
      params: params
    });

    return new Promise(function(resolve, reject){
      //Wait for a response for 10 seconds, otherwise we reject.
      ev.prependOnceListener("eth_estimateGas", (responseJson) => {
        if(responseJson.result != null) {
          return resolve(responseJson.result);
        } else {
          return reject(responseJson);
        }
      });
    });
  }

  if(method === 'eth_gasPrice') {
    injectToContentStream.write({
      method: method,
      params: params
    });

    return new Promise(function(resolve, reject){
      //Wait for a response for 10 seconds, otherwise we reject.
      ev.prependOnceListener("eth_gasPrice", (responseJson) => {
        if(responseJson.result != null) {
          return resolve(responseJson.result);
        } else {
          return reject(responseJson);
        }
      });
    });
  }

  if(method === 'eth_getBlockByNumber') {
    injectToContentStream.write({
      method: method,
      params: params
    });
    return new Promise(function(resolve, reject){
      //Wait for a response for 10 seconds, otherwise we reject.
      ev.prependOnceListener("eth_getBlockByNumber", (responseJson) => {
        if(responseJson.result != null) {
          return resolve(responseJson.result);
        } else {
          return reject({
            message: responseJson
          });
        }
      });
    });
  }

  if(method === 'eth_blockNumber') {
    injectToContentStream.write({
      method: method,
      params: params
    });
    return new Promise(function(resolve, reject){
      //Wait for a response for 10 seconds, otherwise we reject.
      ev.prependOnceListener("eth_blockNumber", (responseJson) => {
        if(responseJson.result != null) {
          return resolve(responseJson.result);
        } else {
          return reject({
            message: responseJson
          });
        }
      });
    });
  }
  if(method === 'eth_estimateGas') {
    injectToContentStream.write({
      method: method,
      params: params
    });
  }

  //eth_accounts sinply gets the current accounts
  if(method == 'eth_accounts') {

    return new Promise(function(resolve, reject) {

      if(!metroState.hasRejectedConnection) {
        return resolve(metroState.accounts);
      } else {
        metroState.hasRejectedConnection = false;
        return reject({
          code: 4001,
          message: "Metro has Rejected revealing addresses."
        });
      }
    });
  }
  

  //If the user requests access from the browser Extension & not connect directly from the wallet,
  //We will show a popup modal for: Does the user intend to connect metro to the current App? And
  if(method == 'eth_requestAccounts') {

    return new Promise(function(resolve, reject) {

          //ps: Will probably switch this entire behaviour to use the observer pattern

      metroState.requestConnection();
      setInterval(() => {
        if(metroState.isConnectedToWallet == true) {
          return resolve(metroState.accounts);
        }
        if(metroState.hasRejectedConnection == true) {
          //Set this state back to false, in case the user tries to connect again after...

          metroState.hasRejectedConnection = false;
          return reject({
            code: 4001,
            message: "Metro has Rejected revealing addresses."
          });
        }
      }, 500);
    });
  }

  //When we receive a request that hasn't been handled by an if-statement,
  //tell the worker. The hard_working_metro_worker.js will decide what to do with the request. (maybe nothing, left on read...)
  injectToContentStream.write({
    method: method,
    params: params
  });

}
function on(event, callback) {
  ev.on(event, callback);
}
function send(...args) {
  return request({
    method: args[0],
    params: args[1],
  });
}
function enable() {
  return request({method: "eth_requestAccounts"});
}
function sendAsync(request, callback) {
  console.error("sendAsync is deprecated... not supported...");
}
function isConnected() {
  return metroState.isConnectedToWallet;
}