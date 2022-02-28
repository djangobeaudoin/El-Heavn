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
    treePercentage = 0.4
    particleSpeed = 1

    setup() {
        // Setup Turtle Breeds and Types
        this.turtleBreeds('co2s h2os')
        this.co2Type = 'co2'
        this.h2oType = 'h2o'

        // Setup Patch Breeds and Types
        this.patchBreeds('trees dirts fires')
        this.treeType = 'tree'
        this.dirtType = 'dirt'
        this.fireType = 'fire'
        
        this.createPatches()
        this.patches.ask(p => {
            // Ignite Center Tree to begin fire
            if ((p.x === 0) && (p.y === 0)) this.igniteTree(p)
        })
    }

    igniteTree(treeToIgnite) {
        // Set tree to fire breed, which does nothing right now but someday it will
        treeToIgnite.setBreed(this.fires)
        treeToIgnite.type = this.fireType

        // Create H2O
        this.h2os.createOne(t => {
            t.setxyz(treeToIgnite.x, treeToIgnite.y, this.world.minZ)
            t.type = this.h2oType
        })

        // Create CO2
        this.co2s.createOne(t => {
            t.setxyz(treeToIgnite.x, treeToIgnite.y, this.world.minZ)
            t.type = this.co2Type
        })
    }

    createPatches() {
        this.patches.ask(p => {
            p.value = Math.random()
            if (Math.random() <= this.treePercentage) p.setBreed(this.trees)
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

        // Ignite neighboring trees
        this.fires.ask(p => {
            // p.neighbors returns an AgentArray, which can be looped through with the forLoop function. This is more efficient and easier than something like for (var i = 0; length, i++), but achieves the same thing
            p.neighbors.forLoop(agent => {
                if (agent.type == this.treeType) this.igniteTree(agent)
            })
        })
    }
}