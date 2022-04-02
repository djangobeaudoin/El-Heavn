//import * as util from './src/utils.js'
import Model3D from './src/Model3D.js'
import World from './src/World.js'


/**
 * A few Notes:
 * Assume each patch is 100m^2. This puts the total z range of the model at 12.8km, approximately the height of the troposphere
 * the base of the forest is at 2.4km
 * 
 * Some other notes:
 * 
 * as altitude increases:
 * temp decreases by 1C per 100m (?)
 * 
 * So to do:
 * find ratio of CCN and h2o per tree
 * temperature and pressure
 * model condensation of water onto CCN
 * 
 * patches are 100m^2
 * 
 * ignition delay 150s/m,
 * therefore each tick is 15000s, the ignition delay per patch.
 * trees take 43 hours to burn completely; 157650s
 * 1 tree = 15.765kg
 * 1cm^3 = 162000CCN
 * trees produce 1 litre of smoke / second
 * entire model is 2,097.152km^3; 209,715,200cm^3
 * moisture content of tree = 50%
 * 
 * 1 litre = 1000cm^3
 * 162000000CCN per litre
 * 2430000000000CCN per tick
 * relative humidity = 44%
 * 7.8825kg of water per tree (?)
 * average temperature is 11.66667C
 * average dew point is -1.666667
 * 
 * smoke moves ~60cm/s
 * 6m/10s
 * 60m/100s
 * 
 * smoke moves 9000m/tick?
 * 
 * so:
 * each CCN sphere = 2430000000000CCN
 * each H2O sphere = 0.716590909090909 litres
 * trees burn for 11 ticks
 * 
 * if ticks = 15000s:
 * trees burn 11 ticks
 * smoke moves 9000m/tick
 * 
 * if ticks = 5000s
 * trees burn 33 ticks
 * smoke moves 3000m/tik
 * 
 * if ticks = 1000s
 * trees burn 165 ticks
 * smoke moves 600m/tick (reasonable-ish)
 * 
 * New Things:
 * each CCN sphere = 2430000000000CCN
 * each H2O sphere = 0.716590909090909 litres
 * average temperature is 11.66667C
 * average dew point is -1.666667
 * Each tick = 1000s
 * Trees burn 165 (?) ticks
 * Smoke moves 600m/tick
 * Smoke temp decreases 6C/tick
 * For now, assume smoke begins at 100C; as soon as water vapor is created.
 */

export default class CloudModel extends Model3D {
    // Set world size
    constructor(worldOptions = World.defaultOptions(64)) {
        super(worldOptions)
    }

    // Misc. Variables
    treePercentage = 0.4
    smokeSpeed = 6 // in 100m/s


    setup() {
        // Setup Turtle Breeds and Types
        this.turtleBreeds('h2os CCNs')
        this.h2oType = 'h2o'
        this.CCNType = 'CCN'

        // Turtle Variables
        this.h2os.setDefault('atEdge', 'clamp')
        this.CCNs.setDefault('atEdge', 'clamp')
        this.turtles.setDefault('ticks', 0)        // This ticks variable allows keeping track of how long the turtle has been alive
        this.h2os.setDefault('temp', 100)
        this.CCNs.setDefault('temp', 100)
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
            /**
             * Does this make sense?
             * IE, yes smoke probably has some variance which this does model,
             * but the scale is non-existent. Ie, every 15000s
             */
            if (t.temp > -1) {
                t.setxyz(t.x + (Math.random() -0.5)*2, t.y + (Math.random() -0.5)*2, t.z + this.smokeSpeed)
                t.temp -= 6
            }
        })

        // Kill stuff after 30 ticks to not murder computer for prototyping
        this.turtles.ask( t=> {
            if (this.ticks > t.ticks + 30) t.die()
        })
        
        // Ignite neighboring trees
        this.fires.ask(p => {
            // p.neighbors returns an AgentArray, which can be looped through with the forLoop function. This is more efficient and easier than something like for (var i = 0; length, i++), but achieves the same thing
            p.neighbors.forLoop(agent => {
                if (agent.type == this.treeType) this.igniteTree(agent)
            })

            if (this.ticks > p.ticks + 11) {
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