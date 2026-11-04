#!/usr/bin/env node
export function buildEntityDescriptor(id, country, role = 'mentor') {
  return {
    format_version: '1.19.0',
    'minecraft:client_entity': {
      description: {
        identifier: `miraverse:${id}`,
        materials: { default: 'entity_alphatest' },
        textures: { default: `textures/entity/${id}` },
        geometry: { default: 'geometry.miraverse.mentor' },
        animations: {
          idle: 'animation.miraverse.mentor.idle',
          greeting: 'animation.miraverse.mentor.greeting',
          celebrate: 'animation.miraverse.mentor.celebrate',
        },
        scripts: {
          animate: ['idle'],
        },
        render_controllers: ['controller.render.miraverse.mentor'],
        spawn_egg: {
          base_color: '#D8A24A',
          overlay_color: '#2A6B53',
        },
      },
      metadata: { country, role },
    },
  };
}
