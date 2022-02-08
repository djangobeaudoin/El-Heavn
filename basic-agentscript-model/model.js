//import * as util from './src/utils.js'
import Model3D from './src/Model3D.js'
import World from './src/World.js'

export default class CloudModel extends Model3D {
    // Set world size
    constructor(worldDptions = World.defaultOptions(100)) {
        super(worldDptions)
    }

    // Misc. Variables
    co2Count = 100
    h2oCount = 100
    treePercentage = 0.5
    particleSpeed = 1

    setup() {
        // Setup Turtle Breeds and Types
        this.turtleBreeds('co2s h2os')
        this.co2Type = 'co2'
        this.h2oType = 'h2o'

        // Setup Patch Breeds and Types
        this.patchBreeds('trees dirts')
        this.treeType = 'tree'
        this.dirtType = 'dirt'
        
        this.createTurtles()
        this.createPatches()
    }

    createTurtles() {
        // co2
        this.co2s.create(this.co2Count, t => {
            t.setxyz(...this.world.randomPoint(), -100)
            t.type = this.co2Type
        })
        // h2o
        this.h2os.create(this.h2oCount, t => {
            t.setxyz(...this.world.randomPoint(), -100)
            t.type = this.h2oType
        })
    }

    createPatches() {
        this.patches.ask(p => {
            p.value = Math.random()
            if (Math.random() >= this.treePercentage) p.setBreed(this.trees)
            else p.setBreed(this.dirts)
        })

        this.trees.ask(p => {
            p.type = this.treeType
        })

        this.dirts.ask(p => {
            p.type = this.dirtType
        })
    }

    step() {
        // Currently moving all turtles up at an arbitrary rate.
        this.turtles.ask(t => {
            t.setxyz(t.x, t.y, t.z + this.particleSpeed)
        })
    }
}