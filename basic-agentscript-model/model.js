//import * as util from './src/utils.js'
import Model3D from './src/Model3D.js'
import World from './src/World.js'

export default class CloudModel extends Model3D {
    // Set world size
    constructor(worldOptions = World.defaultOptions(100)) {
        super(worldOptions)
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
        
        this.createPatches()
        this.createTurtles()
    }

    createTurtles() {
        // Only create turtles on patches with trees. Currently to avoid absolutely frying the GPU these are only created 10% of the time.
        // TODO: make this code more readable with variables.
        for (var i = 0; i < this.trees.length; i++) {
            if (Math.random() > .9){
                // Create H2O
                this.h2os.createOne(t => {
                    t.setxyz(this.trees[i].x, this.trees[i].y, -100)
                    t.type = this.h2oType
                })
                
                // Create CO2
                this.co2s.createOne(t => {
                    t.setxyz(this.trees[i].x, this.trees[i].y, -100)
                    t.type = this.co2Type
                })
            }
        }
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