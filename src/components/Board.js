import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
    Row,
    Col,
    Table,
} from 'reactstrap'

const Empty = () => <th style={{ backgroundColor: '#54664f' }} />
const TripleWord = () => <th style={{ color: 'white', backgroundColor: '#590800' }}>3W</th>
const TripleLetter = () => <th style={{ color: 'white', backgroundColor: '#96e2e8'}}>3L</th>
const DoubleWord = () => <th style={{ color: 'white', backgroundColor: '#a768c1' }}>2W</th>
const DoubleLetter = () => <th style={{ color: 'white', backgroundColor: '#424242'}}>2L</th>
const Center = () => <th style={{ color: 'white', backgroundColor: '#d3a304'}}>*</th>

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
            return <TripleWord />
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
            return <DoubleWord />
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
            return <DoubleLetter />
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
            return <TripleLetter />
        }

        case 'H8': {
            return <Center />
        }



        default:
            return <Empty />
    }
}



const numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O']

export function Board(props) {
    const {
        player_obj
    } = props

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


export default connect()(Board)
