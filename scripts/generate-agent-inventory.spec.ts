import { buildInventory } from './generate-agent-inventory'
import * as path from 'path'

describe('buildInventory', () => {
  it('returns packages with name, path, dependencies, modules, services', () => {
    const rootDir = path.resolve(__dirname, '..')
    const inventory = buildInventory({ rootDir })
    expect(inventory.packages.length).toBeGreaterThanOrEqual(10)
    const core = inventory.packages.find(
      (p) => p.name === '@mbc-cqrs-serverless/core',
    )
    expect(core).toBeDefined()
    expect(core!.modules.some((m) => m.className === 'CommandModule')).toBe(
      true,
    )
    expect(core!.services.some((s) => s.className === 'CommandService')).toBe(
      true,
    )
  })
})
