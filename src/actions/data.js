import { createAction } from 'redux-actions'

export const ioRates = createAction('IO_RATES')
export const disk = createAction('DISK')
export const downloads = createAction('DOWNLOADS')
export const wifi = createAction('WIFI')
export const dlMode = createAction('DL_MODE')

export const downloading = createAction('DOWNLOADING')
export const endDownload = createAction('DOWNLOAD_END')
