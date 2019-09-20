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
const positions = [
    'red',
    'green',
    'blue',
    'yellow',
]

const players = []

let tiles_remaining = [
'A','A','A','A','A','A','A','A','A','B',
'B','C','C','D','D','D','D','E','E','E',
'E','E','E','E','E','E','E','E','E','F',
'F','G','G','G','H','H','I','I','I','I',
'I','I','I','I','I','J','K','L','L','L',
'L','M','M','N','N','N','N','N','N','O',
'O','O','O','O','O','O','O','P','P','Q',
'R','R','R','R','R','R','S','S','S','S',
'T','T','T','T','T','T','U','U','U','U',
'V','V','W','W','X','Y','Y','Z','?','?',
]

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

io.on('connection', (socket) => {
    console.log('someone connected')

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
    }
    players.push(my_player)
    socket.broadcast.emit('newplayer', my_player)

    socket.on('whoami', () => {
        const youare = {
            is_host: socket.is_host ? true : false,
            join_order: my_player.join_order,
            color: socket.color,
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

            current_turn = temp[0]
            socket.emit('game_started', temp)
            socket.broadcast.emit('game_started', temp)
            console.log('STARTING GAME WOOHOOO!')
        }
    })
})

http.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
})
