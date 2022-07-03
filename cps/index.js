const TonWeb = require("tonweb");

const BN = TonWeb.utils.BN;


const toNano = TonWeb.utils.toNano;

const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC'; // TON HTTP API url. Use this url for testnet
const apiKey = '2824e83afed364678f20df646ed25b89a273697026ddf1b2d7e5817f658b4178'; // Obtain your API key in https://t.me/tontestnetapibot
const tonweb = new TonWeb(new TonWeb.HttpProvider(providerUrl, {apiKey})); // Initialize TON SDK





const channelInitState = {
    balanceA: toNano('1'), // A's initial balance in Toncoins. Next A will need to make a top-up for this amount
    balanceB: toNano('2'), // B's initial balance in Toncoins. Next B will need to make a top-up for this amount
    seqnoA: new BN(0), // initially 0
    seqnoB: new BN(0)  // initially 0
};

const channelConfig = {
    channelId: new BN(224), // Channel ID, for each new channel there must be a new ID
    addressA: walletAddressA, // A's funds will be withdrawn to this wallet address after the channel is closed
    addressB: walletAddressB, // B's funds will be withdrawn to this wallet address after the channel is closed
    initBalanceA: channelInitState.balanceA,
    initBalanceB: channelInitState.balanceB
}

const initA = async () => {


}


const init = async () => {
    //Prepare entities


    console.log("Started")

    // Config channel


}


const init1 = async () => {


    // to check, call the get method - `state` should change to `TonWeb.payments.PaymentChannel.STATE_OPEN`

    //----------------------------------------------------------------------
    // FIRST OFFCHAIN TRANSFER - A sends 0.1 TON to B

    // A creates new state - subtracts 0.1 from A's balance, adds 0.1 to B's balance, increases A's seqno by 1

    const channelState1 = {
        balanceA: toNano('0.9'),
        balanceB: toNano('2.1'),
        seqnoA: new BN(1),
        seqnoB: new BN(0)
    };

    // A signs this state and send signed state to B (e.g. via websocket)

    const signatureA1 = await channelA.signState(channelState1);

    // B checks that the state is changed according to the rules, signs this state, send signed state to A (e.g. via websocket)

    if (!(await channelB.verifyState(channelState1, signatureA1))) {
        throw new Error('Invalid A signature');
    }
    const signatureB1 = await channelB.signState(channelState1);

    console.log("first transfer")
    data = await channelA.getData();
    console.log(data)

    console.log('balanceA = ', data.balanceA.toString())
    console.log('balanceB = ', data.balanceB.toString())


    //----------------------------------------------------------------------
    // SECOND OFFCHAIN TRANSFER - A sends 0.2 TON to B

    // A creates new state - subtracts 0.2 from A's balance, adds 0.2 to B's balance, increases A's seqno by 1

    const channelState2 = {
        balanceA: toNano('0.7'),
        balanceB: toNano('2.3'),
        seqnoA: new BN(2),
        seqnoB: new BN(0)
    };

    // A signs this state and send signed state to B (e.g. via websocket)

    const signatureA2 = await channelA.signState(channelState2);

    // B checks that the state is changed according to the rules, signs this state, send signed state to A (e.g. via websocket)

    if (!(await channelB.verifyState(channelState2, signatureA2))) {
        throw new Error('Invalid A signature');
    }
    const signatureB2 = await channelB.signState(channelState2);

    //----------------------------------------------------------------------
    // THIRD OFFCHAIN TRANSFER - B sends 1.1 TON TO A

    // B creates new state - subtracts 1.1 from B's balance, adds 1.1 to A's balance, increases B's seqno by 1

    const channelState3 = {
        balanceA: toNano('1.8'),
        balanceB: toNano('1.2'),
        seqnoA: new BN(2),
        seqnoB: new BN(1)
    };

    // B signs this state and send signed state to A (e.g. via websocket)

    const signatureB3 = await channelB.signState(channelState3);

    // A checks that the state is changed according to the rules, signs this state, send signed state to B (e.g. via websocket)

    if (!(await channelA.verifyState(channelState3, signatureB3))) {
        throw new Error('Invalid B signature');
    }
    const signatureA3 = await channelA.signState(channelState3);

    //----------------------------------------------------------------------
    // So they can do this endlessly.
    // Note that a party can make its transfers (from itself to another) asynchronously without waiting for the action of the other side.
    // Party must increase its seqno by 1 for each of its transfers and indicate the last seqno and balance of the other party that it knows.

    //----------------------------------------------------------------------
    // CLOSE PAYMENT CHANNEL

    // The parties decide to end the transfer session.
    // If one of the parties disagrees or is not available, then the payment channel can be emergency terminated using the last signed state.
    // That is why the parties send signed states to each other off-chain.
    // But in our case, they do it by mutual agreement.

    // First B signs closing message with last state, B sends it to A (e.g. via websocket)

    const signatureCloseB = await channelB.signClose(channelState3);

    // A verifies and signs this closing message and include B's signature

    // A sends closing message to blockchain, payments channel smart contract
    // Payment channel smart contract will send funds to participants according to the balances of the sent state.

    if (!(await channelA.verifyClose(channelState3, signatureCloseB))) {
        throw new Error('Invalid B signature');
    }

    await fromWalletA.close({
        ...channelState3,
        hisSignature: signatureCloseB
    }).send(toNano('0.05'));

    console.log("Finished")
    console.log(await channelA.getChannelState());

    data = await channelA.getData();
    console.log(data)

    console.log('balanceA = ', data.balanceA.toString())
    console.log('balanceB = ', data.balanceB.toString())


}

init();