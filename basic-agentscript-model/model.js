//import * as util from './src/utils.js'
import Model3D from './src/Model3D.js'
import World from './src/World.js'


/**
 * A few Notes:
 * Assume each patch is 100m^2. This puts the total z range of the model at 12.8km, approximately the height of the troposphere
 * the base of the forest is at 2.4km
 * 
 * Some other notes:
 * water begins in vapor form, rises until it condenses
 * Water molecules are attracted to each other, meaning clouds are congregations of liquid water
 * 
 * as altitude increases:
 * temp decreases by 1C per 100m
 * pressure decreases
 * cool air and low pressure cause condensation, adiabatic process
 * adiabatic meaning a gradual/smooth transition
 * 
 * assume chemical potential of liquid water = chem pot of water vapor
 * 
 * Key part of kelvin equation is relation between vapor pressure and droplet radius
 * 
 * implement things that aren't water for clouds to form on; ash/soot (CCNs)
 * 
 * Assumption stuff
 * 0.43-1.82% of mass of burnt wood results in ash; assume 1% for simple
 * 1 tree (C6H12O6) = 5.99co2 + 6h2o + 0.01CCN
 * multiply everything by 100 for reasons?
 * assume CCNs are carbon
 * everything is variable
 * 
 * So to do:
 * find ratio of CCN and h2o per tree
 * temperature and pressure
 * model condensation of water onto CCN
 */

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
        this.turtleBreeds('h2os CCNs')
        this.h2oType = 'h2o'
        this.CCNType = 'CCN'

        // Turtle Variables
        this.turtles.setDefault('atEdge', 'clamp')
        this.turtles.setDefault('ticks', 0)        // This ticks variable allows keeping track of how long the turtle has been alive
        this.h2os.setDefault('liquid', true)

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
        // Set tree to fire breed, which does nothing right now but someday it will
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
            // Turtles move in brownian motion, constantly moving up
            t.setxyz(t.x + (Math.random() -0.5)*2, t.y + (Math.random() -0.5)*2, t.z + this.particleSpeed)
        })

        // If the water is not liquid, don't worry about it
        this.h2os.ask(t => {
            if (this.ticks > t.ticks + 30) t.liquid = false

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
            // Currently only creating every third tick for the sake of not destroying computer
            if (this.ticks % 3 === 0){
                this.h2os.createOne(t => {
                    t.setxyz(p.x, p.y, this.world.minZ)
                    t.type = this.h2oType
                    t.ticks = this.ticks
                })
            }
        })
    }
}