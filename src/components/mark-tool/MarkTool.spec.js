import { shallowMount } from '@vue/test-utils'
import MarkTool from './MarkTool.vue'
import { describe, expect, it, beforeEach } from 'vitest'

let wrapper

describe('MarkTool', () => {
  beforeEach(() => {
    wrapper = shallowMount(MarkTool)
  })

  it('is called', () => {
    expect(wrapper.exists()).toBeTruthy()
  })
})
