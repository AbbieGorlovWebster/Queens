//Initialise Gameboard
//Game Board With Cell Data
var gameBoard = [];

//Board Size Setting
var boardSize = 8;

//timestamp when game begins
var startTimeStamp = 0;

//Get Menu Elements
const newGameMenu = document.getElementById("NewGameMenu");
const topText = document.getElementById("TopText");
const bottomText = document.getElementById("BottomText");
const boardSizeUpButton = document.getElementById("BoardSizeInputUp");
const boardSizeDisplay = document.getElementById("BoardSizeInputDisplay");
const boardSizeDownButton = document.getElementById("BoardSizeInputDown");
const newGameButton = document.getElementById("NewGameButton");

//Initialise
boardSizeDisplay.innerHTML = "Board Size: " + boardSize;

//Add Menu Event Listeners
boardSizeUpButton.addEventListener("click", () => {
    boardSize++;
    boardSizeDisplay.innerHTML = "Board Size: " + boardSize;
})

boardSizeDownButton.addEventListener("click", () => {
    if(boardSize > 4){
        boardSize--;
    }

    boardSizeDisplay.innerHTML = "Board Size: " + boardSize;
})

newGameButton.addEventListener("click", () => {
    newGameMenu.style.display = "none";
    createBoard(boardSize);
})

function InitialiseBoard(boardWidth){
    //Clear Board Of Any Prior Data
    gameBoard = [];

    //Array Containing All Possible Coord Pairs
    let coordsArray = [];

    for(let gridColumnIndex = 0; gridColumnIndex < boardWidth; gridColumnIndex++){

        //Array Containing Column Data
        let gridColumnArray = [];
    
        for(let gridRowIndex = 0; gridRowIndex < boardWidth; gridRowIndex++){
    
            //Javascript Object With Cell Data
            let gridCell = {containsQueen: false, groupID: -1, clickState: 0};
            
            //Add to game board
            gridColumnArray.push(gridCell);

            //Add possible coord pair
            coordsArray.push([gridColumnIndex, gridRowIndex]);
        }
    
        gameBoard.push(gridColumnArray);
    }
    
    return coordsArray;
}

//Generate Coordinates For Queens
function AssignQueens(fullCoordList, queenTotal){ 
    let queenArray = [];
    let availableCoordList = Array.from(fullCoordList);

    for(let queenCount = 0; queenCount < queenTotal; queenCount++){
        //Pick random allowed coordinate for queen
        const queenCoord = availableCoordList[Math.floor(Math.random() * availableCoordList.length)];
        queenArray.push(queenCoord);

        //Remove Incompatable Coords From Array
        for(let coordIndex = availableCoordList.length - 1; coordIndex >= 0; coordIndex--){
            //Coordinate being checked
            let coord = availableCoordList[coordIndex];

            //Conditions
            //1 - Same Column, 2 - Same Row, 3 - Diagonal
            if(coord[0] == queenCoord[0] || coord[1] == queenCoord[1] || (Math.abs(coord[0] - queenCoord[0]) == 1 && Math.abs(coord[1] - queenCoord[1]) == 1)){
                availableCoordList.splice(coordIndex, 1);
            }
        }

        //Sometimes, due to corner rule, a board cannot finish generation, at which point retry
        if(queenCoord == undefined){
            console.log("retry generation");
            
            queenArray = [];
            queenCount = -1;
            availableCoordList =  Array.from(fullCoordList);
        }
    }

    return queenArray;
}

