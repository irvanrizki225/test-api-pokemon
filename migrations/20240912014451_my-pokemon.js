/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema.createTable('my_pokemon', function(table) {
        table.increments('id').primary();
        table.integer('pokemon_id').notNullable();
        table.string('name').notNullable();
        table.integer('rename_count').notNullable();
        table.timestamps(true, true); // Adds created_at and updated_at fields
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('my_pokemon');
};
