import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CurrentNotification, Notifications } from '../../app.component';
import { utils } from 'ethers';
import { TransactionTypes } from 'src/metro_backend/decodeEVMTx';
import { BigNumber } from 'bignumber.js'
import { IUnsignedEVMTransaction, WalletState } from 'src/metro_backend/walletState';
import { getTransactionReceipt } from 'src/metro_backend/walletState';

enum TransactionStates {
  PENDING,
  FAILED,
  SUCCESS,
}
@Component({
  selector: 'app-notification-module',
  templateUrl: './notification-module.component.html',
  styleUrls: ['./notification-module.component.scss']
})


export class NotificationModuleComponent implements OnInit {

  notifications = Notifications;
  @Input() currentNotification: CurrentNotification = new CurrentNotification(this.notifications.NONE);

  @Input() walletState: WalletState | null = null;
  @Input() evmTx: any;

  @Input() titleText: string = "Can devs fix";
  @Input() approveButtonText: string = "Approve";
  @Input() rejectButtonText: string = "Reject";
  @Input() requestText: string = "";
  @Input() infoBoxText: string = "";

  @Input() fromText: string = "Unknown";

  txTypes = TransactionTypes;
  //currentTxType: TransactionTypes = TransactionTypes.SWAP_EXACT_AVAX_FOR_TOKENS; not necessary

  //Having all this shit in one component is really stupid, I will split things up and re-factor
  //at a later time since I need to get the alpha wrapped up...
  isTxSent: boolean = false;
  nonce: number = 0;
  @Input() txHash: string = '';

  timeUntilTxFinal: string = '0';

  txStates = TransactionStates;
  currentTxState: TransactionStates = TransactionStates.PENDING;
  

  
  @Output() approveButtonClick = new EventEmitter<any>();
  @Output() rejectButtonClick = new EventEmitter();
  @Output() returnButtonClick = new EventEmitter();

  @Input() txData: any;

  gasRecomendation = {
    gasLimit: '',
    baseFee: '',
    priorityFee: 'loading',
    estimatedTxFee: '~'
  } 
  selectedPriorityGas: string = '';
  


  constructor() {
    this.getTxFeeEstimates(true);
  }

  ngOnInit(): void {

  }

  selectGasPrice(event: string) {
    this.selectedPriorityGas = (Number(event) - Number(this.gasRecomendation.baseFee)).toString();
    //this.gasRecomendation.estimatedTxFee = new BigNumber(Number(this.gasRecomendation.gasLimit) * Number(this.selectedPriorityGas)).div(1000000000).toString();
    this.gasRecomendation.estimatedTxFee = new BigNumber(Number(this.gasRecomendation.gasLimit) * (Number(this.selectedPriorityGas) + Number(this.gasRecomendation.baseFee))).div(1000000000).toString();
  }

    //Just gets a fee estimate for the current transaction
  async getTxFeeEstimates(repeat: boolean) {
    if(this.currentNotification.notification == this.notifications.ISSUE_TRANSACTION && this.isTxSent == false) {
      if(this.walletState != null && this.evmTx != null) {
        let txUnsigned: IUnsignedEVMTransaction = {
          from: this.evmTx[0].from,
          to: this.evmTx[0].to,
          value: this.evmTx[0].value,
          data: this.evmTx[0].data,
          type: 2,
        }
        let gas = await this.walletState.getGasEstimateRaw(txUnsigned);
  
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
        if(Number(this.walletState.avaxAmountWholePrecise) < Number(this.gasRecomendation.estimatedTxFee)) {
          console.error("Metro: Not enough AVAX to cover fees...");
        }
      }
    }
    if(repeat) {
      setInterval(async () => {
        this.getTxFeeEstimates(false);
      }, 4000);
    }
  }
  async startTxTimer() {
    setInterval(async () => {
      if(this.isTxSent && this.currentTxState == this.txStates.PENDING) {
        let currentTime: number = (Number(this.timeUntilTxFinal));
        currentTime += 0.05;
        this.timeUntilTxFinal = currentTime.toPrecision(3).toString();
      }
    }, 50);
  }
  async getTxReceipt(repeat: boolean) {

    if(this.txHash != '' && this.currentTxState == this.txStates.PENDING) {
      let txReceipt = await getTransactionReceipt(this.txHash);
      if(txReceipt.data.result != null) {
        if(txReceipt.data.result.status == '0x1') {
          this.currentTxState = this.txStates.SUCCESS;
          return;
        } else if(txReceipt.data.result.status == '0x0') {
          this.currentTxState = this.txStates.FAILED;
          return;
        }
      }else {
        this.currentTxState = this.txStates.PENDING;
      }
    }

    if(repeat) {
      setInterval(async () => {
        this.getTxReceipt(false);
      }, 700);
    }
  }
  async openInExplorer() {
    if(utils.isHexString(this.txHash)) {
      this.walletState?.openTxInExplorer(this.txHash);
    }
  }

  async approveButton() {

    this.nonce = (await this.walletState?.getNonce())?.data.result;
    if(this.currentNotification.notification == this.notifications.ISSUE_TRANSACTION) {
      let txUnsigned: IUnsignedEVMTransaction = {
        from: this.evmTx[0].from,
        chainId: this.walletState?.nodeDetails.CHAIN_ID,
        nonce: (await this.walletState?.getNonce())?.data.result,
        to: this.evmTx[0].to,
        value: this.evmTx[0].value,
        data: this.evmTx[0].data,
        maxFeePerGas: "0x" + new BigNumber(this.gasRecomendation.baseFee).plus(this.selectedPriorityGas).times(1000000000).toString(16),
        maxPriorityFeePerGas: "0x" + new BigNumber(this.selectedPriorityGas).times(1000000000).toString(16),
        gasLimit: this.gasRecomendation.gasLimit,
        type: 2,
      }
      this.isTxSent = true;
      this.getTxReceipt(true);
      await this.startTxTimer();
      this.approveButtonClick.emit(txUnsigned);
    } else {
      this.approveButtonClick.emit(null);
    }
  }
  rejectButton() {
    this.rejectButtonClick.emit();
  }
  returnButton() {
    this.returnButtonClick.emit();
  }
}
