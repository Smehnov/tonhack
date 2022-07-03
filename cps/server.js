import express from 'express'
import cors from 'cors'
import fs from 'fs'
import exec from 'child_process'

const BN = TonWeb.utils.BN

const app = express();
const crossOption = {
    "origin": '',
    "methods": ['GET', 'HEAD', 'OPTIONS'],
    "exposedHeaders": ['ETag', 'Content-Type', 'Accept-Ranges', 'Content-Length', 'Range'],
    "allowedHeaders": ['*'],
}
app.use(cors(crossOption))
import http from 'http'

const server = http.createServer(app);

import {Server} from "socket.io"

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

import {Peer, tonweb} from "./channel.mjs";
import TonWeb from "tonweb";

const toNano = TonWeb.utils.toNano

const cpsName = "Autonomous Printer"
const cpsDescription = "This is printer #0 located in office. It accepts file and prints it"
const topUpValue = "1"
const servicePrice = "0.05"
const serviceInput = "file"
const channelId = 1234
const seed = "ZyheMWyug5q3xJkKjdCYBKj2izn7gX0IAnObSwK2IQs="

io.on('connection', async (socket) => {
    const seedB = TonWeb.utils.base64ToBytes(seed); // B's private (secret) key

    const serverPeer = new Peer(seedB, false)
    await serverPeer.init()
    let seqN = 0
    let currentState = null
    let lastCloseSignature = null


    console.log('a user connected');

    socket.on('about', (arg, callback) => {
        callback({
            publicKey: TonWeb.utils.bytesToBase64(serverPeer.keyPair.publicKey),
            topUpValue: topUpValue,
            servicePrice: servicePrice,
            cpsName: cpsName,
            cpsDescription: cpsDescription,
            serviceInput: serviceInput,
            channelId: channelId
        })
    },)

    socket.on('start_contract', async (arg) => {

        await serverPeer.setHim(TonWeb.utils.base64ToBytes(arg.publicKey))
        serverPeer.initChannel(toNano(topUpValue), toNano('0'), channelId)
        currentState = serverPeer.channelInitState
        const channelAddress = await serverPeer.channel.getAddress()
        console.log('Start channel:', channelAddress.toString(true, true, true))
    })
    socket.on('get_service', async (arg, callback) => {
        const newState = {...currentState}
        const paymentAmount = toNano(servicePrice)
        newState.balanceA = currentState.balanceA.sub(paymentAmount)
        newState.balanceB = currentState.balanceB.add(paymentAmount)
        if (newState.balanceA.isNeg()) {
            console.log('Not enough client balance')
            callback({
                status: 'error',
                msg: 'not enough balance'
            })
            return
        }

        newState.seqnoA = new BN(seqN + 1)
        console.log('ready to check signature')
        if (!(await serverPeer.channel.verifyState(newState, arg.signature))) {
            console.log('INVALID SIGNATURE')
        } else {
            console.log('Signature is correct')
            seqN += 1
            currentState = newState
            lastCloseSignature = arg.closeSignature

        }
        let data = arg.payload.file.replace('data:application/pdf;base64,', '')
        let buff = new Buffer(data, 'base64');
        fs.writeFileSync(`./files/temp.pdf`, buff);
        // exec('lp ./files/temp.pdf', (err, stdout, stderr) => {
        //     if (err) {
        //         callback({
        //             status: 'err',
        //             msg: 'document printed'
        //         })
        //     } else {
        //         callback({
        //             status: 'ok',
        //             msg: 'error while printing'
        //         })
        //     }
        // });

        callback({
            status: 'ok',
            msg: 'document printed'
        })

    })
    socket.on("disconnect", async (reason) => {
        console.log('disconnect client')
        const closeState = {...currentState}
        closeState.seqnoB = new BN(1)
        await serverPeer.fromWallet.close({
            ...closeState,
            lastCloseSignature
        }).send(toNano('0.05'))
        console.log('channel closed')

  });

});

server.listen(4444, () => {
    console.log('listening on *:4444');
});
