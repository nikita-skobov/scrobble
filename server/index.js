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
'A_1','A_1','A_1','A_1','A_1','A_1','A_1','A_1','A_1','B_3',
'B_3','C_3','C_3','D_2','D_2','D_2','D_2','E_1','E_1','E_1',
'E_1','E_1','E_1','E_1','E_1','E_1','E_1','E_1','E_1','F_4',
'F_4','G_2','G_2','G_2','H_4','H_4','I_1','I_1','I_1','I_1',
'I_1','I_1','I_1','I_1','I_1','J_8','K_5','L_1','L_1','L_1',
'L_1','M_3','M_3','N_1','N_1','N_1','N_1','N_1','N_1','O_1',
'O_1','O_1','O_1','O_1','O_1','O_1','O_1','P_3','P_3','Q_10',
'R_1','R_1','R_1','R_1','R_1','R_1','S_1','S_1','S_1','S_1',
'T_1','T_1','T_1','T_1','T_1','T_1','U_1','U_1','U_1','U_1',
'V_4','V_4','W_4','W_4','X_8','Y_4','Y_4','Z_10','?_0','?_0',
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

    if (positions.length === 0) {
        socket.disconnect()
        return null
    }
    socket.color = positions.shift()
    const my_player = {
        color: socket.color,
        join_order: 3 - positions.length,
        score: 0,
    }
    players.push(my_player)
    socket.broadcast.emit('newplayer', my_player)

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
        if (socket.color) {
            const output = []
            players.forEach((player) => {
                if (socket.color !== player.color) {
                    output.push(player)
                }
            })
            socket.emit('theyare', output)
        }
    })

    socket.on('change_score', (new_value) => {
        for (let i = 0; i < players.length; i += 1) {
            if (players[i].color === socket.color) {
                console.log(`player ${socket.color} changing score to: ${new_value}`)

                players[i].score = new_value
                socket.broadcast.emit('score_changed', socket.color, new_value)
                break
            }
        }
    })

    socket.on('get_tiles', () => {
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
    })

    socket.on('place_tile', (tile, pos) => {
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
    })

    socket.on('end_turn', () => {
        if (socket.color) {
            for (let i = 0; i < players.length; i += 1) {
                if (players[i].color === socket.color && current_turn === socket.color) {
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
                    socket.emit('next_turn', current_turn, tiles_remaining.length)
                    socket.broadcast.emit('next_turn', current_turn, tiles_remaining.length)
                    break
                }
            }
        }
    })

    socket.on('take_tile', (pos) => {
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
    })

    socket.on('start_game', () => {
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

            current_turn = temp[0]
            socket.emit('game_started', temp, tiles_remaining.length)
            socket.broadcast.emit('game_started', temp, tiles_remaining.length)
            console.log('STARTING GAME WOOHOOO!')
        }
    })
})

http.listen({
    port: PORT,
    host: '0.0.0.0',
}, () => {
    console.log(`listening on ${PORT}`)
})
