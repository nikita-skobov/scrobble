import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Row,
    Col,
    Button,
} from 'reactstrap'

export class ButtonSpot extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {
            socket,
            game_running,
            is_host,
            my_color,
            turn_color,
            tiles_left,
        } = this.props

        if (is_host && !game_running) {
            return (
                <div style={{ position: 'absolute',  top: 0, left: 0 }}>
                    <Button onClick={() => {socket.emit('start_game')}}>start game</Button>
                </div>
            )
        } else if (game_running && my_color == turn_color) {
            return (
                <div style={{ position: 'absolute',  top: 0, left: 0 }}>
                    <Button onClick={() => {socket.emit('end_turn')}}>END YOUR TURN</Button>
                    <Button disabled>Tiles left:{tiles_left}</Button>
                </div>
            )
        } else if (game_running && turn_color) {
            return (
                <div style={{ position: 'absolute',  top: 0, left: 0 }}>
                    <Button disabled>It's {turn_color}'s turn!</Button>
                    <Button disabled>Tiles left:{tiles_left}</Button>
                </div>
            )
        } else {
            return null
        }
    }
}

export const action_game_has_order = (order) => {
    return {
        type: 'GAME_ORDER',
        payload: {
            order,
        }
    }
}

export const action_got_tiles = (color, tiles) => {
    return {
        type: 'GOT_TILES',
        payload: {
            color,
            tiles,
        }
    }
}

const map_state_to_props = (state, own_props) => {
    const {
        me,
    } = state.players
    const {
        socket,
        game_running,
    } = state.connection
    const {
        turn,
    } = state.turn
    const {
        tiles_left,
    } = state.board

    return {
        tiles_left,
        is_host: me.is_host,
        my_color: me.color,
        turn_color: turn,
        game_running,
        socket,
        ...own_props,
    }
}

export default connect(map_state_to_props)(ButtonSpot)