import React from 'react'
import { connect } from 'react-redux'

import ConnectMod from './ConnectModal'
import ConnectBoard from './BoardGame'

export function App(props) {
    console.log(props)
    const {
        is_connected
    } = props

    if (!is_connected) {
        // show connection modal
        return <ConnectMod />
    }

    return <ConnectBoard />
}


const map_state_to_props = (state, own_props) => {
    const {
        is_connected
    } = state.connection
    return { is_connected, ...own_props }
}

export default connect(map_state_to_props)(App)
