class Block {
    constructor(x, y, w, h, mainBlock) {
        this.LEFT = 0
        this.RIGHT = 1
        this.UP = 2
        this.DOWN = 3
        this.HORIZONTAL = true
        this.VERTICAL = false
        this.COLOR_MAIN = color(252, 97, 112)
        this.COLOR_NORMAL = color(255, 215, 71)

        this.pos = createVector(x, y)
        this.size = createVector(w, h)
        this.color = mainBlock ? this.COLOR_MAIN : this.COLOR_NORMAL
        this.mouseOffset = null
        this.moveLimits = null
        this.detectionFlag = null

        this.setGrid(true)
    }

    contains(x, y) {
        return x >= this.pos.x * game.SCALE
            && x < (this.pos.x + this.size.x) * game.SCALE
            && y >= this.pos.y * game.SCALE
            && y < (this.pos.y + this.size.y) * game.SCALE
    }

    show() {
        stroke(0)
        strokeWeight(3)
        fill(this.color)
        rect(this.pos.x * game.SCALE,
            this.pos.y * game.SCALE,
            this.size.x * game.SCALE,
            this.size.y * game.SCALE)
    }

    setGrid(state) {
        for (let i = 0; i < this.size.x; i++) {
            for (let j = 0; j < this.size.y; j++) {
                game.grid[this.pos.x + i][this.pos.y + j] = state
            }
        }
    }

    getMoveLimit(start, size, loopDir, orientation, index, dir, offset) {
        for (let i = start; i >= -1 && i <= size; i += loopDir) {
            if (i < 0 || i >= size || (orientation ? game.grid[i][index] : game.grid[index][i])) {
                const move = i + offset - loopDir
                if (loopDir > 0 === move < this.moveLimits[dir]) {
                    this.moveLimits[dir] = move
                }
                return
            }
        }
    }

    getMoveLimits() {
        this.moveLimits = [0, Infinity, 0, Infinity]
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                const xCeil = ceil(this.pos.x + x)
                const xFloor = floor(this.pos.x + x)
                const xRound = round(this.pos.x + x)
                const yCeil = ceil(this.pos.y + y)
                const yFloor = floor(this.pos.y + y)
                const yRound = round(this.pos.y + y)
                this.getMoveLimit(xRound, game.GAME_W, -1, this.HORIZONTAL, yCeil, this.LEFT, 0)
                this.getMoveLimit(xRound, game.GAME_W, -1, this.HORIZONTAL, yFloor, this.LEFT, 0)
                this.getMoveLimit(xRound, game.GAME_W, 1, this.HORIZONTAL, yCeil, this.RIGHT, 1 - this.size.x)
                this.getMoveLimit(xRound, game.GAME_W, 1, this.HORIZONTAL, yFloor, this.RIGHT, 1 - this.size.x)
                this.getMoveLimit(yRound, game.GAME_H, -1, this.VERTICAL, xCeil, this.UP, 0)
                this.getMoveLimit(yRound, game.GAME_H, -1, this.VERTICAL, xFloor, this.UP, 0)
                this.getMoveLimit(yRound, game.GAME_H, 1, this.VERTICAL, xCeil, this.DOWN, 1 - this.size.y)
                this.getMoveLimit(yRound, game.GAME_H, 1, this.VERTICAL, xFloor, this.DOWN, 1 - this.size.y)
            }
        }
    }

    update() {
        if (this.size.x === 1 && this.size.y === 1) {
            if (this.detectionFlag) {
                this.getMoveLimits()
            }
            this.detectionFlag = abs(this.pos.x - round(this.pos.x)) + abs(this.pos.y - round(this.pos.y)) === 0
        } else {
            if (this.detectionFlag) {
                this.getMoveLimits()
                this.detectionFlag = false
            }
        }
    }

    mousePressed() {
        this.detectionFlag = true
        this.mouseOffset = p5.Vector.sub(createVector(mouseX / game.SCALE, mouseY / game.SCALE), this.pos)
        this.setGrid(false)
    }

    mouseDragged() {
        this.update()
        this.pos.x = constrain(mouseX / game.SCALE - this.mouseOffset.x,
            this.moveLimits[this.LEFT],
            this.moveLimits[this.RIGHT])
        this.update()
        this.pos.y = constrain(mouseY / game.SCALE - this.mouseOffset.y,
            this.moveLimits[this.UP],
            this.moveLimits[this.DOWN])
    }

    mouseReleased() {
        this.pos.x = round(this.pos.x)
        this.pos.y = round(this.pos.y)
        this.setGrid(true)
    }
}
