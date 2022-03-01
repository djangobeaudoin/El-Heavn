//import * as util from './src/utils.js'
import Model3D from './src/Model3D.js'
import World from './src/World.js'

export default class CloudModel extends Model3D {
    // Set world size
    constructor(worldOptions = World.defaultOptions(64)) {
        super(worldOptions)
    }

    // Misc. Variables
    treePercentage = 0.4
    particleSpeed = 2


    setup() {
        // Setup Turtle Breeds and Types
        this.turtleBreeds('co2s h2os')
        // this.co2Type = 'co2'
        this.h2oType = 'h2o'
        this.h2os.setDefault('atEdge', 'clamp')
        // this.co2s.setDefault('atEdge', 'clamp')

        // Water will be vapor by default
        this.h2os.setDefault('liquid', true)

        // Setup Patch Breeds and Types
        this.patchBreeds('trees dirts fires')
        this.dirtType = 'dirt'
        this.fireType = 'fire'
        this.treeType = 'tree'
        this.fires.setDefault('ticks', 0)
        
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
        treeToIgnite.ticks = this.ticks
    }

    createPatches() {
        // Create Trees based on treePercentage
        this.patches.ask(p => {
            p.value = Math.random()
            if (Math.random() <= this.treePercentage) p.setBreed(this.trees)
            else p.setBreed(this.dirts)
        })

        // Set Types
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
            t.setxyz(t.x + (Math.random() -0.5)*2, t.y + (Math.random() -0.5)*2, t.z + this.particleSpeed)
        })

        // If the water is not liquid we don't care about it
        this.h2os.ask(t => {
            if (!t.liquid) t.die()
        })

        // Ignite neighboring trees
        this.fires.ask(p => {
            // p.neighbors returns an AgentArray, which can be looped through with the forLoop function. This is more efficient and easier than something like for (var i = 0; length, i++), but achieves the same thing
            p.neighbors.forLoop(agent => {
                if (agent.type == this.treeType) this.igniteTree(agent)
            })

            if (this.ticks > p.ticks + 30) {
                p.setBreed(this.dirts)
                p.type = this.dirtType
            }

            // Create H2O
            this.h2os.createOne(t => {
            t.setxyz(p.x, p.y, this.world.minZ)
            t.type = this.h2oType
        })
        })
    }
}