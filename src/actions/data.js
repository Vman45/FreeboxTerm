import { createAction } from 'redux-actions'

export const ioRates = createAction('IO_RATES')
export const disk = createAction('DISK')
export const downloads = createAction('DOWNLOADS')

export const downloading = createAction('DOWNLOADING')
export const endDownload = createAction('DOWNLOAD_END')
