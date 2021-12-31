import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';
import { IMetroToken } from 'src/metro_backend/tokens';
import { utils } from 'ethers';
import { WalletState } from 'src/metro_backend/walletState';
import { BigNumber } from 'bignumber.js'

enum TxStates {
  NONE,
  TX_SENT,
  GET_GAS,
  VERIFY_TX,
  READY_TO_SEND,
  INSUFFICIENT_FUNDS,
  INCORRECT_RECIPENT_ADDRESS,
  INSUFFICIENT_FUNDS_FOR_TX_FEE,
  
}

@Component({
  selector: 'app-send-popup',
  templateUrl: './send-popup.component.html',
  styleUrls: ['./send-popup.component.scss']
})
export class SendPopupComponent implements OnInit {


  @Input() isPopupOpen: boolean = false;

  @Input() currentAvaxAmount: string = '';
  @Input() tokenArray: IMetroToken[] | null = null;
  @Input() selectedToken: IMetroToken | null = null;
  @Input() walletState: WalletState | null = null;

  txStates = TxStates;
  currentTxState: TxStates = TxStates.NONE;


  currentTxHash: string = '';

  isSelectingToken: boolean = false;

  gettingGas: boolean = false;

  currentAmountToSend: string = '';
  currentRecipent: string = '';


  gasRecomendation = {
    gasLimit: '',
    baseFee: '',
    priorityFee: 'loading',
    estimatedTxFee: '~'
  }  

  selectedPriorityGas: string = '';

  constructor() {
    //this.getTxFeeEstimates(true);
  }

  ngOnInit(): void {
  }

  toggleChangeAsset(toggleTo: boolean | null) {
    this.isSelectingToken = toggleTo == null ? !this.isSelectingToken : toggleTo;
  }


  async selectToken(token: any | null) {
    this.selectedToken = token == null ? null : token;
    this.toggleChangeAsset(false);
    this.selectedPriorityGas = '';
    await this.updateTxState();
  }

  async updateRecipent(event: string) {
    this.currentRecipent = event;
    this.updateTxState();
    await this.updateTxState();
  }
  async updateAmount(event: string) {
    this.currentAmountToSend = event;
    await this.updateTxState();
  }

  async updateTxState() {
    //If the token is null, then we are sending AVAX, otherwise, we are sending de token...
    if(this.selectedToken == null) {
      if(Number(this.currentAmountToSend) > Number(this.currentAvaxAmount)) {
        this.currentTxState = this.txStates.INSUFFICIENT_FUNDS;
        return;
      }

      if(this.currentRecipent != "" && utils.isAddress(this.currentRecipent)) {
        if(Number(this.currentAmountToSend) > 0) {
          this.currentTxState = this.txStates.GET_GAS;
          await this.getTxFeeEstimates(false);
        } else {
          this.currentTxState = this.txStates.NONE;
        }
      } else {
        this.currentTxState = this.txStates.INCORRECT_RECIPENT_ADDRESS;
      }

    }else {
      if(Number(this.currentAmountToSend) > this.selectedToken.tokenBalance) {
        this.currentTxState = this.txStates.INSUFFICIENT_FUNDS;
        return;
      }  
      if(utils.isAddress(this.currentRecipent)) {
        if(Number(this.currentAmountToSend) > 0) {
          this.currentTxState = this.txStates.GET_GAS;
          await this.getTxFeeEstimates(false);
        } else {
          this.currentTxState = this.txStates.NONE;
        }
      } else {
        this.currentTxState = this.txStates.INCORRECT_RECIPENT_ADDRESS;
      }
    }
  }

