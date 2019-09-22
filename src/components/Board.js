import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Row,
    Col,
    Table,
} from 'reactstrap'
import { connection_reducer } from '../reducers';

export const action_tell_server_board_click = (socket, letter, pos) => {
    return (dispatch) => {
        socket.emit('tile_place', { letter, pos })
        
    }
}

const PlacedTile = (props) => (
    <div style={{ width: '80%', color: 'black', margin: 'auto', textAlign: 'center', backgroundColor: 'rgb(255, 210, 119)'}}>{props.children}</div>
)


const style_obj = {
    empty: { textAlign: 'center', backgroundColor: '#54664f' },
    triple_word: { textAlign: 'center', color: 'white', backgroundColor: '#590800' },
    triple_letter: { textAlign: 'center', color: 'white', backgroundColor: '#96e2e8'},
    double_word: { textAlign: 'center', color: 'white', backgroundColor: '#a768c1' },
    double_letter: { textAlign: 'center', color: 'white', backgroundColor: '#424242'},
    center: { textAlign: 'center', color: 'white', backgroundColor: '#d3a304'},
}
const text_obj = {
    empty: '',
    triple_word: '3W',
    triple_letter: '3L',
    double_word: '2W',
    double_letter: '2L',
    center: '*',
}

const Tile = (props) => {
    const {
        placing_tile,
        placed_tiles,
        NL,
        socket,
        type,
        is_turn,
    } = props


    let style = style_obj[type]
    let inner_text = text_obj[type]

    if (placed_tiles && placed_tiles[NL]) {
        inner_text = <PlacedTile>{placed_tiles[NL].tile}</PlacedTile>
    }


    let click = () => {}
    let click_class = ''
    if (is_turn && !placing_tile && placed_tiles && placed_tiles[NL]) {
        click_class = 'tile_turn_clickable'
        click = () => {
            socket.emit('take_tile', NL)
        }
    }
    if (placing_tile) {
        click_class = 'tile_turn_clickable'
        click = () => {
            console.log('clicked!')
            console.log(props)
            console.log(NL)
            console.log(socket)
            socket.emit('place_tile', placing_tile, NL)
        }
    }

    return (
        <th className={click_class} onClick={click} style={style}>{inner_text}</th>
    )
}

// const TripleWord = () => <th style={{ color: 'white', backgroundColor: '#590800' }}>3W</th>
// const TripleLetter = () => <th style={{ color: 'white', backgroundColor: '#96e2e8'}}>3L</th>
// const DoubleWord = () => <th style={{ color: 'white', backgroundColor: '#a768c1' }}>2W</th>
// const DoubleLetter = () => <th style={{ color: 'white', backgroundColor: '#424242'}}>2L</th>
// const Center = () => <th style={{ color: 'white', backgroundColor: '#d3a304'}}>*</th>

function fillTile(num, letter, obj) {
    const NL = `${letter}${num}`
    
    switch (NL) {
        case 'A1':
        case 'H1':
        case 'A8':
        case 'O8':
        case 'A15':
        case 'H15':
        case 'O15':
        case 'O1': {
            return <Tile {...obj} type="triple_word" NL={NL} />
        }

        case 'C3':
        case 'E5':
        case 'M3':
        case 'K5':
        case 'D12':
        case 'B2':
        case 'B14':
        case 'D4':
        case 'L12':
        case 'N2':
        case 'N14':
        case 'L4':
        case 'E11':
        case 'C13':
        case 'K11':
        case 'M13': {
            return <Tile {...obj} type="double_word" NL={NL} />
        }

        
        case 'A4':
        case 'D1':
        case 'L1':
        case 'G3':
        case 'I3':
        case 'H4':
        case 'O4':
        case 'C7':
        case 'D8':
        case 'C9':
        case 'L8':
        case 'M7':
        case 'M9':
        case 'D15':
        case 'L15':
        case 'A12':
        case 'O12':
        case 'H12':
        case 'G13':
        case 'I13': {
            return <Tile {...obj} type="double_letter" NL={NL} />
        }

        case 'F2':
        case 'J2':
        case 'B6':
        case 'F6':
        case 'J6':
        case 'N6':
        case 'B10':
        case 'F10':
        case 'J10':
        case 'N10':
        case 'F14':
        case 'J14': {
            return <Tile {...obj} type="triple_letter" NL={NL} />
        }

        case 'H8': {
            return <Tile {...obj} type="center" NL={NL} />
        }



        default:
            return <Tile {...obj} type="empty" NL={NL} />
    }
}



const numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O']

export function Board(props) {
    return (
        <Table style={{ height: '100%', tableLayout: 'fixed' }} bordered>
            {numbers.map((num) => {
                return (
                    <tr>
                        {letters.map((letter) => fillTile(num, letter, props))}
                    </tr>
                )
            })}
        </Table>
    )
}

const map_state_to_props = (state, own_props) => {
    const {
        placing_tile,
        placed_tiles
    } = state.board
    const {
        turn,
    } = state.turn
    const {
        color,
    } = state.players.me
    const { socket } = state.connection
    return {
        is_turn: color === turn,
        placing_tile,
        number_of_placed_tiles: Object.keys(placed_tiles).length,
        placed_tiles,
        socket,
        ...own_props
    }
}

const map_actions_to_props = {
    tell_server_board_click: action_tell_server_board_click
}

export default connect(map_state_to_props, map_actions_to_props)(Board)