function AssignBoardAreas(allQueenCoords, areaTotal){
    //Generate the size of each area
    let areaSizes = [];
    let remainingCells = gameBoard.length * gameBoard.length;
    let areaLimit = Math.max(Math.floor(0.45 * remainingCells), 1);

    //Assign Size to each area
    for (let areaCount = 0; areaCount < areaTotal - 1; areaCount++){
        const newAreaSize = Math.floor((Math.random() * (Math.min(areaLimit, remainingCells) - 1)) + 1);

        remainingCells -= newAreaSize;
        areaSizes.push(newAreaSize);
        areaLimit = Math.max(Math.floor(0.45 * remainingCells), 1);
    }

    //Final Area Is remaining Cells
    areaSizes.push(remainingCells);

    //Set Queens And Give Each A New Area
    let currentArea = 0;

    for(queenCoord of allQueenCoords){
        let cell = gameBoard[queenCoord[0]][queenCoord[1]];

        cell.containsQueen = true;
        cell.groupID = currentArea;

        gameBoard[queenCoord[0]][queenCoord[1]] = cell;

        currentArea++;
    }

    //For each area walk the generated number of steps
    for(let areaCount = 0; areaCount < areaTotal; areaCount++){
        //Use Queen Coord as starting point
        let currentCoord = [allQueenCoords[areaCount][0], allQueenCoords[areaCount][1]];

        for(let stepsTaken = 0; stepsTaken < areaSizes[areaCount]; stepsTaken++){

            //Pick a random direction
            let direction = Math.floor(Math.random() * 4);

            let newCoord = Array.from(currentCoord);

            //Attempt to step in direction
            switch (direction){
                case 0: 
                    //Up
                    if(currentCoord[1] != gameBoard.length - 1){
                        newCoord[1] = newCoord[1] + 1;
                    } else {
                        newCoord[1] = newCoord[1];
                    }

                    break;

                case 1: 
                    //Right
                    if(newCoord[0] != gameBoard.length - 1){
                        newCoord[0] = newCoord[0] + 1;
                    } else {
                        newCoord[0] = newCoord[0];
                    }

                    break;

                case 2: 
                    //Down
                    if(newCoord[1] != 0){
                        newCoord[1] = newCoord[1] - 1;
                    } else {
                        newCoord[1] = newCoord[1];
                    }

                    break;

                case 3: 
                    //Left
                    if(newCoord[0] != 0){
                        newCoord[0] = newCoord[0] - 1;
                    } else {
                        newCoord[0] = newCoord[0];
                    }

                    break;
            }

            let cell = gameBoard[newCoord[0]][newCoord[1]];

             if(cell.groupID == -1){
                 //If cell doesn't already have a groupID assign it to current group and step from here.
                 cell.groupID = areaCount;
                 gameBoard[newCoord[0]][newCoord[1]] = cell;

                currentCoord = Array.from(newCoord);
            }
        }
    }

    do{
        //Entire Grid may not be filled in yet, iterate through to find cells without area assignment
        var unfinishedCells = [];
        for(let columnIndex = 0; columnIndex < gameBoard.length; columnIndex++){
            for(let rowIndex = 0; rowIndex < gameBoard.length; rowIndex++){
                if(gameBoard[columnIndex][rowIndex].groupID == -1){
                    unfinishedCells.push([columnIndex, rowIndex]);
                }
            }
        }

        //Check cells around ungrouped
        for(let cellIndex = unfinishedCells.length - 1; cellIndex >= 0 ; cellIndex--){
            let possibleGroups = [];
            let cellGroup = -1;

            cell = unfinishedCells[cellIndex];

            if(cell[0] != 0){
                //Can check left
                cellGroup = gameBoard[cell[0] - 1][cell[1]].groupID;

                if(cellGroup > -1){
                    possibleGroups.push(cellGroup);
                }
            }

            if(cell[0] != gameBoard.length - 1){
                //Can check right
                cellGroup = (gameBoard[cell[0] + 1][cell[1]]).groupID;

                if(cellGroup > -1){
                    possibleGroups.push(cellGroup);
                }
            }

            if(cell[1] != 0){
                //Can check up
                cellGroup = gameBoard[cell[0]][cell[1] - 1].groupID;

                if(cellGroup > -1){
                    possibleGroups.push(cellGroup);
                }
            }

            if(cell[1] != gameBoard.length - 1){
                //Can check down
                cellGroup = gameBoard[cell[0]][cell[1] + 1].groupID;

                if(cellGroup > -1){
                    possibleGroups.push(cellGroup);
                }
            }

            if(possibleGroups.length > 0){
                let cellData = gameBoard[cell[0]][cell[1]];
                cellData.groupID = possibleGroups[Math.floor(Math.random() * possibleGroups.length)];

                gameBoard[cell[0]][cell[1]] = cellData;

                unfinishedCells.splice(cellIndex, 1);
            }
        }
    } while (unfinishedCells.length > 0);
}

