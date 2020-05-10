import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Row,
    Col,
    Table,
} from 'reactstrap'

const has = Object.prototype.hasOwnProperty
const numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O']

export const action_tell_server_board_click = (socket, letter, pos) => {
    return (dispatch) => {
        socket.emit('tile_place', { letter, pos })
        
    }
}

const PlacedTile = (props) => (
    <div style={{ width: '80%', color: 'black', margin: 'auto', textAlign: 'center', backgroundColor: 'rgb(255, 210, 119)'}}>{props.children}</div>
)

const action_change_my_score = (socket, newScore) => {
    return {
        type: 'MY_TURN_SCORE',
        payload: newScore
    }
}

function get_value_from_tile(tile_string) {
    // I originally programmed the value to simply be
    // a string on the tile, and I didn't implement a seperate
    // value system... so now I need to extract
    // the value from the string, luckily theres
    // a finite number of values in scrabble:
    const value_str = tile_string.slice(-2)
    switch (value_str) {
        case ' ₀' : return 0
        case ' ₁' : return 1
        case ' ₂' : return 2
        case ' ₃' : return 3
        case ' ₄' : return 4
        case ' ₅' : return 5
        case ' ₈' : return 8
        case '₁₀' : return 10
    }
}

function word_multiplier(board_key) {
    switch (board_key) {
        // triple word
        case 'A1':
        case 'H1':
        case 'A8':
        case 'O8':
        case 'A15':
        case 'H15':
        case 'O15':
        case 'O1': return 3

        // double word
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
        case 'M13': return 2

        // center is double word
        case 'H8': return 2
 
        default: return 1
    }
}

function multiplier(board_key) {
    switch (board_key) {
        // double letter        
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
        case 'G7':
        case 'I7':
        case 'G9':
        case 'I9':
        case 'I13': return 2

        // triple letter
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
        case 'J14': return 3

        default: return 1
    }
}


function get_my_placed_tiles_this_turn(board_tiles, my_tiles_this_turn) {
    const my_placed_tiles = {}
    Object.keys(my_tiles_this_turn).forEach((key) => {
        if (has.call(board_tiles, key)) {
            // also check if its the same tile,
            // not just matching location:
            if (board_tiles[key].tile === my_tiles_this_turn[key]) {
                my_placed_tiles[key] = board_tiles[key].tile
            }
        }
    })
    return my_placed_tiles
}

function get_tiles_left_of(location, board_state) {
    const x = location.charAt(0)
    const y = location.substr(1)
    const x_ind = letters.indexOf(x)
    let check_x_ind = x_ind - 1
    let check_x = letters[check_x_ind]
    let check_key = `${check_x}${y}`

    const left_tiles = []
    while (has.call(board_state, check_key)) {
        left_tiles.push(check_key)
        check_x_ind -= 1
        check_x = letters[check_x_ind]
        check_key = `${check_x}${y}`
    }
    return left_tiles
}

function get_tiles_right_of(location, board_state) {
    const x = location.charAt(0)
    const y = location.substr(1)
    const x_ind = letters.indexOf(x)
    let check_x_ind = x_ind + 1
    let check_x = letters[check_x_ind]
    let check_key = `${check_x}${y}`

    const right_tiles = []
    while (has.call(board_state, check_key)) {
        right_tiles.push(check_key)
        check_x_ind += 1
        check_x = letters[check_x_ind]
        check_key = `${check_x}${y}`
    }
    return right_tiles
}

function get_tiles_above(location, board_state) {
    const x = location.charAt(0)
    const y = location.substr(1)
    const y_ind = numbers.indexOf(parseInt(y, 10))
    let check_y_ind = y_ind - 1
    let check_y = numbers[check_y_ind]
    let check_key = `${x}${check_y}`
    
    const above_tiles = []
    while (has.call(board_state, check_key)) {
        above_tiles.push(check_key)
        check_y_ind -= 1
        check_y = numbers[check_y_ind]
        check_key = `${x}${check_y}`
    }
    return above_tiles
}

function get_tiles_below(location, board_state) {
    const x = location.charAt(0)
    const y = location.substr(1)
    const y_ind = numbers.indexOf(parseInt(y, 10))
    let check_y_ind = y_ind + 1
    let check_y = numbers[check_y_ind]
    let check_key = `${x}${check_y}`

    const below_tiles = []
    while (has.call(board_state, check_key)) {
        below_tiles.push(check_key)
        check_y_ind += 1
        check_y = numbers[check_y_ind]
        check_key = `${x}${check_y}`
    }
    return below_tiles
}

