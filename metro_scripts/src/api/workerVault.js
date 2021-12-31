export class WalletVault {
    pinEncryptedSeed;

    constructor(pinEncryptedSeed) {
        this.pinEncryptedSeed = pinEncryptedSeed;

    }
    getSeed() {
        return this.pinEncryptedSeed;
    }
}