function DrawBoard(){
    //generate colors
    const colourDict = colorGenerator(gameBoard.length);

    const boardElement = document.createElement("div");
    boardElement.id = "Board";

    boardElement.style.gridTemplateRows = "repeat(" + gameBoard.length + ", calc(100%/" + gameBoard.length + ")";
    boardElement.style.gridTemplateColumns = "repeat(" + gameBoard.length + ", calc(100%/" + gameBoard.length + ")";
    boardElement.style

    for(let cellRowIndex = 0; cellRowIndex < gameBoard.length; cellRowIndex++){
        for(let cellColumnIndex = 0; cellColumnIndex < gameBoard.length; cellColumnIndex++){
            
            const cellElement = document.createElement("div");
            cellElement.id = cellRowIndex + ", " + cellColumnIndex;
            cellElement.classList.add("cell");
            boardElement.appendChild(cellElement);

            let cellData = gameBoard[cellColumnIndex][cellRowIndex];
            if(cellData.groupID >= 0){
                cellElement.style.backgroundColor = "rgb(" + colourDict[cellData.groupID][0] + ", " + colourDict[cellData.groupID][1] + ", " + colourDict[cellData.groupID][2] + ")";
            }

            cellElement.addEventListener("click", cellCallback);
        }
    }

    document.body.appendChild(boardElement);
}

function cellCallback(event) {
    let cellCoords = event.target.id.split(", ");

    gameBoard[cellCoords[1]][cellCoords[0]].clickState = (gameBoard[cellCoords[1]][cellCoords[0]].clickState + 1) % 3;
    event.target.setAttribute("data-clickState", (gameBoard[cellCoords[1]][cellCoords[0]].clickState) % 3);

    checkWin(gameBoard);
}

function colorGenerator(number){
    let colorArray = {};

    for(let pointCounter = 0; pointCounter < number; pointCounter++){

        let R = (Math.random()*255);
        let G = (Math.random()*255);
        let B = (Math.random()*255);

        colorArray[pointCounter] = [R, G, B];
    }

    return colorArray;
}

function createBoard(boardWidth){
    let coordsArray = InitialiseBoard(boardWidth);

    let queensCoords = AssignQueens(coordsArray, boardWidth);

    AssignBoardAreas(queensCoords, boardWidth);

    DrawBoard();
    
    startTimeStamp = Date.now();
}

function checkWin(){
    //Check Each Cell For Fail Condition
    for(let rowIndex = 0; rowIndex < gameBoard.length; rowIndex++){
        for(let columnIndex = 0; columnIndex < gameBoard.length; columnIndex++){
            let cellData = gameBoard[rowIndex][columnIndex];

            //Should have queen but doesn't
            if(cellData.containsQueen && cellData.clickState != 2){
                console.log("Missing Queen at " + rowIndex + ", " + columnIndex);
                return false;
            }

            //Shouldn't have Queen, but does
            if(!cellData.containsQueen && cellData.clickState == 2){
                console.log("Wrong Queen at " + rowIndex + ", " + columnIndex);
                return false;
            }
        }    
    }

    //Remove All Cell Event Listeners To Stop Board Being Changed Further
    const cellElements = document.querySelectorAll(".cell");
    
    for(let cellIndex = 0; cellIndex < cellElements.length; cellIndex++){
        let cell = cellElements[cellIndex];

        cell.removeEventListener('click', cellCallback, false);

        if(cell.getAttribute("data-clickstate") == "2"){
            cell.style.animationDelay = (Math.floor(cellIndex/gameBoard.length) * 100) + "ms";
            cell.style.animationName = "QueenBounce";
        }
    }

    topText.innerHTML = "Congratulations";

    bottomText.innerHTML = "Completed in " + gameDuration() +"<br>Want to play again?";
    
    setTimeout(() => {
        deleteBoard();
        newGameMenu.style.removeProperty("display");
    }, 100 * boardSize * 3);

    //No fail conditions met, must be solved
    return true;
}

//Delete the existing game board
function deleteBoard(){
    const boardElement = document.getElementById("Board");
    boardElement.remove();
}

//Calculate duration of game
function gameDuration(){
    const endTimeStamp = Date.now();
    
    //Get Seconds Between
    const secondsBetween = Math.floor((endTimeStamp - startTimeStamp)/1000);

    //Get Minutes Between
    const minutesBetween = Math.floor(secondsBetween/60);

    //Get Hours Between
    const hoursBetween = Math.floor(minutesBetween/ 60);

    //Build Readable Output
    let output = "";

    if(hoursBetween > 0){
        output = hoursBetween + " : " + (minutesBetween % 60) + " : " + (secondsBetween % 60);
    } else if(minutesBetween > 0){
        output = minutesBetween + " : " + (secondsBetween % 60);
    } else{
        output = secondsBetween + " seconds";
    }    

    return output;
}