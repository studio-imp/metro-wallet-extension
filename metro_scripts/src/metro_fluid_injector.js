import { WindowPostMessageStream } from '@metamask/post-message-stream';
import extension from 'extensionizer';


//Create a port duplex stream with our service worker (local to this extension, nothing else can hear this!)
let port = extension.runtime.connect({name: "metro-worker-messenger"});

injectFluids();
setupStreams();

function injectFluids() {
  try {
    var s = document.createElement('script');
    //s.setAttribute('async', 'false');
    s.src = chrome.runtime.getURL('metro_injected_fluids-bundle.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
  }catch (error) {
    console.error("Failed injecting Metro / Metamask provider");
  }
}
function setupStreams() {
  //Setup a duplex-stream with the injected script.
  const contentToInjectStream = new WindowPostMessageStream({
    name: 'metro-contentscript',
    target: 'metro-inject',
  });

  //Make sure we are aware if the port disconnects.
  port.onDisconnect.addListener((msg) => {
    if(msg.error) {
      console.warn("Metro-Worker-Messenger Port disconnected: $(msg.error.message)");
    } else {
      console.warn("Metro-Worker-Messenger Port disconnected without error message");
    }
    port = extension.runtime.connect({name: "metro-worker-messenger"});
  });
  //Listen to data from our service worker.
  port.onMessage.addListener((msg) => {
    contentToInjectStream.write(msg);
  });
  //Forward data from the injected script to the service worker.
  contentToInjectStream.on('data', (data) => {
      port.postMessage(data);
  });
}