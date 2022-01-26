import * as util from './src/utils.js'  // This will come in handy later
import Model from './src/Model.js'

export default class Wander3DModel extends Model {
    trees = 100

    setup() {
        // Create "trees". These might work better as just... patches, something for later implementation. As it stands these exist just to prove that I can do... things.
        this.turtles.create(this.trees, t => {
            t.setxyz(...this.world.randomPoint(), -16)
        })
    }
}
