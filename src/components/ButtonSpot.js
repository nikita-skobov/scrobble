import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Row,
    Col,
    Button,
    Input,
} from 'reactstrap'

import SwapTileButton from './SwapTileButton'

function ButtonSpot(props) {
    const {
        socket,
        game_running,
        is_host,
        my_color,
        my_score,
        turn_score,
        turn_color,
        tiles_left,
        change_my_score,
    } = props

    const new_score = my_score + turn_score
    const end_turn = () => {
        socket.emit('end_turn')
        change_my_score(socket, new_score)
    }

    if (is_host && !game_running) {
        return (
            <div style={{ display: 'inherit' }}>
                <Button onClick={() => {socket.emit('start_game')}}>start game</Button>
            </div>
        )
    } else if (game_running && my_color == turn_color) {
        return (
            <div style={{ display: 'inherit' }}>
                <Button onClick={end_turn}>END YOUR TURN</Button>
                <SwapTileButton />
                <Button disabled>Tiles left:{tiles_left}</Button>
            </div>
        )
    } else if (game_running && turn_color) {
        return (
            <div style={{ display: 'inherit' }}>
                <Button disabled>It's {turn_color}'s turn!</Button>
                <Button disabled>Tiles left:{tiles_left}</Button>
            </div>
        )
    } else {
        return null
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

const action_change_my_score = (socket, newScore) => {
    socket.emit('change_score', newScore)
    return {
        type: 'SCORE_CHANGED',
        payload: {
            score: newScore,
            is_mine: true,
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
        my_score: me.score,
        turn_score: state.turn_score.my_turn_score,
        turn_color: turn,
        game_running,
        socket,
        ...own_props,
    }
}

const map_actions_to_props = {
    change_my_score: action_change_my_score,
}

export default connect(map_state_to_props, map_actions_to_props)(ButtonSpot)