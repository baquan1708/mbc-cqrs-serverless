import { normalize } from '@angular-devkit/core'
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing'
import * as path from 'path'
import { ControllerOptions } from './controller.schema'

describe('Controller Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(__dirname, '../../collection.json'),
  )
  it('should manage name only', async () => {
    const options: ControllerOptions = {
      name: 'foo',
    }
    const tree: UnitTestTree = await runner.runSchematic('controller', options)

    const files: string[] = tree.files

    console.log('$!@#$!@file', files)

    expect(
      files.find((filename) => filename === '/src/foo/foo.controller.ts'),
    ).toBeDefined()
    expect(
      files.find(
        (filename) => filename === '/test/unit/foo/foo.controller.spec.ts',
      ),
    ).toBeDefined()
    console.log(tree.readContent('/test/unit/foo/foo.controller.spec.ts'))
    expect(tree.readContent('/src/foo/foo.controller.ts')).toEqual(
      "import { Controller, Logger } from '@nestjs/common';\n" +
        "import { ApiTags } from '@nestjs/swagger'\n" +
        '\n' +
        "@ApiTags('foo')\n" +
        "@Controller('api/foo')\n" +
        'export class FooController {\n' +
        '    private readonly logger = new Logger(FooController.name)\n' +
        '\n' +
        '    constructor() {}\n' +
        '\n' +
        '}\n',
    )
  })
})
