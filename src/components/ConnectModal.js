import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Modal,
    ModalBody,
    ModalHeader,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Spinner,
} from 'reactstrap'

import sio from 'socket.io-client'


import {
    action_game_has_order,
    action_got_tiles,
} from './ButtonSpot'

export class ConnectModal extends Component {
    constructor(props) {
        super(props)

        const {
            connection_port,
            connection_url,
        } = props

        this.state = {
            connection_port,
            connection_url,
            connecting: false,
            connecting_failed: false,
        }

        this.connection_port = connection_port
        this.connection_url = connection_url

        this.on_form = this.on_form.bind(this)
        this.change = this.change.bind(this)
    }

    change(e1, e2) {
        const {
            id,
            value,
        } = e1.target

        if (id === 'l1') {
            this.connection_url = value
        } else {
            this.connection_port = value
        }
    }

    on_form(e) {
        e.preventDefault()
        const {
            connection_url,
            connection_port
        } = this

        this.setState((state) => {
            const tempState = { ...state }
            tempState.connecting = true
            return tempState
        }, () => {
            this.props.connect_to_game(connection_url, connection_port, (did_connect) => {
                if (!did_connect) {
                    this.setState({ connecting: false, connecting_failed: true })
                }
            })
        })
    }

    render() {
        const {
            connection_port,
            connection_url,
        } = this.props
        const { connecting, connecting_failed } = this.state
        
        const MyForm = () => (
            <Form onSubmit={this.on_form}>
                <FormGroup>
                    <Label for="l1">URL</Label>
                    <Input onChange={this.change} type="text" id="l1" defaultValue={connection_url} />
                    <Label for="l2">Port</Label>
                    <Input onChange={this.change} type="text" id="l2" defaultValue={connection_port} />
                </FormGroup>
                <Button>Submit</Button>
            </Form>
        )

        return (
            <Modal isOpen={true}>
                <ModalHeader>Connect to game:</ModalHeader>
                <ModalBody>
                    {connecting_failed && <h3>Failed to connect!</h3>}
                    {connecting ? <Spinner type="grow" /> : <MyForm />}
                </ModalBody>
            </Modal>
        )
    }
}

const action_successfully_connected = (socket, url, port) => {
    return {
        type: 'CONNECT_SUCC',
        payload: {
            socket,
            url,
            port,
        }
    }
}

const action_player_joined = (is_me, player_obj) => {
    return {
        type: 'PLAYER_JOIN',
        payload: {
            is_me,
            player_obj,
        }
    }
}

const action_connect_to_game = (url, port, cb) => {
    return (dispatch) => {
        const socket = sio(`${url}:${port}`)
        socket.once('connect', () => {
            console.log('woohoo connected!!')
            socket.emit('whoami')
            socket.emit('whois')
            socket.once('game_started', (order) => {
                console.log('order is: ')
                console.log(order)
                dispatch(action_game_has_order(order))
                socket.emit('get_tiles')
            })

            socket.on('got_tiles', (color, tiles) => {
                console.log(`color: ${color} got tiles`)
                console.log(tiles)
                dispatch(action_got_tiles(color, tiles))
            })
            socket.on('newplayer', (newplayer) => {
                console.log('SOMEBODYT ELSE JOINE!!!')
                dispatch(action_player_joined(false, newplayer))
            })
            socket.once('theyare', (other_players) => {
                console.log('the other players:')
                other_players.forEach((player) => {
                    console.log(player)
                    dispatch(action_player_joined(false, player))
                })
            })
            socket.once('youare', (my_obj) => {
                console.log('i am:')
                console.log(my_obj)
                cb(true)
                dispatch(action_player_joined(true, my_obj))
                dispatch(action_successfully_connected(socket, url, port))
            })
        })

        socket.once('error', () => {
            cb(false)
            console.log('SOME ERROR WOAH!')
        })

        socket.once('disconnect', () => {
            cb(false)
            console.log('I GOT DISCONNECTED WOAH!')
        })
    }
}

const map_state_to_props = (state, own_props) => {
    const {
        connection_url,
        connection_port,
    } = state.connection

    return {
        connection_url,
        connection_port,
        ...own_props
    }
}

const map_actions_to_props = {
    connect_to_game: action_connect_to_game,
}

export default connect(map_state_to_props, map_actions_to_props)(ConnectModal)