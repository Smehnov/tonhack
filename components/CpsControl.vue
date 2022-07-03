<template>
  <div>
    <div>
      <input class="border-b-2 border-gray-800 py-2 my-2 px-4" :value="deviceUrl.value" @input="event=>deviceUrl.value=event.target.value">

      <button class="uppercase py-2 my-2 px-4 bg-transparent dark:text-gray-800 dark:bg-white hover:dark:bg-gray-100 border-2 border-gray-800 text-gray-800 dark:text-white hover:bg-gray-800 hover:text-white text-md" @click="connectToDevice">
        Connect to device
      </button>
    </div>
    <div v-if="channelControl.topUpValue">
      <p>Cps name: <span class="text-blue-500 text-md">{{ `${channelControl.cpsName}` }}</span></p>
      <p>Cps description: <span class="text-blue-500">{{ `${channelControl.cpsDescription}` }}</span></p>
      <p>CPS Address: <a target="_blank" :href="`https://testnet.tonscan.org/address/${channelControl.clientPeer.hisWalletAddress.toString(true, true, true)}`" class="text-blue-500">{{ channelControl.clientPeer.hisWalletAddress.toString(true, true, true) }}</a></p>
      <p>Top up value: <span class="text-blue-500">{{ `${channelControl.topUpValue} TON` }}</span></p>
      <p>Service price: <span class="text-blue-500">{{ `${channelControl.servicePrice} TON` }}</span></p>

      <button v-if="!channelControl.channelAddress" class="uppercase py-2 my-2 px-4 bg-transparent dark:text-gray-800 dark:bg-white hover:dark:bg-gray-100 border-2 border-gray-800 text-gray-800 dark:text-white hover:bg-gray-800 hover:text-white text-md" @click="channelControl.startChannel">
        Make contract(start payment channel)
      </button>

      <div v-else class="mt-8">
        <p>Channel address: <a target="_blank" :href="`https://testnet.tonscan.org/address/${channelControl.channelAddress.toString(true, true, true)}`" class="text-blue-500">{{ `${channelControl.channelAddress.toString(true, true, true)}` }}</a></p>
        <p>Client channel balance: <a class="text-blue-500">{{ channelControl.currentState.balanceA }} nanoTON</a></p>
        <p>Server channel balance: <a class="text-blue-500">{{ channelControl.currentState.balanceB }} nanoTON</a></p>
        <div v-if="channelControl.serviceInput==='file'" class="mt-8">
          <label class="block mb-2 text-blue-500 text-lg text-gray-900 dark:text-gray-300">Upload file:</label>
          <input class="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" type="file" @change="fileUploaded">

          <button
            class="uppercase py-2 my-2 px-4 bg-transparent dark:text-gray-800 dark:bg-white hover:dark:bg-gray-100 border-2 border-gray-800 text-gray-800 dark:text-white hover:bg-gray-800 hover:text-white text-md"
            @click="sendFile"
          >
            Send file
          </button>
          <p>Last response: <span class="text-blue-500">{{ channelControl.lastResponse.status }}: {{ channelControl.lastResponse.msg }}</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from '@vue/composition-api'
import { useChannel } from '@/store/channel'

export default defineComponent({
  setup () {
    const deviceUrl = ref('localhost:4444')
    const channelControl = useChannel()
    const curFile = ref(null)
    onMounted(() => {

    })
    const connectToDevice = () => {
      channelControl.connectToCps(deviceUrl.value)
    }
    const fileUploaded = (event) => {
      curFile.value = event.target.files[0]
    }
    const sendFile = () => {
      const reader = new FileReader()
      reader.readAsDataURL(curFile.value)
      reader.onload = async () => {
        const base64File = reader.result
        await channelControl.payForService({
          file: base64File
        })
      }
    }
    return { deviceUrl, channelControl, connectToDevice, fileUploaded, sendFile }
  }
})
</script>
