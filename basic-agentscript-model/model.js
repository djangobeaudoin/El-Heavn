import Model3D from './src/Model3D.js'
import World from './src/World.js'

/**
 * This model runs in a web server, which must host the parent directory as well as dependency files.
 * This file uses AgentScript, which requires several dependency files. These files are available at https://github.com/backspaces/agentscript
 */

/**
 * Scale of model:
 * each patch = 100m^2
 * each tick = 1000s
 * each CCN sphere = 2430000000000CCN
 * each H2O sphere = 0.716590909090909 litres
 * 
 * Parameter Notes:
 * ignition delay = 150s/m
 * average temperature is 11.66667C
 * average dew point is -1.666667
 * Trees burn 165 ticks
 * Smoke moves 600m/tick
 * Smoke temp decreases 6C/tick
 * For now, assume smoke begins at 100C; as soon as water vapor is created.
 */

export default class CloudModel extends Model3D {
    // Set world size
    constructor(worldOptions = World.defaultOptions(64)) {
        super(worldOptions)
    }

    // TODO: make all time-dependent variables relative to tick speed.
    // Parameters
    tickSpeed = 1000 // seconds
    spreadTime = 15000 // s/100m
    burnTime = 20000 // seconds
    treePercentage = 0.4
    smokeSpeed = 0.006 // in 100m/s
    smokeTemp = 100 // degrees C
    dewPoint = -2 // degrees C


    setup() {
        // Setup Turtle Breeds and Types
        this.turtleBreeds('h2os CCNs')
        this.h2oType = 'h2o'
        this.CCNType = 'CCN'

        // Turtle Variables
        this.h2os.setDefault('atEdge', 'clamp')
        this.CCNs.setDefault('atEdge', 'clamp')
        this.turtles.setDefault('ticks', 0)        // This ticks variable allows keeping track of how long the turtle has been alive
        this.h2os.setDefault('temp', this.smokeTemp)
        this.CCNs.setDefault('temp', this.smokeTemp)
        this.h2os.setDefault('liquid', false)

        // Setup Patch Breeds and Types
        this.patchBreeds('trees dirts fires')
        this.dirtType = 'dirt'
        this.fireType = 'fire'
        this.treeType = 'tree'

        // Patch Variables
        this.fires.setDefault('ticks', 0)       // Keeps track of how long the fire burns
        
        this.createPatches()

        // Ignite Center Tree to begin fire
        this.patches.ask(p => {
            if ((p.x === 0) && (p.y === 0)) this.igniteTree(p)
        })
    }

    igniteTree(treeToIgnite) {
        // Set tree to fire breed
        treeToIgnite.setBreed(this.fires)
        treeToIgnite.type = this.fireType
        treeToIgnite.ticks = this.ticks
    }

    createPatches() {
        // Create Trees based on treePercentage
        this.patches.ask(p => {
            p.value = Math.random()
            if (Math.random() <= this.treePercentage) {
                // Set Trees
                p.setBreed(this.trees)
                p.type = this.treeType
            } else {
                // Set Dirts
                p.setBreed(this.dirts)
                p.type = this.dirtType
            }
        })
    }

    step() {
        // Move Turtles
        this.turtles.ask(t => {
            // While smoke particles are above dew point, move upward and cool
            if (t.temp > this.dewPoint) {
                t.setxyz(t.x + (Math.random() -0.5)*2, t.y + (Math.random() -0.5)*2, t.z + (this.smokeSpeed * this.tickSpeed))
                t.temp -= 6
            }
        })

        // Remove particles to reduce computational demand
        this.turtles.ask( t=> {
            if (this.ticks > t.ticks + 30) t.die()
        })
        
        // Ignite neighboring trees
        this.fires.ask(p => {
            // p.neighbors returns an AgentArray, which can be looped through with the forLoop function. This is more efficient and easier than something like for (var i = 0; length, i++), but achieves the same thing
            if (this.ticks % (this.spreadTime / this.tickSpeed) == 0) { // fire spread time
                p.neighbors.forLoop(agent => {
                    if (agent.type == this.treeType) this.igniteTree(agent)
                })
            }

            // Tree burn time
            if (this.ticks > p.ticks + (this.burnTime / this.tickSpeed)) {
                p.setBreed(this.dirts)
                p.type = this.dirtType
            }

            // Create H2O
            this.h2os.createOne(t => {
                t.setxyz(p.x, p.y, this.world.minZ)
                t.type = this.h2oType
                t.ticks = this.ticks
            })

            // Create CCN
            this.CCNs.createOne(t => {
                t.setxyz(p.x, p.y, this.world.minZ)
                t.type = this.CCNType
                t.ticks = this.ticks
            })
        })
    }
}