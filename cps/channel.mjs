import TonWeb from 'tonweb'

const BN = TonWeb.utils.BN;
const toNano = TonWeb.utils.toNano;

const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC'; // TON HTTP API url. Use this url for testnet
const apiKey = '2824e83afed364678f20df646ed25b89a273697026ddf1b2d7e5817f658b4178'; // Obtain your API key in https://t.me/tontestnetapibot
export const tonweb = new TonWeb(new TonWeb.HttpProvider(providerUrl, {apiKey})); // Initialize TON SDK

export const publicKeyA = TonWeb.utils.base64ToBytes("yx0on34f1xvOJrItLNHnHy0HdizEaPmtXtfZseha11k=")
export const publicKeyB = TonWeb.utils.base64ToBytes("UJ9QLkTdsVLFZogwitU2h8dv69Oa38S8qC4rtJylfng=")


const getChannelInitState = (initBalanceClient, initBalanceServer) => {
    return {
        balanceA: initBalanceClient, // A's initial balance in Toncoins. Next A will need to make a top-up for this amount
        balanceB: initBalanceServer, // B's initial balance in Toncoins. Next B will need to make a top-up for this amount
        seqnoA: new BN(0), // initially 0
        seqnoB: new BN(0)  // initially 0
    }
}


export class Peer {
    constructor(seed, isClient) {
        this.seed = seed
        this.isClient = isClient//isA

        this.keyPair = tonweb.utils.keyPairFromSeed(this.seed)
        this.wallet = tonweb.wallet.create({
            publicKey: this.keyPair.publicKey
        });
    }

    async init() {
        this.walletAddress = await this.wallet.getAddress();
    }

    //set wallet with which we want to create channel
    async setHim(hisPublicKey) {
        this.hisPublicKey = hisPublicKey

        this.hisWallet = tonweb.wallet.create({
            publicKey: this.hisPublicKey
        });
        this.hisWalletAddress = await this.hisWallet.getAddress();
    }

    initChannel(initBalanceClient, initBalanceServer, channelId) {

        this.channelInitState = getChannelInitState(initBalanceClient, initBalanceServer)
        const channelConfig = {
            channelId: new BN(channelId), // Channel ID, for each new channel there must be a new ID
            addressA: this.isClient ? this.walletAddress : this.hisWalletAddress, // A's funds will be withdrawn to this wallet address after the channel is closed
            addressB: this.isClient ? this.hisWalletAddress : this.walletAddress, // B's funds will be withdrawn to this wallet address after the channel is closed
            initBalanceA: this.channelInitState.balanceA,
            initBalanceB: this.channelInitState.balanceB
        }


        this.channel = tonweb.payments.createChannel({
            ...channelConfig,
            isA: this.isClient,
            myKeyPair: this.keyPair,
            hisPublicKey: this.hisPublicKey,
        });

        this.fromWallet = this.channel.fromWallet({
            wallet: this.wallet,
            secretKey: this.keyPair.secretKey
        });
    }

    async deployChannel() {
        if (this.isClient) {
            await this.fromWallet.deploy().send(toNano('0.05'));
        } else {
            throw 'Deploy from server'
        }
    }

    async topUp() {
        if (this.isClient) {
            await this.fromWallet
                .topUp({coinsA: this.channelInitState.balanceA, coinsB: new BN(0)})
                .send(this.channelInitState.balanceA.add(toNano('0.05'))); // +0.05 TON to network fees
        } else {
            this.fromWallet
                .topUp({coinsA: new BN(0), coinsB: this.channelInitState.balanceB})
                .send(this.channelInitState.balanceB.add(toNano('0.05')));
        }
    }


    async closeChannel() {
        const res = await this.fromWallet.close({
            ...getChannelInitState(toNano('1'), toNano('1'))
        }).send(toNano('0.05'));
        console.log(res)
    }


}
