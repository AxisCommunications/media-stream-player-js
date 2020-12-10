import { createContext } from 'react'
import { VapixParameters, VideoProperties } from '.'

export interface IVideoPlayerContext {
  readonly play: boolean
  readonly setPlay: React.Dispatch<React.SetStateAction<boolean>>
  readonly refresh: number
  readonly setRefresh: React.Dispatch<React.SetStateAction<number>>
  readonly host: string
  readonly setHost: React.Dispatch<React.SetStateAction<string>>
  readonly api: string
  readonly volume?: number
  readonly setVolume?: React.Dispatch<React.SetStateAction<number | undefined>>
  readonly parameters: VapixParameters
  readonly setParameters: React.Dispatch<React.SetStateAction<VapixParameters>>
  readonly videoProperties?: VideoProperties
  readonly setVideoProperties: React.Dispatch<
    React.SetStateAction<VideoProperties | undefined>
  >
}

// eslint-disable-next-line
const NOOP = () => {}

export const VideoPlayerContext = createContext<IVideoPlayerContext>({
  play: false,
  setPlay: NOOP,
  refresh: 0,
  host: '',
  setHost: NOOP,
  setRefresh: NOOP,
  api: 'jpg',
  volume: undefined,
  setVolume: NOOP,
  parameters: {},
  setParameters: NOOP,
  videoProperties: undefined,
  setVideoProperties: NOOP,
})