  //Just gets a fee estimate for the current transaction
  async getTxFeeEstimates(repeat: boolean) {

    if(this.currentTxState == this.txStates.GET_GAS || this.txStates.READY_TO_SEND) {
      if(this.walletState != null && this.isPopupOpen == true) {
        let gas = await this.walletState.getGasEstimates(this.currentRecipent, String(this.currentAmountToSend), this.selectedToken);

        this.gasRecomendation.baseFee = new BigNumber(gas.baseFee).div(1000000000).toString();
        this.gasRecomendation.priorityFee = (new BigNumber(gas.priorityFee).div(1000000000)).plus(this.gasRecomendation.baseFee).toString();
        this.gasRecomendation.gasLimit = gas.gasLimit;

        if(this.selectedPriorityGas == "") {
          this.gasRecomendation.estimatedTxFee = new BigNumber(Number(gas.gasLimit) * Number(this.gasRecomendation.baseFee)).div(1000000000).toString();
          this.selectedPriorityGas = '0';
        } else {
          //this.gasRecomendation.estimatedTxFee = new BigNumber(Number(gas.gasLimit) * Number(this.selectedPriorityGas)).div(1000000000).toString();
          this.gasRecomendation.estimatedTxFee = new BigNumber(Number(this.gasRecomendation.gasLimit) * (Number(this.selectedPriorityGas) + Number(this.gasRecomendation.baseFee))).div(1000000000).toString();
        }

        //console.log(this.gasRecomendation);

        if(this.selectedToken == null) {
          if(Number(this.currentAvaxAmount) < Number(this.currentAmountToSend)) {
            this.currentTxState = this.txStates.INSUFFICIENT_FUNDS;
          }else if(Number(this.currentAvaxAmount) < Number(this.currentAmountToSend) + Number(this.gasRecomendation.estimatedTxFee)) {
            this.currentTxState = this.txStates.INSUFFICIENT_FUNDS_FOR_TX_FEE;
          } else {
            this.currentTxState = this.txStates.READY_TO_SEND;
          }
        } else {
          if(this.selectedToken.tokenBalance < Number(this.currentAmountToSend)) {
            this.currentTxState = this.txStates.INSUFFICIENT_FUNDS;
          }else if(Number(this.currentAvaxAmount) <  Number(this.gasRecomendation.estimatedTxFee)) {
            this.currentTxState = this.txStates.INSUFFICIENT_FUNDS_FOR_TX_FEE;
          }else {
            this.currentTxState = this.txStates.READY_TO_SEND;
          }
        }
      }
    }

    //if(repeat) {
    //  setInterval(async () => {
    //    this.getTxFeeEstimates(false);
    //  }, 3500);
    //}
  }

  selectGasPrice(event: string) {
    this.selectedPriorityGas = (Number(event) - Number(this.gasRecomendation.baseFee)).toString();
    //this.gasRecomendation.estimatedTxFee = new BigNumber(Number(this.gasRecomendation.gasLimit) * Number(this.selectedPriorityGas)).div(1000000000).toString();
    this.gasRecomendation.estimatedTxFee = new BigNumber(Number(this.gasRecomendation.gasLimit) * (Number(this.selectedPriorityGas) + Number(this.gasRecomendation.baseFee))).div(1000000000).toString();
  }

  async sendButton() {
    if(this.currentTxState == this.txStates.READY_TO_SEND) {
      this.currentTxState = this.txStates.VERIFY_TX;
      return;
    }
    if(this.currentTxState == this.txStates.VERIFY_TX) {
      if(this.walletState != null) {
        this.currentTxState = this.txStates.TX_SENT;
        let tx = await this.walletState.sendTx(this.currentRecipent,
          String(this.currentAmountToSend),
          "0x" + new BigNumber(this.gasRecomendation.baseFee).plus(this.selectedPriorityGas).times(1000000000).toString(16),
          "0x"+ new BigNumber(this.selectedPriorityGas).times(1000000000).toString(16),
          this.gasRecomendation.gasLimit,
          this.selectedToken);

        this.currentTxHash = tx.data['result'];
        //console.log(tx);
      }
    }
  }
  cancelTxButton() {
    this.currentTxState = this.txStates.READY_TO_SEND;
  }
  returnButton() {
    this.currentTxState = this.txStates.READY_TO_SEND;
    this.currentTxHash = '';
  }
  openTxInExplorer() {
    if(this.walletState != null && this.currentTxHash != '') {
      this.walletState.openTxInExplorer(this.currentTxHash);
    }
  }
}
