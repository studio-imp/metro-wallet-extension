//import { WindowPostMessageStream } from '@metamask/post-message-stream';
import extension from 'extensionizer';
import { MetroRequest, MetroRPC, EVMRPC } from './api/metroRPC.js';
import { WalletVault } from './api/workerVault.js'


let currentNotifRequest;
let currentPopup;
let currentPort;

let jsonRPCURL = "https://api.avax.network:443/ext/bc/C/rpc";

var MetroVault;

var pendingTxs = [];

var currentlyConnectedPorts = {};
var allPorts = {};

self.addEventListener("message", (event) => {
    if(event.data && event.data.method === "getNotificationRequests") {
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then((clients) => {
            if(clients && clients.length) {
                clients[0].postMessage(currentNotifRequest);
            }
        });
    }
    if(event.data && event.data.method === MetroRPC.GET_CURRENT_CONNECTIONS) {
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then((clients) => {
            if(clients && clients.length) {
                clients[0].postMessage(new MetroRequest(MetroRPC.GET_CURRENT_CONNECTIONS,  {ports: JSON.stringify(currentlyConnectedPorts)}));
            }
        });
    }

    if(event.data && event.data.method === MetroRPC.DELETE_PORT) {
        if(event.data.tabId in currentlyConnectedPorts) {
            currentlyConnectedPorts[event.data.tabId].disconnect();
            delete currentlyConnectedPorts[event.data.tabId];
        }
        if(event.data.tabId in allPorts) {
            allPorts[event.data.tabId].disconnect();
            delete allPorts[event.data.tabId];
        }
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then((clients) => {
            if(clients && clients.length) {
                clients[0].postMessage(new MetroRequest(MetroRPC.GET_CURRENT_CONNECTIONS,  {ports: JSON.stringify(currentlyConnectedPorts)}));
            }
        });
    }

    if(event.data && event.data.method == MetroRPC.INIT_WORKER_VAULT) {
        if(MetroVault == null) {
            console.log("Worker succesfully initialized vault");
            MetroVault = new WalletVault(event.data.pinEncryptedSeed);
        }else {
            console.warn("INIT_WORKER_VAULT Called when worker already has a vault initialized!");
        }
    }
    if(event.data && event.data.method == MetroRPC.REQUEST_SEED) {
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then((clients) => {
            if(clients && clients.length) {
                if(MetroVault) {
                    clients[0].postMessage(new MetroRequest(MetroRPC.REQUEST_SEED, {pinEncryptedSeed: MetroVault.getSeed(), status: 'HAS_SEED'}));
                }else {
                    clients[0].postMessage(new MetroRequest(MetroRPC.REQUEST_SEED, {status: 'NO_SEED'}));
                }
            }
        });
    }
    

    if(event.data && event.data.method == MetroRPC.ADD_TRANSACTION) {
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then((clients) => {
            let req = new MetroRequest(EVMRPC.EVM_GET_TRANSACTION_RECEIPT, [event.data.data.txHash]);
            let getReceiptUpdate = async () => {
                setTimeout(async () => {
                    req.postJsonRPC(jsonRPCURL).then((response) => {
                        response.json().then((json) => {
                            if(json.result == null) {
                                getReceiptUpdate();
                                return;
                            }else if(json.result.status == "0x1") {
                                pendingTxs.push(event.data.data);

                                if(clients && clients.length) {
                                    if(pendingTxs != null) {
                                        clients[0].postMessage(new MetroRequest(MetroRPC.GET_SUCCESFUL_TRANSACTIONS, {status: 'FOUND', txs: pendingTxs}));
                                    }
                                }

                                //tx success.
                            } else if(json.result.status == "0x0") {
                                console.log("Transaction Failed!");
                            }
                            /*
                            console.log(json);
                            console.log("!WORKER RECEIVED TRANSACTION!");
                             */
                        });
                    });

                }, 700);
            };
            getReceiptUpdate();
        });
    }
    if(event.data && event.data.method == MetroRPC.GET_SUCCESFUL_TRANSACTIONS) {
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then((clients) => {
            if(clients && clients.length) {
                if(pendingTxs != null) {
                    clients[0].postMessage(new MetroRequest(MetroRPC.GET_SUCCESFUL_TRANSACTIONS, {status: 'FOUND', txs: pendingTxs}));
                }
            }
        });
    }
    if(event.data && event.data.method == MetroRPC.CLEAR_PENDING_TRANSACTIONS) {
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then((clients) => {
            if(pendingTxs != null) {
                pendingTxs = [];
            }
        });
    }
    if(event.data && event.data.method == MetroRPC.DELETE_VAULT) {
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then((clients) => {
            MetroVault = null;
        });
    }

    //the user has pressed accept, now the backend will send the approveAccess method with details such as the addres.
    if(event.data && event.data.method === "approveAccess") {
        if(event.data.port.sender.tab.id in allPorts) {
            currentlyConnectedPorts[event.data.port.sender.tab.id] = allPorts[event.data.port.sender.tab.id];
        } else {
            console.error("Port is not found? Tell the devs to investigate...");
            return;
        }
        //Add listeners for methods only if the user has accepted the connection to the correct port.
        addListenersToPort(currentlyConnectedPorts[event.data.port.sender.tab.id]);
        currentlyConnectedPorts[event.data.port.sender.tab.id].postMessage({
            method: "approveAccess",
            data: {
                accounts: event.data.accounts,
                chainId: event.data.chainId,
                jsonRpcUrl: "https://" + event.data.nodeIp + ":443/ext/bc/C/rpc",
            }
        });
        jsonRPCURL = "https://" + event.data.nodeIp + ":443/ext/bc/C/rpc";
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then((clients) => {
            if(clients && clients.length) {
                clients[0].postMessage(new MetroRequest(MetroRPC.GET_CURRENT_CONNECTIONS,  {ports: JSON.stringify(currentlyConnectedPorts)}));
            }
        })
    }
    //the user has pressed reject, now the backend will send the rejectAccess method.
    if(event.data && event.data.method === "rejectAccess") {
        currentPort.postMessage({
            method: "rejectAccess",
        });
    }
    if(event.data && event.data.method === "eth_sendTransaction") {
        currentPort.postMessage({
            method: "eth_sendTransaction",
            data: event.data.response
        });
    }
    //Update chainId to all ports.
    if(event.data && event.data.method === MetroRPC.CHANGE_CHAIN_ID) {
        let values = Object.values(currentlyConnectedPorts);
        for(let i = 0; i < values.length; i++) {
            values[i].postMessage({
                method: "changeChainId",
                data: event.data.chainId
            });

        }
    }
    //Update accounts to all ports.
    if(event.data && event.data.method === MetroRPC.CHANGE_ACCOUNTS) {
        let values = Object.values(currentlyConnectedPorts);
        for(let i = 0; i < values.length; i++) {
            values[i].postMessage({
                method: "changeAccounts",
                data: event.data.accounts
            });

        }
    }
    if(event.data && event.data.method === "closePopup") {
        extension.windows.remove(currentPopup.id);
    }
});

