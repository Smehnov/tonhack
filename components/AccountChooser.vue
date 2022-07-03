<template>
  <div>
    <p v-if="channelControl.clientPeer.wallet.address">
      Account address: <span class="text-blue-500">{{ channelControl.clientPeer.wallet.address.toString(true, true) }}</span>
    </p>
    <p>Public key: <span class="text-blue-500">{{ TonWeb.utils.bytesToBase64(channelControl.clientPeer.keyPair.publicKey) }}</span></p>
  </div>
</template>

<script>
import { defineComponent, onMounted } from '@vue/composition-api'
import TonWeb from 'tonweb'
import { useChannel } from '@/store/channel'
// import { useWallet } from '@/store/wallet'
export default defineComponent({
  setup () {
    // const wallet = useWallet()
    const channelControl = useChannel()
    onMounted(() => {
      // wallet.connectAccount()
    })
    return { channelControl, TonWeb }
    // return { wallet }
  }
})
</script>
