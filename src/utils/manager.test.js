import { describe, expect, it } from 'vitest'

import { checkCompatibleDevice } from './manager'

const commonStorageInfo = {
  block_size: 4096,
  page_size: 4096,
  num_physical: 6,
  mem_type: 'UFS',
}

const originalCompatibleDevices = [
  // comma three
  // userdata start 6159400 size 7986131
  { prod_name: 'H28S7Q302BMR', manufacturer_id: 429, total_blocks: 14145536, userdataImage: 'userdata_30' },
  { prod_name: 'H28U74301AMR', manufacturer_id: 429, total_blocks: 14145536, userdataImage: 'userdata_30' },
  { prod_name: '64GB-UFS-MT   8QSP', manufacturer_id: 300, total_blocks: 14143488, userdataImage: 'userdata_30' },

  // comma 3X
  // userdata start 6159400 size 23446483
  { prod_name: 'SDINDDH4-128G   1308', manufacturer_id: 325, total_blocks: 29605888, userdataImage: 'userdata_89' },
  // unknown userdata sectors
  { prod_name: 'SDINDDH4-128G   1272', manufacturer_id: 325, total_blocks: 29775872, userdataImage: 'userdata_90' },
]

describe.each(originalCompatibleDevices)('$prod_name', ({ userdataImage, ...deviceStorageInfo }) => {
  const storageInfo = { ...commonStorageInfo, ...deviceStorageInfo }

  it(`returns ${userdataImage} for the original compatible device values`, () => {
    expect(checkCompatibleDevice(storageInfo, [{ name: userdataImage }])).toBe(userdataImage)
  })
})

it('rejects a userdata image that is unavailable in the selected manifest', () => {
  const storageInfo = { ...commonStorageInfo, total_blocks: 14143488 }
  const manifest = [{ name: 'userdata_89' }, { name: 'userdata_90' }]

  expect(() => checkCompatibleDevice(storageInfo, manifest))
    .toThrow('Device storage requires unavailable userdata image "userdata_30"')
})

it('rejects storage without enough capacity for userdata', () => {
  const storageInfo = { ...commonStorageInfo, total_blocks: 6159405 }

  expect(() => checkCompatibleDevice(storageInfo, []))
    .toThrow('UFS chip does not have space for userdata')
})
