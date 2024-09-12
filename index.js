import { isPrime, Fibonacci } from './helpers/index.js';
import express from 'express';
import { pool } from './helpers/database.js';

const app = express();
const port = 8989;

app.use(express.json());


app.get('/api/v1/my-pokemon', async (req, res) => {
    try {
        const pokemonResult = await pool.query('SELECT * FROM my_pokemon');
        res.json({
            success: true,
            message: 'You caught a new Pokemon.',
            data: pokemonResult.rows
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong.',
        })
    }

});

// Validation middleware for request body
const validateCatchRequest = (req, res, next) => {
    const { pokemon_id, name } = req.body;
    if (!pokemon_id || !name) {
        return res.status(400).json({
            success: false,
            message: 'pokemon_id and name are required fields.',
        });
    }
    if (typeof pokemon_id !== 'number' || typeof name !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Invalid data type. pokemon_id should be a number and name should be a string.',
        });
    }
    next();
};

// Catch pokemon route
app.post('/api/v1/catch', validateCatchRequest, async (req, res) => {
    const { pokemon_id, name } = req.body;

    // Simulating a 50% probability of success
    const isCatched = Math.random() < 0.5; 

    if (!isCatched) {
        return res.json({
            success: false,
            message: 'You failed to catch the Pokemon.',
        });
    }

    try {
        // Check if the Pokemon is already in the database
        const pokemonResult = await pool.query('SELECT * FROM my_pokemon WHERE pokemon_id = $1', [pokemon_id]);
        if (pokemonResult.rows.length > 0) {
            return res.json({
                success: false,
                message: 'The Pokemon is already in the database.',
            });
        }

        // Insert the renamed Pokemon into the database
        await pool.query('INSERT INTO my_pokemon (pokemon_id, name, rename_count) VALUES ($1, $2, 0)', [pokemon_id, name]);

        return res.json({
            success: true,
            message: 'You caught a Pokemon!',
            data: { pokemon_id: pokemon_id, name: name },
        });

    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while catching the Pokemon.',
        });
    }
});

app.put('/api/v1/rename', async (req, res) => {
    const { pokemon_id, name } = req.body;
    
    try {
        // Get pokemon data
        const pokemonData = await pool.query('SELECT * FROM my_pokemon WHERE pokemon_id = $1', [pokemon_id]);

        // Check if the Pokemon exists
        if (pokemonData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pokemon not found',
            });
        }

        const pokemonRenameCount = pokemonData.rows[0].rename_count;

        // Call Fibonacci function (assuming you have it defined)
        const renameIndex = Fibonacci(pokemonRenameCount);
        const renamePokemon = `${name}-${renameIndex}`;

        // Update pokemon data
        await pool.query('UPDATE my_pokemon SET name = $1, rename_count = rename_count + 1 WHERE pokemon_id = $2', [renamePokemon, pokemon_id]);

        const data = {
            pokemon_id: pokemon_id,
            name: renamePokemon
        }
        
        res.json({
            success: true,
            message: `You renamed a Pokemon: ${pokemonData.rows[0].name} to ${renamePokemon}.`,
            data: data
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while renaming the Pokemon.',
        });
    }
});


app.delete('/api/v1/release/:id', async (req, res) => {
    const { id: pokemon_id } = req.params;

    try {
        // random number for prime check
        const releaseNum = Math.floor(Math.random() * 100);

        // get pokemon data
        const pokemonData = await pool.query('SELECT * FROM my_pokemon WHERE pokemon_id = $1', [pokemon_id]);

        // check if the pokemon exists
        if (pokemonData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pokemon not found',
                data : releaseNum+' - '+pokemon_id
            });
        }

        if (isPrime(releaseNum)) {
            // delete pokemon
            await pool.query('DELETE FROM my_pokemon WHERE pokemon_id = $1', [pokemon_id]);

            res.json({
                success: true,
                message: 'You released a pokemon.',
                data: releaseNum,
            });
        } else {
            res.json({
                success: false,
                message: 'You failed to release a pokemon.',
                data: null,
            });
        }

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while releasing the Pokemon.',
        });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});