import store from 'store'

export const getHeaders = () => ({ headers: { 'X-Fbx-App-Auth': store.getState().config.get('session') } })
