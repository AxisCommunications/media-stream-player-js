import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Player } from './Player'

/**
 * Create a custom element that uses React to mount the actual Player component.
 *
 * Note that this does not use a shadow DOM to avoid certain issues with React.
 */

export class MediaStreamPlayer extends HTMLElement {
  constructor() {
    super()
    this.setState = () => {
      /** this is empty on purpose */
    }
  }

  static get observedAttributes() {
    return ['hostname', 'autoplay']
  }

  get hostname() {
    return this.getAttribute('hostname') ?? ''
  }

  set hostname(value: string) {
    this.setAttribute('hostname', value)
  }

  get autoplay() {
    return this.getAttribute('autoplay') ?? 'false'
  }

  set autoplay(value: string) {
    this.setAttribute('autoplay', value)
  }

  /* createPlayer() {
    const { autoplay, hostname } = this

    return <Player hostname={hostname} autoPlay={Boolean(autoplay)} />
  } */

  connectedCallback() {
    console.log(this.hostname)
    window
      .fetch(`http://${this.hostname}/axis-cgi/usergroup.cgi`, {
        credentials: 'include',
        mode: 'no-cors',
      })
      .then(() => {
        ReactDOM.render(<PlayerComponent ob={this} />, this)
      })
      .catch((err) => {
        console.error(`Authorization failed: ${err.message}`)
      })
  }

  disconnectedCallback() {
    ReactDOM.unmountComponentAtNode(this)
  }

  public setState: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string
    }>
  >

  attributeChangedCallback(attrName: string, _: string, value: string) {
    /* if (attrName === 'hostname' || attrName === 'autoplay') {
      // cleanup previous
      // Provide default authentication
    } */
    console.log(attrName)
    this.setState((oldState) => ({ ...oldState, [attrName]: value }))
  }
}

interface PlayerComponentProps {
  ob: {
    setState: React.Dispatch<
      React.SetStateAction<{
        [key: string]: string
      }>
    >
  }
}

const PlayerComponent: React.FC<PlayerComponentProps> = ({ ob }) => {
  const [state, setState] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    ob.setState = setState
  }, [])

  const { hostname, autoplay } = state

  return <Player hostname={hostname} autoPlay={Boolean(autoplay)} />
}
