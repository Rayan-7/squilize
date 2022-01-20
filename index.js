
const pokeData = require('./poke_data.json')

const Sequelize = require('sequelize')
const { json } = require('sequelize')

const sequelize = new Sequelize('mysql://root:@localhost/pokie_sql')

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    })

function insertTown(){
    const townOBj = new Set()
    pokeData.forEach(poked=>{
        poked.ownedBy.forEach(ownedBy=>{
            townOBj.add(ownedBy.town)
        })
    })
    const townNames=[...townOBj]
    townNames.forEach(townNames=>{
            sequelize
        .query(`INSERT INTO town VALUES(null,"${townNames}")`)
        .then(function ([result]) {
            console.log(result)
        }) 
    })
    
    
    
}
//insertTown()
async function selectTowns(){
    let towns=[];
    await sequelize
    .query("SELECT * FROM town")
    .then(function ([results, metadata]) {
        towns=results
    })
    return towns;
}
//selectTowns()

function insertType(){
    const typeOBj = new Set()
    
    pokeData.forEach(poked=>{
        typeOBj.add(poked.type)
    })

    const typeNames=[...typeOBj]
    typeNames.forEach(typeNames=>{
        sequelize
    .query(`INSERT INTO pokemon_type VALUES(null,"${typeNames}")`)
    .then(function ([result]) {
        console.log(result)
    }) 
})
}

async function selectTypes(){
    return sequelize
    .query("SELECT * FROM pokemon_type")
    .then(function ([results, metadata]) {
        return results;
    })
}
//insertType()
//selectTypes()
function deleteTypes(){
    sequelize
    .query("DELETE FROM pokemon_type")
    .then(function ([results, metadata]) {
        console.log(results)
    })
}
//deleteTypes()

async function insertTrainer(){
    const trainerDetails = {}
    const towns=await selectTowns()
    
    console.log(towns)
    pokeData.forEach(poked=>{
        
        poked.ownedBy.forEach(ownedBy=>{
            if(!trainerDetails[ownedBy.name]){
                towns.forEach(town=>{
                    if(town.town===ownedBy.town)
                    {
                        trainerDetails[ownedBy.name]=town.id
                    }
                })
                
            }
            
        })
    })
    for (const trainerName in trainerDetails) {
        //console.log(`${trainerName}: ${trainerDetails[trainerName]}`);
    sequelize
        .query(`INSERT INTO trainer VALUES(null,"${trainerName}","${trainerDetails[trainerName]}")`)
        .then(function ([result]) {
            console.log(result)
    }) 
        
    }
}
//insertTrainer()

async function selectTrainer(){
    return sequelize
    .query("SELECT * FROM trainer")
    .then(function ([results, metadata]) {
        return results
    })
}
//selectTrainer()

async function insertPokemon(){
    const types=await selectTypes()
    let typeId;
    pokeData.forEach(poked=>{
        types.forEach(type=>{
            if(type.type===poked.type)
            {
                typeId=type.id
                return
            }
        })
            sequelize
            .query(`INSERT INTO pokemon VALUES("${poked.id}",
            "${poked.name}",
            "${typeId}",
            "${poked.height}",
            "${poked.weight}")`)
            .then(function ([result]) {
                console.log(result)
        })
    })
}
//insertPokemon();

async function selectPokemons(){
    return sequelize
    .query("SELECT * FROM pokemon")
    .then(function ([results, metadata]) {
        return results;
    })
}
//selectPokemons()

async function insertPokemon_trainer(){
    const trainers =await selectTrainer()
    console.log(trainers)
    pokeData.forEach(poked=>{
        poked.ownedBy.forEach(ownedBy=>{
            trainers.forEach(trainer=>{
                if(ownedBy.name===trainer.name){
                    //console.log(poked.id)
                    sequelize
                    .query(`INSERT INTO pokemon_trainer VALUES("${poked.id}","${trainer.id}")`)
                    .then(function ([result]) {
                        console.log(result)
                    })
                }
                    
            })
        })
    })
}
//insertPokemon_trainer()

async function selectPokemonsTrainers(){
    return sequelize
    .query("SELECT * FROM pokemon_trainer")
    .then(function ([results, metadata]) {
        console.log(results)
    })
}

//selectPokemonsTrainers()

////////////////////////////////////////////
//ex2

async function maxWeightFunc(){
    return sequelize
    .query("SELECT MAX(weight) as max FROM pokemon")
    .then(function ([results, metadata]) {
        return results[0].max
    })
}
async function heaviestPokemon(){
    let maxWeight= await maxWeightFunc()
    sequelize
    .query(`SELECT *  FROM pokemon WHERE weight = "${maxWeight}"`)
    .then(function ([results, metadata]) {
        console.log(results[0].name)
    })
}
//heaviestPokemon()

///////////////////////////////////////
//ex3


function pokemonsTypes(pokeType){
    
    sequelize
    .query(`SELECT *  FROM pokemon,pokemon_type WHERE pokemon_type.type = "${pokeType}"`)
    .then(function ([results, metadata]) {
        console.log(results)
    })
}

//pokemonsTypes("grass")


///////////////////
///ex4
async function pokemonId(pokeName){
    return sequelize
    .query(`SELECT id FROM pokemon WHERE name = "${pokeName}"`)
    .then(function ([results, metadata]) {
        return results
    })
}
async function pokemonTrainers(pokeName){
    let pokeId=await pokemonId(pokeName)
    console.log(pokeId[0].id)
    sequelize
    .query(`SELECT trainer.name FROM trainer,pokemon_trainer WHERE pokemon_id = "${pokeId[0].id}" AND 
    pokemon_trainer.trainer_id=trainer.id`)
    .then(function ([results, metadata]) {
        console.log(results)
    })
}
//pokemonTrainers("gengar")

/////////////////////
//////ex5
async function trainerIdFunc(trainerName){
    
    return sequelize
    .query(`SELECT id FROM trainer WHERE name = "${trainerName}"`)
    .then(function ([results, metadata]) {
        return results
    })
}
async function findRoster(trainerName){
    let trainerId=await trainerIdFunc(trainerName)
    console.log(trainerId)
    sequelize
    .query(`SELECT pokemon.name FROM pokemon,trainer,pokemon_trainer WHERE trainer_id = "${trainerId[0].id}" AND 
    pokemon_trainer.pokemon_id=pokemon.id`)
    .then(function ([results, metadata]) {
        console.log(results)
    })
}
findRoster("Loga")
