import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Input,
} from 'reactstrap'


export function ScoreSpot(props) {
    const {
        red,
        green,
        blue,
        yellow,
        my_color,
        change_my_score,
        socket,
    } = props
    
    const ret_list = []

    if (typeof red === 'number') {
        ret_list.push(
            <Input style={{ marginLeft: '0.5em', width: '6em', border: '3px solid red' }} onChange={(e) => { change_my_score(socket, e)}} value={red} disabled={my_color !== 'red'} size="sm" type="number" />
        )
    }
    if (typeof green === 'number') {
        ret_list.push(
            <Input style={{ marginLeft: '0.5em', width: '6em', border: '3px solid green' }} onChange={(e) => { change_my_score(socket, e)}} value={green} disabled={my_color !== 'green'} size="sm" type="number" />
        )
    }
    if (typeof blue === 'number') {
        ret_list.push(
            <Input style={{ marginLeft: '0.5em', width: '6em', border: '3px solid blue' }} onChange={(e) => { change_my_score(socket, e)}} value={blue} disabled={my_color !== 'blue'} size="sm" type="number" />
        )
    }
    if (typeof yellow === 'number') {
        ret_list.push(
            <Input style={{ marginLeft: '0.5em', width: '6em', border: '3px solid yellow' }} onChange={(e) => { change_my_score(socket, e)}} value={yellow} disabled={my_color !== 'yellow'} size="sm" type="number" />
        )
    }


    return ret_list
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
        color_scores[me.color] = parseInt(me.score, 10)
    }
    if (top && top.color) {
        color_scores[top.color] = parseInt(top.score, 10)
    }
    if (left && left.color) {
        color_scores[left.color] = parseInt(left.score, 10)
    }
    if (right && right.color) {
        color_scores[right.color] = parseInt(right.score, 10)
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