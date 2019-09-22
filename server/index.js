const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const PORT = 3069


function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}


let has_host = false
let game_running = false
let current_turn = undefined
let turn_order = []
const positions = [
    'red',
    'green',
    'blue',
    'yellow',
]

const players = []

let tiles_remaining = [
'A ₁','A ₁','A ₁','A ₁','A ₁','A ₁','A ₁','A ₁','A ₁','B ₃',
'B ₃','C ₃','C ₃','D ₂','D ₂','D ₂','D ₂','E ₁','E ₁','E ₁',
'E ₁','E ₁','E ₁','E ₁','E ₁','E ₁','E ₁','E ₁','E ₁','F ₄',
'F ₄','G ₂','G ₂','G ₂','H ₄','H ₄','I ₁','I ₁','I ₁','I ₁',
'I ₁','I ₁','I ₁','I ₁','I ₁','J ₈','K ₅','L ₁','L ₁','L ₁',
'L ₁','M ₃','M ₃','N ₁','N ₁','N ₁','N ₁','N ₁','N ₁','O ₁',
'O ₁','O ₁','O ₁','O ₁','O ₁','O ₁','O ₁','P ₃','P ₃','Q ₁₀',
'R ₁','R ₁','R ₁','R ₁','R ₁','R ₁','S ₁','S ₁','S ₁','S ₁',
'T ₁','T ₁','T ₁','T ₁','T ₁','T ₁','U ₁','U ₁','U ₁','U ₁',
'V ₄','V ₄','W ₄','W ₄','X ₈','Y ₄','Y ₄','Z ₁₀','? ₀','? ₀',
]
const board = {}
const player_placed = {}

tiles_remaining = shuffle(tiles_remaining)

function draw_n_tiles(n) {
    tiles_remaining = shuffle(tiles_remaining)
    const my_tiles = []
    for (let i = 0; i < n; i += 1) {
        if (tiles_remaining.length === 0) {
            break
        }
        my_tiles.push(tiles_remaining.shift())        
    }
    return my_tiles
}

app.get('/', (req, res) => {
    console.log('got root request!')
    res.send('OK')
})

