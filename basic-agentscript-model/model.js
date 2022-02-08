import * as util from './src/utils.js'  // This will come in handy later
import Model3D from './src/Model3D.js'

export default class CloudModel extends Model3D {
    trees = 100

    setup() {
        // Create "trees". These might work better as just... patches, something for later implementation. As it stands these exist just to prove that I can do... things.
        this.turtles.create(this.trees, t => {
            t.setxyz(...this.world.randomPoint(), -16)
        })
        // this.patches.setDefault('value', 0)
        this.patches.ask(p => {
            p.value = Math.random()
        })
    }
    step() {
        this.turtles.ask(t => {
            t.setxyz(t.x, t.y, t.z + .05)
        })
    }
}