function addListenersToPort(port) {

    


    port.onMessage.addListener((msg) => {

        if(msg.method === EVMRPC.EVM_GET_BALANCE) {
    
            let req = new MetroRequest(msg.method, msg.params);
            req.postJsonRPC(jsonRPCURL).then((response) => {
                response.json().then((json) => {
                    port.postMessage({
                        method: msg.method,
                        data: json,
                    });
                });
            }).catch((e) => {
                port.postMessage({
                    method: msg.method,
                    data: e,
                });
            });
        }
        if(msg.method === EVMRPC.EVM_GET_BLOCK_BY_NUMBER) {
            let req = new MetroRequest(msg.method, msg.params);
            req.postJsonRPC(jsonRPCURL).then((response) => {
                response.json().then((json) => {
                    port.postMessage({
                        method: msg.method,
                        data: json,
                    });
                });
            }).catch((e) => {
                port.postMessage({
                    method: msg.method,
                    data: e,
                });
            });
        }

        if(msg.method === EVMRPC.EVM_GAS_PRICE) {
            let req = new MetroRequest(msg.method, msg.params);
            req.postJsonRPC(jsonRPCURL).then((response) => {
                response.json().then((json) => {
                    port.postMessage({
                        method: msg.method,
                        data: json,
                    });
                });
            }).catch((e) => {
                port.postMessage({
                    method: msg.method,
                    data: e,
                });
            });
        }

        if(msg.method === EVMRPC.EVM_CALL) {
            let req = new MetroRequest(msg.method, msg.params);
            req.postJsonRPC(jsonRPCURL).then((response) => {
                response.json().then((json) => {
                    port.postMessage({
                        method: msg.method,
                        data: json,
                    });
                });
            }).catch((e) => {
                port.postMessage({
                    method: msg.method,
                    data: e,
                });
            });    
        }
        //if the injected script calls eth_blockNumber, we'll send it the result the EVM we are connected to sends us with that request.
        if(msg.method === EVMRPC.EVM_BLOCK_NUMBER) {
    
            let req = new MetroRequest(msg.method, msg.params);
            req.postJsonRPC(jsonRPCURL).then((response) => {
                response.json().then((json) => {
                    port.postMessage({
                        method: msg.method,
                        data: json,
                    });
                });
            }).catch((e) => {
                port.postMessage({
                    method: msg.method,
                    data: e,
                });
            });
            
        }
        if(msg.method === EVMRPC.EVM_ESTIMATE_GAS) {
    
            let req = new MetroRequest(msg.method, msg.params);
            req.postJsonRPC(jsonRPCURL).then((response) => {
                response.json().then((json) => {
                    port.postMessage({
                        method: msg.method,
                        data: json,
                    });
                });
            }).catch((e) => {
                port.postMessage({
                    method: msg.method,
                    data: e,
                });
            });
    
        }
        if(msg.method === EVMRPC.EVM_GET_TRANSACTION_RECEIPT) {
    
            let req = new MetroRequest(msg.method, msg.params);
            req.postJsonRPC(jsonRPCURL).then((response) => {
                response.json().then((json) => {
                    port.postMessage({
                        method: msg.method,
                        data: json,
                    });
                });
            }).catch((e) => {
                port.postMessage({
                    method: msg.method,
                    data: e,
                });
            });
    
        }
        if(msg.method === EVMRPC.EVM_SEND_TRANSACTION) {
            currentNotifRequest = new MetroRequest("eth_sendTransaction", msg.params[0]);
            chrome.windows.create({
                url: "metroNotification/index.html",
                width: 345,
                height: 525,
                top: 0,
                focused: true,
                type: "popup",
            }).then(window => {
                currentPopup = window;
            });
        } 

    });
} 

