import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Row,
    Col,
} from 'reactstrap'

export const action_enter_tile_place_mode = (tile) => {
    console.log(tile)
    console.log(tile.target)
    return {
        type: 'TILE_SELECTED',
        payload: {
            tile: tile.target.innerHTML,
        }
    }
}

function fillVertical(tile, color) {
    return (
        <div class="tile-container">
            <div style={{ backgroundColor: color }} class="tile">{tile}</div>
        </div>
    )
}

function fillHorizontal(tile, color, is_turn, enter_tile_place_mode) {
    let click_func = () => {}
    let turn_class = ""
    if (is_turn) {
        click_func = enter_tile_place_mode
        turn_class = "tile_turn_clickable"
    }
    return (
        <Col className={turn_class} onClick={click_func} style={{ backgroundColor: color, margin: '5px', color: 'white' }}>{tile}</Col>
    )
}

export function PlayerSpot(props) {
    const {
        tiles,
        player_obj,
        is_turn,
        enter_tile_place_mode,
    } = props

    console.log('rendering player spot: ')
    console.log(player_obj)

    if (!player_obj) return null
    // player hasnt connected yet, so we dont have data.

    if (props.vertical) {
        return <div style={{ width: '90%', height: '100%', marginLeft: 'auto', marginRight: 'auto'}}>
            {tiles.map((tile) => fillVertical(tile, player_obj.color))}
        </div>
    } else {
        return (
            <Row style={{ marginLeft: '10%', marginRight: '10%', width: '100%' }}>
                <Row noGutters style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
                    {tiles.map((tile) => fillHorizontal(tile, player_obj.color, is_turn, enter_tile_place_mode))}
                </Row>
            </Row>
        )
    }
}

const map_state_to_props = (state, own_props) => {
    const pos = own_props.player_pos
    console.log('got new player tiles')
    console.log(pos)

    const {
        turn,
    } = state.turn
    
    let player_obj
    if (pos === 'me') {
        player_obj = state.players.me
    } else if (pos === 'left') {
        player_obj = state.players.left
    } else if (pos === 'top') {
        player_obj = state.players.top
    } else if (pos === 'right') {
        player_obj = state.players.right
    }
    console.log(player_obj)

    // if (typeof player_obj === 'object') {
    //     player_obj.tiles = ['a']
    // }

    return {
        num_tiles: player_obj.tiles ? player_obj.tiles.length : 0,
        tiles: player_obj.tiles,
        player_obj,
        is_turn: turn === state.players.me.color,
        ...own_props,
    }
}

const map_actions_to_props = {
    enter_tile_place_mode: action_enter_tile_place_mode,
}

export default connect(map_state_to_props, map_actions_to_props)(PlayerSpot)
