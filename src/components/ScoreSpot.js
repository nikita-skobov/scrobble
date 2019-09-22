import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Row,
    Col,
    Button,
    Input,
} from 'reactstrap'

export class ScoreSpot extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {
            red,
            green,
            blue,
            yellow,
            my_color,
            change_my_score,
            socket,
        } = this.props

        if (typeof red === 'number' && green === undefined && yellow === undefined && blue === undefined) {
            return [
                <Button disabled color="danger">
                    <Input onClick={() => {console.log('clickitity')}} onChange={(e) => {console.log('changing scoreee'); change_my_score(socket, e)}} defaultValue={red} disabled={my_color !== 'red'} size="sm" type="number" />
                </Button>,
            ]
        } else if (typeof red === 'number' && typeof green === 'number' && yellow === undefined && blue === undefined) {
            return [
                <Button disabled color="danger">
                    <Input defaultValue={red} disabled={my_color !== 'red'} size="sm" type="number" />
                </Button>,
                <Button disabled color="success">
                    <Input defaultValue={green} disabled={my_color !== 'green'} size="sm" type="number" />
                </Button>,
            ]
        } else if (typeof red === 'number' && typeof green === 'number' && typeof yellow === 'number' && blue === undefined) {
            return [
                <Button disabled color="danger">
                    <Input defaultValue={red} disabled={my_color !== 'red'} size="sm" type="number" />
                </Button>,
                <Button disabled color="success">
                    <Input defaultValue={green} disabled={my_color !== 'green'} size="sm" type="number" />
                </Button>,
                <Button disabled color="primary">
                    <Input defaultValue={blue} disabled={my_color !== 'blue'} size="sm" type="number" />
                </Button>,
            ]
        } else {
            // all 4 players are here
            return [
                <Button disabled color="danger">
                    <Input defaultValue={red} disabled={my_color !== 'red'} size="sm" type="number" />
                </Button>,
                <Button disabled color="success">
                    <Input defaultValue={green} disabled={my_color !== 'green'} size="sm" type="number" />
                </Button>,
                <Button disabled color="primary">
                    <Input defaultValue={blue} disabled={my_color !== 'blue'} size="sm" type="number" />
                </Button>,
                <Button disabled color="warning">
                    <Input defaultValue={yellow} disabled={my_color !== 'yellow'} size="sm" type="number" />
                </Button>,
            ]
        }

    }
}

const action_change_my_score = (socket, item) => {
    socket.emit('change_score', item.target.value)
    return {
        type: 'SCORE_CHANGED',
        payload: {
            score: item.target.value,
            is_mine: true,
        }
    }
}


const map_state_to_props = (state, own_props) => {
    const {
        me,
        top,
        left,
        right,
    } = state.players
    const {
        socket,
    } = state.connection

    const color_scores = {}

    let my_color = ''
    if (me && me.color) {
        my_color = me.color
        color_scores[me.color] = me.score
    }
    if (top && top.color) {
        color_scores[top.color] = top.score
    }
    if (left && left.color) {
        color_scores[left.color] = left.score
    }
    if (right && right.color) {
        color_scores[right.color] = right.score
    }


    return {
        socket,
        my_color,
        ...color_scores,
        ...own_props,
    }
}

const map_actions_to_props = {
    change_my_score: action_change_my_score,
}

export default connect(map_state_to_props, map_actions_to_props)(ScoreSpot)