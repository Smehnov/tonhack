import { defineStore } from 'pinia'
import TonWeb from 'tonweb'
import { io } from 'socket.io-client'
import { Peer } from '@/plugins/ton'
const BN = TonWeb.utils.BN

const toNano = TonWeb.utils.toNano

export const useChannel = defineStore('channel', {
  state: () => {
    return {
      clientPeer: new Peer(TonWeb.utils.base64ToBytes('k/H/ppGdbuIHyJS5NA33kH5BDF7tXFUeecnIcK0iPTs='), true),
      socket: null,
      topUpValue: null,
      servicePrice: null,
      serviceInput: 'file',
      cpsStatus: '',
      cpsName: '',
      cpsDescription: '',
      channelAddress: null,
      currentState: null,
      seqN: 0,
      lastResponse: { status: 'wait', msg: 'no response' },
      channelId: 0

    }
  },
  actions: {
    connectToCps (address) {
      this.socket = io(`http://${address}`, { secure: false })
      this.socket.emit('about', '', async (response) => {
        console.log(response)
        await this.clientPeer.setHim(TonWeb.utils.base64ToBytes(response.publicKey))
        this.topUpValue = response.topUpValue
        this.servicePrice = response.servicePrice
        this.cpsName = response.cpsName
        this.cpsDescription = response.cpsDescription
        this.serviceInput = response.serviceInput
        this.channelId = response.channelId
      })
    },
    async startChannel () {
      await this.clientPeer.init()

      this.clientPeer.initChannel(toNano(this.topUpValue), toNano('0'), this.channelId)
      this.currentState = this.clientPeer.channelInitState
      this.seqN = 0
      console.log(this.clientPeer.keyPair.publicKey)
      this.socket.emit('start_contract', {
        publicKey: TonWeb.utils.bytesToBase64(this.clientPeer.keyPair.publicKey)
      })
      await this.clientPeer.deployChannel()

      await this.clientPeer.topUp()

      await this.clientPeer.fromWallet.init(this.clientPeer.channelInitState).send(toNano('0.05'))

      this.channelAddress = await this.clientPeer.channel.getAddress()

      console.log(this.clientPeer.channel)
    },
    async payForService (payload) {
      this.lastResponse = { status: 'wait', msg: 'no response' }
      const paymentAmount = toNano(this.servicePrice)
      if (this.currentState.balanceA.lt(paymentAmount)) {
        return
      }

      this.seqN += 1
      // Kostyl the Great
      this.currentState.balanceA = this.currentState.balanceA.sub(paymentAmount)
      this.currentState.balanceB = this.currentState.balanceB.add(paymentAmount)

      this.currentState.seqnoA = new BN(this.seqN)
      const newStateSignature = await this.clientPeer.signNewChannelState(this.currentState)
      const closeState = { ...this.currentState }
      closeState.seqnoB = new BN(1)
      const closeSignature = await this.clientPeer.channel.signClose(closeState)
      this.socket.emit('get_service', {
        seqN: this.seqN,
        signature: newStateSignature,
        payload,
        closeSignature
      }, (response) => {
        this.lastResponse = { ...response }
      })
    }

  }
})
