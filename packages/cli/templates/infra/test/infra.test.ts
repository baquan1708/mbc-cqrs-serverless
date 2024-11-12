/*
 * Copyright (c) Murakami Business Consulting, Inc. All rights are reserved.
 */

import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { Config, getConfig } from '../config'
import { InfraStack } from '../libs/infra-stack'
import { ApplicationLogLevel, SystemLogLevel } from 'aws-cdk-lib/aws-lambda'

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn(() => Buffer.from('e380014717dda68f930961c8fdcde7')),
}))

jest.mock('aws-cdk-lib', () => ({
  ...jest.requireActual('aws-cdk-lib'),
  Duration: {
    days: jest.fn(() => ({
      toMilliseconds: jest.fn(() => 365 * 24 * 60 * 60 * 1000), // Mock milliseconds for 365 days
    })),
    hours: jest.fn(() => ({
      minutes: jest.fn(() => 365 * 24 * 60),
      toSeconds: jest.fn(() => 365 * 24 * 60 * 60),
    })),
    minutes: jest.fn(() => ({
      toSeconds: jest.fn(() => 365 * 24 * 60),
    })),
    seconds: jest.fn(() => ({
      toSeconds: jest.fn(() => 365 * 24 * 60 * 60),
    })),
  },
  Expiration: {
    after: jest.fn(() => ({
      isBefore: jest.fn(() => false),
      isAfter: jest.fn(() => false),
      toEpoch: jest.fn(() => 1762419954),
    })),
  },
}))

jest.mock('../config', () => ({
  ...jest.requireActual('../config'),
  PIPELINE_NAME: 'TestDeploy',
  GIT_REPO: 'test-repo/repo-name',
  GIT_CONNECTION_ARN:
    'arn:aws:codeconnections:us-east-1:101010101010:connection/70009fc1-ccd4-4a1c-9dbf-509577d2a310',
  ACM_HTTP_CERTIFICATE_ARN:
    'arn:aws:acm:us-east-1:101010101010:certificate/6309f81c-93a7-4b25-b4be-40d86fa89ad7',
  ACM_APPSYNC_CERTIFICATE_ARN:
    'arn:aws:acm:us-east-1:101010101010:certificate/6309f81c-93a7-4b25-b4be-40d86fa89ad7',
  HOSTED_ZONE_ID: 'Z08229276XXXXXX769G0',
  HOSTED_ZONE_NAME: 'test-domain.xyz',
  COGNITO_URL: 'https://cognito-idp.ap-northeast-1.amazonaws.com/',
}))

test('snapshot test for InfraStack', () => {
  console.log(cdk.Duration)
  const cdkEnv: cdk.Environment = {
    account: '101010101010',
    region: 'ap-northeast-1',
  }
  const config: Config = {
    env: 'dev',
    appName: 'test',

    domain: {
      http: 'api.test-domain.xyz',
      appsync: 'appsync.test-domain.xyz',
    },

    userPoolId: 'ap-northeast-1_wdEnqXXXX',

    vpc: {
      id: 'vpc-0a54xxxx21e4468db',
      subnetIds: ['subnet-080xxxxd4fa26f301', 'subnet-0cxxxx764dbc5792c'],
      securityGroupIds: ['sg-06xxxx88ee526f823'],
    },
    rds: {
      accountSsmKey: '/test/rds-account-secret',
      endpoint: 'db.test-domain.xyz',
      dbName: 'mydbinstance',
    },

    logLevel: {
      lambdaSystem: SystemLogLevel.DEBUG,
      lambdaApplication: ApplicationLogLevel.TRACE,
      level: 'verbose',
    },

    frontBaseUrl: 'https://test.test-domain.xyz',
    fromEmailAddress: 'noreply@test-domain.xyz',

    // ecs: {
    //   maxInstances: 1,
    //   minInstances: 1,
    //   cpu: 512,
    //   memory: 1024,
    //   cpuThreshold: 70,
    //   scaleStep: 1,
    //   autoRollback: false,
    // },
  }
  const app = new cdk.App()
  const stack = new InfraStack(app, 'TestInfraStack', { env: cdkEnv, config })
  const template = Template.fromStack(stack).toJSON()

  expect(template).toMatchSnapshot()
})
