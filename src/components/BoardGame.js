import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Row,
    Col,
} from 'reactstrap'

import PlayerSpot from './PlayerSpot'
import Board from './Board'
import ButtonSpot from './ButtonSpot'

export class BoardGame extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {
            me,
            left,
            top,
            right
        } = this.props

        return [
            <Row noGutters style={{ height: '6%' }}><ButtonSpot /></Row>,
            <Row noGutters style={{ height: '10%', backgroundColor: 'black'}}><PlayerSpot player_pos="top" /></Row>,
            <Row noGutters style={{ height: '74%' }}>
                <div style={{ width: '10%', backgroundColor: 'black'}}><PlayerSpot player_pos="left" vertical /></div>
                <div style={{ width: '80%', height: '100%', backgroundColor: 'white'}}><Board /></div>
                <div style={{ width: '10%', backgroundColor: 'black'}}><PlayerSpot player_pos="right" vertical /></div>
            </Row>,
            <Row noGutters style={{ height: '10%', backgroundColor: 'black'}}><PlayerSpot player_pos="me" /></Row>
        ]
    }
}


const map_state_to_props = (state, own_props) => {
    const {
        me,
        left,
        top,
        right
    } = state.players

    return {
        me,
        left,
        top,
        right,
    }
}


export default connect(map_state_to_props)(BoardGame)