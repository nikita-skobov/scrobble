import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Row,
    Col,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
} from 'reactstrap'


function fillHorizontal(tile, color, is_turn, select_tile) {
    let click_func = () => {}
    let turn_class = ""
    if (is_turn) {
        click_func = select_tile
        turn_class = "tile_turn_clickable"
    }
    return (
        <Col className={turn_class} onClick={click_func} style={{ backgroundColor: color, margin: '5px', color: 'white' }}>{tile}</Col>
    )
}

function action_swap_tile(socket, tiles) {
    socket.emit('replace_tiles', tiles)

    return {
        type: 'dsadsadsa',
        payload: {
            s: 1,
        }
    }
}

export class SwapTileButton extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modal: false,
            tile_selected: '',
        }

        this.toggle = this.toggle.bind(this)
        this.select_tile = this.select_tile.bind(this)
    }

    toggle() {
        this.setState(prevState => ({
            modal: !prevState.modal
        }))
    }

    select_tile(e) {
        console.log(e.target.innerHTML)
        const { innerHTML } = e.target
        this.setState(() => ({
            tile_selected: innerHTML
        }))
    }

    render() {
        const {
            tiles,
            player_obj,
            is_turn,
            swap_tile,
            can_swap,
            socket,
        } = this.props

        const {
            tile_selected
        } = this.state

        console.log('rendering player spot: ')
        console.log(player_obj)

        if (!player_obj || !can_swap) {
            // player hasnt connected yet, so we dont have data.
            return (
                <div>
                    <Button color="danger" disabled onClick={this.toggle}>Swap Tiles</Button>
                </div>
            )
        }

        return (
            <div>
                <Button color="danger" onClick={this.toggle}>Swap Tiles</Button>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Swap tiles?</ModalHeader>
                    <ModalBody>
                        Here are your tiles: (Remember that swapping tiles skips your turn!)
                        <Row style={{ width: '100%', height: '3em' }}>
                            <Row noGutters style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
                                {tiles.map((tile) => fillHorizontal(tile, player_obj.color, is_turn, this.select_tile))}
                            </Row>
                        </Row>
                        <Row style={{ width: '100%', margin: 'auto'}}>
                            <Button onClick={() => { swap_tile(socket, [tile_selected]) }} style={{ margin: 'auto' }} disabled={tile_selected === ''}>Swap Single Tile {tile_selected}</Button>
                            <Button onClick={() => { swap_tile(socket, tiles) }} style={{ margin: 'auto' }} >Swap All Tiles</Button>
                        </Row>
                    </ModalBody>
                </Modal>
            </div>
        )

        // return (
        //     <Row style={{ marginLeft: '10%', marginRight: '10%', width: '100%' }}>
        //         <Row noGutters style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
        //             {tiles.map((tile) => fillHorizontal(tile, player_obj.color, is_turn, enter_tile_place_mode))}
        //         </Row>
        //     </Row>
        // )
    }
}

const map_state_to_props = (state, own_props) => {
    const {
        turn,
    } = state.turn

    const {
        my_tiles_this_turn,
    } = state.board

    const {
        socket,
    } = state.connection

    const player_obj = state.players.me

    return {
        socket,
        can_swap: Object.keys(my_tiles_this_turn).length === 0,
        num_tiles: player_obj.tiles ? player_obj.tiles.length : 0,
        tiles: player_obj.tiles,
        player_obj,
        is_turn: turn === state.players.me.color,
        ...own_props,
    }
}

const map_actions_to_props = {
    swap_tile: action_swap_tile,
}

export default connect(map_state_to_props, map_actions_to_props)(SwapTileButton)