function get_my_words(my_placed_tiles_this_turn, board_state) {
    const exclude_horizontal = []
    const exclude_vertical = []
    const words = []
    const my_placed_locations = my_placed_tiles_this_turn
    for (let i = 0; i < my_placed_locations.length; i += 1) {
        let skip_horizontal_check = false
        let skip_vertical_check = false
        const tile_location = my_placed_locations[i]
        if (exclude_horizontal.includes(tile_location)) {
            skip_horizontal_check = true
        }
        if (exclude_vertical.includes(tile_location)) {
            skip_vertical_check = true
        }

        if (!skip_horizontal_check) {
            const left_tiles = get_tiles_left_of(tile_location, board_state)
            const right_tiles = get_tiles_right_of(tile_location, board_state)
            if (left_tiles.length || right_tiles.length) {
                exclude_horizontal.push(tile_location)
                exclude_horizontal.push(...left_tiles)
                exclude_horizontal.push(...right_tiles)
                words.push([...left_tiles, tile_location, ...right_tiles])
            }
        }
        if (!skip_vertical_check) {
            const above_tiles = get_tiles_above(tile_location, board_state)
            const below_tiles = get_tiles_below(tile_location, board_state)
            if (above_tiles.length || below_tiles.length) {
                exclude_vertical.push(tile_location)
                exclude_vertical.push(...below_tiles)
                exclude_vertical.push(...above_tiles)
                words.push([...above_tiles, tile_location, ...below_tiles])
            }
        }
    }
    return words
}

function get_word_score(word, board_state, my_placed_locations) {
    let score = 0

    // word is an array of tile locations
    // get the value of each tile
    // apply multipliers only if we placed that tile
    // this turn
    let final_word_multiplier = 1
    for (let i = 0; i < word.length; i += 1) {
        const tile_location = word[i]
        const tile_str = board_state[tile_location]
        let tile_value = get_value_from_tile(tile_str)
        if (my_placed_locations.includes(tile_location)) {
            // this is my tile, so apply 
            // multipliers if any:
            tile_value *= multiplier(tile_location)
            const word_mult = word_multiplier(tile_location)
            if (word_mult > final_word_multiplier) {
                final_word_multiplier = word_mult
            }
        }
        score += tile_value
    }

    score *= final_word_multiplier
    return score
}

function get_new_score(tile, location, board_tiles, my_tiles_this_turn) {
    // my tiles this turn is a misnomer
    // it includes tiles that I placed and then put back. So
    // filter based on the ones that are actually on the board at the time:    
    const board_state = {}
    Object.keys(board_tiles).forEach((tile_key) => {
        board_state[tile_key] = board_tiles[tile_key].tile
    })
    const my_placed_tiles_this_turn = get_my_placed_tiles_this_turn(board_tiles, my_tiles_this_turn)
    const my_placed_locations = Object.keys(my_placed_tiles_this_turn)
    if (!tile) {
        // we removed the tile at location
        // so remove it from the placed tiles:
        const ind = my_placed_locations.indexOf(location)
        my_placed_locations.splice(ind, 1)
        delete board_state[location]
    } else {
        board_state[location] = tile
        my_placed_tiles_this_turn[location] = tile
        my_placed_locations.push(location)
    }

    const my_words = get_my_words(my_placed_locations, board_state)
    let score = 0
    my_words.forEach((word) => {
        score += get_word_score(word, board_state, my_placed_locations)
    })
    console.log(`TOTAL SCORE: ${score}`)

    return score
}


const style_obj = {
    empty: { textAlign: 'center', backgroundColor: '#54664f' },
    triple_word: { textAlign: 'center', color: 'white', backgroundColor: '#590800' },
    triple_letter: { textAlign: 'center', color: 'white', backgroundColor: '#09656c'},
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
        my_tiles_this_turn,
        change_my_score,

        // // todo: use existing
        // // score to modify the actual score automatically
        // // box instead of the display score box
        // my_score,
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
    if (is_turn && !placing_tile && my_tiles_this_turn && my_tiles_this_turn[NL]) {
        click_class = 'tile_turn_clickable'
        click = () => {
            socket.emit('take_tile', NL)
            const new_score = get_new_score('', NL, placed_tiles, my_tiles_this_turn)
            change_my_score(socket, new_score)
        }
    }
    if (placing_tile) {
        click_class = 'tile_turn_clickable'
        click = () => {
            const new_score = get_new_score(placing_tile, NL, placed_tiles, my_tiles_this_turn)
            change_my_score(socket, new_score)
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
        case 'G7':
        case 'I7':
        case 'G9':
        case 'I9':
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


export function Board(props) {
    return (
        <Table style={{ height: '100%', tableLayout: 'fixed' }} bordered>
            <tbody>
                {numbers.map((num) => {
                    return (
                        <tr>
                            {letters.map((letter) => fillTile(num, letter, props))}
                        </tr>
                    )
                })}
            </tbody>
        </Table>
    )
}

const map_state_to_props = (state, own_props) => {
    const {
        placing_tile,
        placed_tiles,
        my_tiles_this_turn,
    } = state.board
    const {
        turn,
    } = state.turn
    const {
        color,
        score,
    } = state.players.me
    const { socket } = state.connection
    return {
        is_turn: color === turn,
        placing_tile,
        number_of_placed_tiles: Object.keys(placed_tiles).length,
        placed_tiles,
        my_score: score,
        my_tiles_this_turn,
        number_my_tiles_placed: Object.keys(my_tiles_this_turn).length,
        socket,
        ...own_props
    }
}

const map_actions_to_props = {
    change_my_score: action_change_my_score,
    tell_server_board_click: action_tell_server_board_click
}

export default connect(map_state_to_props, map_actions_to_props)(Board)
