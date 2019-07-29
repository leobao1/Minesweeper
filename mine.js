let _game = {
    board: null,
    play: null,
    safe_tiles: null,
    total_mines: null,
};

let tile = {
    type: null,
    flagged: false,
    revealed: false
};

const colour = {
    0: 'white',
    1: 'blue',
    2: 'green',
    3: 'red',
    4: 'darkblue',
    5: 'maroon',
    6: 'pink',
    7: 'black',
    8: 'grey'
};

function getGame(){
    return _game;
}

function setGame(newGame){
    _game = newGame;
    return _game;
}

function createBoard(h, w){
    game = getGame();
    init_w = w;
    let newBoard = [];
    while (h--){
        let row = [];
        while (w--){
            row.push(Object.assign({}, tile));
        }
        newBoard.push(row);
        w=init_w;
    }
    game.board = newBoard;
    setGame(game);
}

function getSurround(h, w){
    let board = getGame().board;
    let board_h = board.length;
    let board_w = board[0].length;
    let bombCounter = 0;
    for (let shift_h = -1; shift_h <= 1; shift_h++){
        for (let shift_w = -1; shift_w <= 1; shift_w++){
            if(h+shift_h < 0 || h+shift_h >= board_h || w+shift_w < 0 || w+shift_w >= board_w ){
                continue;
            }
            if(board[h+shift_h][w+shift_w].type == 'x'){
                bombCounter++;
            }
        }
    }
    return bombCounter;
}

function setIndicators(){
    let game = getGame()
    let board = game.board;
    let board_h = board.length;
    let board_w = board[0].length;
    for (let h=0; h<board_h; h++){
        for (let w=0; w<board_w; w++){
            if(board[h][w].type != 'x'){
                board[h][w].type = getSurround(h, w, board)
            }
        }
    }
    game.board = board;
    setGame(game);
}

function spawnMines(amt){
    let game = getGame()
    let board = game.board;
    let mines = [];
    let h = board.length;
    let w = board[0].length;
    while(mines.length < amt){
        let pos = Math.floor(Math.random() * (h*w));
        if (mines.indexOf(pos) == -1 && board[parseInt(pos/w)][pos%w].type == null){
            board[parseInt(pos/w)][pos%w].type = 'x';
            mines.push(pos);
        }
    }
    game.board = board;
    game.safe_tiles -= amt;
    setGame(game);
}

function searchSurround(h, w){
    let board = getGame().board;
    let count = 0;
    let board_h = board.length;
    let board_w = board[0].length;
    for (let shift_h = -1; shift_h <= 1; shift_h++){
        for (let shift_w = -1; shift_w <= 1; shift_w++){
            if(h+shift_h < 0 || h+shift_h >= board_h || w+shift_w < 0 || w+shift_w >= board_w ){
                continue;
            }
            if(board[h+shift_h][w+shift_w].flagged){
                count++;
            }
        }
    }
    return count;
}

function clickSurround(h, w){
    let board = getGame().board;
    let board_h = board.length;
    let board_w = board[0].length;
    for (let shift_h = -1; shift_h <= 1; shift_h++){
        for (let shift_w = -1; shift_w <= 1; shift_w++){
            if(h+shift_h < 0 || h+shift_h >= board_h || w+shift_w < 0 || w+shift_w >= board_w ){
                continue;
            }
            if(!board[h+shift_h][w+shift_w].flagged){
                tileClick((h+shift_h)*board_w + (w+shift_w));
            }
        }
    }
}

function clearSurround(h, w, count){
    let game = getGame()
    let board = game.board;
    let board_h = board.length;
    let board_w = board[0].length;
    for (let shift_h = -1; shift_h <= 1; shift_h++){
        for (let shift_w = -1; shift_w <= 1; shift_w++){
            if(h+shift_h < 0 || h+shift_h >= board_h || w+shift_w < 0 || w+shift_w >= board_w ){
                continue;
            }
            if (board[h+shift_h][w+shift_w].type != 0 && count > 0){
                board[h+shift_h][w+shift_w].type = 0;
                count--;
            }
        }
    }
    game.board = board;
    setGame(game);
}

function revealTiles(win){
    let game = getGame()
    let board = game.board;
    let board_h = board.length;
    let board_w = board[0].length;
    for (let h=0; h<board_h; h++){
        for (let w=0; w<board_w; w++){
            if(board[h][w].type != 'x' && board[h][w].flagged){
                let tile = document.getElementById(h*board_w + w);
                tile.removeChild(tile.firstChild);
                let img = document.createElement('img');
                img.src = 'sprites/bomb_cross.png';
                img.className = 'img';
                tile.appendChild(img);
            }else if(board[h][w].type == 'x' && !board[h][w].flagged){
                let tile = document.getElementById(h*board_w + w);
                while(tile.firstChild){
                    tile.removeChild(tile.firstChild);
                }
                let img = document.createElement('img');
                if(win){
                    img.src = 'sprites/flag.png';
                } else {
                    img.src = 'sprites/bomb.png';
                }
                img.className = 'img';
                tile.appendChild(img);
            }
        }
    }
    game.play = false;
    setGame(game);
}

