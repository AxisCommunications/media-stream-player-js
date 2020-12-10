import { MediaStreamPlayer } from './MediaStreamPlayer'

export * from './Player'
export * from './BasicPlayer'
export * from './Container'
export * from './PlaybackArea'
export * from './Stats'
export * from './utils'
export * from './VideoPlayerProvider'

window.customElements.define('media-stream-player', MediaStreamPlayer)
