import { defineStore } from 'pinia'
import { getWallet } from '@/plugins/ton'
export const useWallet = defineStore('wallet', {
  state: () => {
    return {
      account: {
        address: null,
        publicKey: null
      }
    }
  },
  actions: {
    async connectAccount () {
      const account = await getWallet()
      this.account.address = account.address
      this.account.publicKey = account.publicKey
    }
  }
})
