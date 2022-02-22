import { Format } from './types'

export const FORMAT_SUPPORTS_AUDIO = {
  [Format.RTP_H264]: true,
  [Format.RTP_JPEG]: false,
  [Format.MP4_H264]: true,
  [Format.JPEG]: false,
} as const
