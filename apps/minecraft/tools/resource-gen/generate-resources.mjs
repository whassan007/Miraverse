#!/usr/bin/env node
export function generateBlockDefinition(blockId, mapColor = '#C4A472') {
  return {
    format_version: '1.20.80',
    'minecraft:block': {
      description: {
        identifier: blockId,
        menu_category: { category: 'construction' },
      },
      components: {
        'minecraft:destructible_by_mining': { seconds_to_destroy: 1.5 },
        'minecraft:destructible_by_explosion': { explosion_resistance: 6.0 },
        'minecraft:map_color': mapColor,
      },
    },
  };
}