io.on('connection', (socket) => {
    console.log('someone connected')
    console.log(socket.request.connection.remoteAddress)
    console.log(socket.request.headers)

    if (!has_host) {
        // first person to connect is host.
        socket.is_host = true
        has_host = true
    }

    if (positions.length === 0 && !game_running) {
        console.log('disconnecting because no more positions')
        socket.disconnect()
        return null
    }
    if (!game_running) {
        socket.color = positions.shift()
        console.log(`assigning socket color: ${socket.color}`)
    } else {
        console.log('NOT ASSIGNING COLOR BECAUSE GAME RUNNING!')
    }
    const my_player = {
        color: socket.color,
        join_order: 3 - positions.length,
        score: 0,
    }
    if (!game_running) {
        console.log(`notifying all connected clients of: ${socket.color}`)
        players.push(my_player)
        socket.broadcast.emit('newplayer', my_player)
    }

    socket.on('whoami', () => {
        const youare = {
            is_host: socket.is_host ? true : false,
            join_order: my_player.join_order,
            color: socket.color,
            score: my_player.score,
        }
        socket.emit('youare', youare)
    })


    socket.on('whois', () => {
        const output = []
        console.log(`${socket.color} asking who  is:`)
        players.forEach((player) => {
            console.log(player)
            if (socket.color !== player.color) {
                output.push({ ...player, tiles: player.tiles ? player.tiles.map(() => ' ') : [' ']})
            }
        })
        console.log('output: ')
        console.log(output)
        socket.emit('theyare', output)
    })

    socket.on('replace_tiles', (tiles) => {
        if (!tiles.length) {
            return null
        }
        if (game_running) {
            for (let i = 0; i < players.length; i += 1) {
                if (players[i].color === socket.color && current_turn === socket.color) {
                    console.log(`player ${socket.color} wants to replace tiles: ${tiles}`)
                    if (tiles_remaining.length < tiles.length) {
                        socket.emit('tiles_replaced', players[i].tiles)
                        return null
                    }

                    let player_owns_all_tiles = true
                    tiles.forEach((tile) => {
                        if (players[i].tiles.indexOf(tile) === -1) {
                            player_owns_all_tiles = false
                        }
                    })
                    if (!player_owns_all_tiles) {
                        socket.emit('tiles_replaced', players[i].tiles)
                        return null
                    }

                    let n_tiles = draw_n_tiles(tiles.length)
                    tiles.forEach((tile) => {
                        const tile_index = players[i].tiles.indexOf(tile)
                        players[i].tiles.splice(tile_index, 1)
                        tiles_remaining.push(tile)
                    })
                    n_tiles.forEach((tile) => {
                        players[i].tiles.push(tile)
                    })
                    console.log('successfully replaced with new tiles:')
                    console.log(players[i].tiles)
                    socket.emit('tiles_replaced', players[i].tiles)

                    let turn_index = turn_order.indexOf(socket.color)
                    turn_index += 1
                    if (turn_index >= players.length) {
                        turn_index = 0
                    }

                    console.log(`broadcasting next turn: ${current_turn}`)
                    current_turn = turn_order[turn_index]
                    socket.emit('next_turn', current_turn, tiles_remaining.length)
                    socket.broadcast.emit('next_turn', current_turn, tiles_remaining.length)

                    break
                }
            }
        }
    })

    socket.on('change_score', (new_value) => {
        if (game_running) {
            for (let i = 0; i < players.length; i += 1) {
                if (players[i].color === socket.color) {
                    console.log(`player ${socket.color} changing score to: ${new_value}`)
    
                    players[i].score = new_value
                    socket.broadcast.emit('score_changed', socket.color, new_value)
                    break
                }
            }
        }
    })

    socket.on('get_tiles', () => {
        if (game_running) {
            const color = socket.color
            console.log(`${color} is asking for tiles`)
            console.log(players)
            let my_tiles = []
            for (let i = 0; i < players.length; i += 1) {
                if (players[i].color === color) {
                    let diff = 7 - players[i].tiles.length
                    let add_tiles = draw_n_tiles(diff)
                    add_tiles.forEach((tile) => {
                        players[i].tiles.push(tile)
                    })
                    my_tiles = players[i].tiles
                    break
                }
            }
    
            socket.emit('got_tiles', color, my_tiles)
            let dummy_tiles = []
            my_tiles.forEach((tile) => {
                dummy_tiles.push(' ')
            })
            socket.broadcast.emit('got_tiles', color, dummy_tiles)
        }
    })

    socket.on('place_tile', (tile, pos) => {
        if (game_running) {
            if (socket.color) {
                for (let i = 0; i < players.length; i += 1) {
                    if (players[i].color === socket.color && current_turn === socket.color) {
                        console.log(`player: ${socket.color} is placing a '${tile}' on ${pos}`)
                        const index_of_tile = players[i].tiles.indexOf(tile)
                        if (index_of_tile !== -1) {
                            if (!board[pos]) {
                                // dont allow placing tiles on an existing tile
                                players[i].tiles.splice(index_of_tile, 1)
                                board[pos] = tile
                                player_placed[pos] = socket.color
                                socket.emit('tile_placed', socket.color, tile, pos)
                                socket.broadcast.emit('tile_placed', socket.color, tile, pos)
                            }
                        }
                        break
                    }
                }
            }
        }
    })

    socket.on('end_turn', () => {
        if (game_running) {
            if (socket.color) {
                for (let i = 0; i < players.length; i += 1) {
                    if (players[i].color === socket.color && current_turn === socket.color) {
                        console.log(`${socket.color} is ending turn!`)
                        let turn_index = turn_order.indexOf(socket.color)
                        turn_index += 1
                        if (turn_index >= players.length) {
                            turn_index = 0
                        }
    
                        let diff = 7 - players[i].tiles.length
                        let add_tiles = draw_n_tiles(diff)
                        add_tiles.forEach((tile) => {
                            players[i].tiles.push(tile)
                        })
    
                        socket.emit('got_tiles', socket.color, players[i].tiles)
                        let dummy_tiles = []
                        players[i].tiles.forEach((tile) => {
                            dummy_tiles.push(' ')
                        })
                        socket.broadcast.emit('got_tiles', socket.color, dummy_tiles)
    
                        current_turn = turn_order[turn_index]
                        console.log(`next turn is: ${current_turn}`)
                        socket.emit('next_turn', current_turn, tiles_remaining.length)
                        socket.broadcast.emit('next_turn', current_turn, tiles_remaining.length)
                        break
                    }
                }
            }
        }
    })

    socket.on('take_tile', (pos) => {
        if (game_running) {
            if (socket.color) {
                for (let i = 0; i < players.length; i += 1) {
                    if (players[i].color === socket.color) {
                        if (current_turn === socket.color && board[pos]) {
                            const placed_by = player_placed[pos]
                            if (placed_by === socket.color) {
                                const tile = board[pos]
                                delete board[pos]
                                delete placed_by[pos]
                                players[i].tiles.push(tile)
                                socket.emit('tile_taken', socket.color, tile, pos)
                                socket.broadcast.emit('tile_taken', socket.color, ' ', pos)
                            }
                        }
                        break
                    }
                }
            }
        }
    })

    socket.on('start_game', () => {
        if (!game_running) {
            if (socket.is_host) {
                let temp = []
                for (let i = 0; i < players.length; i += 1) {
                    temp.push(players[i].color)
                }
                temp = shuffle(temp)
    
                for (let i = 0; i < players.length; i += 1) {
                    players[i].tiles = draw_n_tiles(7)
                }
    
                temp.forEach((col) => {
                    turn_order.push(col)
                })
    
                game_running = true
                current_turn = temp[0]
                socket.emit('game_started', temp, tiles_remaining.length)
                socket.broadcast.emit('game_started', temp, tiles_remaining.length)
                console.log('STARTING GAME WOOHOOO!')
            }
        }
    })

})

http.listen({
    port: PORT,
    host: '0.0.0.0',
}, () => {
    console.log(`listening on ${PORT}`)
})