function checkWin(){
    let game = getGame()
    game.safe_tiles -= 1;
    if(game.safe_tiles <= 0){
        revealTiles(true);
        let img = document.getElementById('reset_img');
        img.src = 'sprites/win.png';
    }
    setGame(game);
}

function tileClick(id){
    let game = getGame()
    let board = game.board;
    let board_w = board[0].length;
    let h = parseInt(id/board_w);
    let w = id%board_w;
    let selected_tile = board[h][w];


    if(board[h][w].type == null){
        board[h][w].type = 0;
        // at this point, safe_tiles is still just total tiles, not total safe tiles
        clearSurround(h, w, game.safe_tiles - game.total_mines - 1);
        spawnMines(getGame().total_mines);
        setIndicators();
    }

    if(selected_tile.type != 'x' && !selected_tile.flagged && !selected_tile.revealed){
        let display_tile = document.getElementById(id);
        let num = selected_tile.type;
        if(num){
            display_tile.innerText = num;
        }
        display_tile.style.color = colour[num];
        display_tile.className = 'clicked';
        selected_tile.revealed = true;
        if(selected_tile.type == 0){
            clickSurround(h, w)
        }
        checkWin();
    } else if(selected_tile.type == 'x'){
        let display_tile = document.getElementById(id);
        let img = document.getElementById('reset_img');
        display_tile.style.backgroundColor = 'red';
        display_tile.style.borderColor = 'red';
        img.src = 'sprites/die.png';
        revealTiles(false);
    }
}

function surroundTile(id){
    let board = getGame().board;
    let board_w = board[0].length;
    let h = parseInt(id/board_w);
    let w = id%board_w;
    let selected_tile = board[h][w];
    if(searchSurround(h, w) == selected_tile.type && !selected_tile.flagged && selected_tile.revealed){
        clickSurround(h, w);
    }
}

function flagTile(id){
    let board = getGame().board;
    let w = board[0].length;
    let selected_tile = board[parseInt(id/w)][id%w];
    if(selected_tile.revealed){return;}
    selected_tile.flagged = !selected_tile.flagged;
    
    let tile = document.getElementById(id);
    if (board[parseInt(id/w)][id%w].flagged){
        let img = document.createElement('img');
        img.src = 'sprites/flag.png';
        img.className = 'img';
        tile.appendChild(img);
    } else {
        while(tile.firstChild){
            tile.removeChild(tile.firstChild);
        }
    }
}

function getMouse(e){
    if (typeof e === 'object' && getGame().play){
        switch(e.button){
            case 0:
                tileClick(this.id);
                break;
            case 1:
                surroundTile(this.id);
                break;
            case 2:
                flagTile(this.id);
                break;
            default:
                console.log('undefined behaviour');
                break;

        }
    }
}

function buildDisplay(display){
    let board = getGame().board;
    let board_h = board.length;
    let board_w = board[0].length;
    let counter = 0;
    for(let h=0; h<board_h; h++){
        var row_div = document.createElement('div');
        row_div.className = 'row';
        display.appendChild(row_div);
        for(let w=0; w<board_w; w++){
            var col_div = document.createElement('div');
            col_div.className = 'column';
            col_div.id = counter;
            // col_div.onclick = function(){tileClick(this.id);};
            // col_div.oncontextmenu = function(){flagTile(this.id, event);};
            col_div.addEventListener('mouseup', getMouse, false);
            col_div.addEventListener('contextmenu',function(e){
                e.preventDefault();
                e.stopPropagation();
             }, false);
            row_div.appendChild(col_div);
            counter++;
        }
        display.appendChild(row_div);
    }
}

function setBar(w){
    let bar = document.getElementById('bar');
    // 18 is the width of a block, 6 is to offset the border width and the other 6 is to offset padding
    let bar_width = (18 * w) - 6 - 6;
    let width_str = bar_width + 'px';
    bar.style.width = width_str;
}

function getInput(){
    w = document.getElementById('w').value;
    h = document.getElementById('h').value;
    b = document.getElementById('b').value;
    if(w && h && b){
        let total_tile = w*h;
        if (b < total_tile){
            return true;
        }
    }
    return false;
}

function reset(){
    let display = document.getElementById('mine');
    while(display.firstChild){
        display.removeChild(display.firstChild);
    }
    main();
}

function main(){
    let img = document.getElementById('reset_img');
    let game = getGame();
    img.src = 'sprites/face.png'
    if (getInput()){
        let w = document.getElementById('w').value;
        let h = document.getElementById('h').value;
        game.total_mines = document.getElementById('b').value;
    } else {
        game.total_mines = 50;
        let w = 20;
        let h = 15;
    }
    setBar(w);
    const display = document.getElementById('mine');
    createBoard(h, w);
    buildDisplay(display);
    game.play = true;
    game.safe_tiles = (h*w);
    setGame(game);
}

main();