import { KEY_SEPARATOR } from '@mbc-cqrs-severless/core'

export const MASTER_PK_PREFIX = 'MASTER'
export const SETTING_SK_PREFIX = 'master_setting'

export function generateSettingPk(tenantCode: string) {
  return `${MASTER_PK_PREFIX}${KEY_SEPARATOR}${tenantCode}`
}

export function generateSettingSk(code: string) {
  return `${SETTING_SK_PREFIX}${KEY_SEPARATOR}${code}`
}

export function generateDataSettingSk(settingCode: string, code: string) {
  return `${settingCode}${KEY_SEPARATOR}${code}`
}

export function parseDataSettingSk(sk: string): {
  settingCode: string
  code: string
} {
  if (sk.split(KEY_SEPARATOR).length !== 2) {
    throw new Error('Invalid SK')
  }
  const [settingCode, code] = sk.split(KEY_SEPARATOR)
  return { settingCode, code }
}

export function parsePk(pk: string): { type: string; tenantCode: string } {
  if (pk.split(KEY_SEPARATOR).length !== 2) {
    throw new Error('Invalid PK')
  }
  const [type, tenantCode] = pk.split(KEY_SEPARATOR)
  return {
    type,
    tenantCode,
  }
}
