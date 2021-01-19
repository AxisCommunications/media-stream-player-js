import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { BasicPlayer } from 'media-stream-player'

// Force a login by fetching usergroup
const authorize = async () => {
  try {
    await window.fetch('/axis-cgi/usergroup.cgi', {
      credentials: 'include',
      mode: 'no-cors',
    })
  } catch (err) {
    console.error(err)
  }
}

/**
 * Example application that uses the `BasicPlayer` component.
 */

export const BasicStream = () => {
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    authorize().then(() => {
      setAuthorized(true)
    })
  }, [])

  if (!authorized) {
    return <div>authenticating...</div>
  }

  return (
    <BasicPlayer
      hostname={window.location.host}
      format="RTP_H264"
      autoPlay
      vapixParams={{ resolution: '800x600' }}
    />
  )
}