function connectExternal(port) {
    if(port.name === "metro-worker-messenger") {
        currentPort = port;
        allPorts[port.sender.tab.id] = port;
        
        port.onMessage.addListener((msg) => {
            if(msg.method === MetroRPC.REQUEST_ACCESS) {
                currentNotifRequest = new MetroRequest(MetroRPC.REQUEST_ACCESS, {params: msg.params[0], port:  JSON.stringify(port)});
                
                //Push the request to the pending requests array

                //Open an instance of the wallet:

                /* - Will replace with this once in-wallet-modals become more stable
                 
                currentNotifRequest = new Request("requestAccess", msg);           
                self.clients.matchAll({
                    includeUncontrolled: true,
                    type: 'window'
                }).then((clients) => {
                    if(clients && clients.length  > 0) {
                        clients[0].postMessage(currentNotifRequest);
                        //clients[0].focus();
                    } else {
                     chrome.windows.create({
                            url: "metroNotification/index.html",
                            width: 345,
                            height: 525,
                            top: 0,
                            focused: true,
                            type: "popup",
                        }).then(window => {
                            currentPopup = window;
                    });
                    }
                });
                 */

                chrome.windows.create({
                    url: "metroNotification/index.html",
                    width: 345,
                    height: 525,
                    top: 0,
                    focused: true,
                    type: "popup",
                }).then(window => {
                    currentPopup = window;
                });
            }
        });

        port.onDisconnect.addListener((msg) => {
            if (msg.error) {
                console.warn("Metro-Worker-Messenger Port disconnected: $(msg.error.message)");
            } else {
                console.warn("Port disonnected without error message.");
            }
            if(msg.sender.tab.id in currentlyConnectedPorts) {
                delete currentlyConnectedPorts[msg.sender.tab.id];
                self.clients.matchAll({
                    includeUncontrolled: true,
                    type: 'window',
                }).then((clients) => {
                    if(clients && clients.length) {
                        clients[0].postMessage(new MetroRequest(MetroRPC.GET_CURRENT_CONNECTIONS,  {ports: JSON.stringify(currentlyConnectedPorts)}));
                    }
                });
            }
            if(msg.sender.tab.id in allPorts) {
                delete allPorts[msg.sender.tab.id];
            }
        });
    }
}

//make sure that we connect using OnConnect, OnConnectExternal would mean other
//non-local extensions or contexts...
extension.runtime.onConnect.addListener(connectExternal);
