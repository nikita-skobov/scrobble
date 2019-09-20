import { combineReducers } from "redux";

const connection_initial_state = {
    is_connected: false,
    connection_url: 'http://localhost',
    connection_port: 3069,
    socket: undefined,
}

const board_initial_state = {

}

const turn_initial_state = {
    order: undefined,
    turn: undefined,
}

const players_initial_state = {
    me: false,
    left: false,
    top: false,
    right: false,
}

export function connection_reducer(state = connection_initial_state, action) {
    switch (action.type) {
        case 'CONNECT_SUCC': {
            const {
                url,
                port,
                socket,
            } = action.payload

            const ret_obj = { ...state }

            ret_obj.connection_url = url
            ret_obj.connection_port = port
            ret_obj.is_connected = true
            ret_obj.socket = socket
            return ret_obj
        }

        case 'GAME_ORDER': {
            const ret_obj = { ...state }
            ret_obj.game_running = true
            return ret_obj
        }
        default:
            return state
    }
}

export function players_reducer(state = players_initial_state, action) {
    switch (action.type) {
        case 'PLAYER_JOIN': {
            const {
                is_me,
                player_obj,
            } = action.payload

            const ret_obj = { ...state }

            if (is_me) {
                ret_obj.me = player_obj
                ret_obj.me.tiles = []
            } else if (!ret_obj.left) {
                // no person on the left? fill them in!
                ret_obj.left = player_obj
                ret_obj.left.tiles = []
            } else if (!ret_obj.top) {
                ret_obj.top = player_obj
                ret_obj.top.tiles = []
            } else if (!ret_obj.right) {
                ret_obj.right = player_obj
                ret_obj.right.tiles = []
            }
            

            return ret_obj
        }
        case 'GOT_TILES': {
            const {
                color,
                tiles,
            } = action.payload
            
            const ret_obj = { ...state }
            if (color === ret_obj.me.color) {
                ret_obj.me.tiles = tiles
            } else if (color === ret_obj.left.color) {
                ret_obj.left.tiles = tiles
            } else if (color === ret_obj.top.color) {
                ret_obj.top.tiles = tiles
            } else if (color === ret_obj.right.color) {
                ret_obj.right.tiles = tiles
            }
            // console.log('got tiles reducer:')
            // console.log(ret_obj)

            return ret_obj
        }
        default:
            return state
    }
}

export function board_reducer(state = board_initial_state, action) {
    switch (action.type) {
        default:
            return state
    }
}

export function turn_reducer(state = turn_initial_state, action) {
    switch (action.type) {
        case 'GAME_ORDER': {
            const ret_obj = { ...state }
            ret_obj.order = action.payload.order
            ret_obj.turn = ret_obj.order[0]
            return ret_obj
        }
        case 'NEXT_TURN': {

        }
        default:
            return state
    }
}

export default combineReducers({
    connection: connection_reducer,
    players: players_reducer,
    turn: turn_reducer,
})
