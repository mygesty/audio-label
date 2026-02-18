import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AudioPlayer from '../AudioPlayer.vue'

// Mock HTMLAudioElement
class MockAudioElement {
  src = ''
  currentTime = 0
  duration = 0
  volume = 1
  muted = false
  playbackRate = 1
  paused = true
  ended = false
  
  private eventListeners: Record<string, Function[]> = {}
  
  play() {
    this.paused = false
    return Promise.resolve()
  }
  
  pause() {
    this.paused = true
  }
  
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }
  
  removeEventListener(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback)
    }
  }
  
  triggerEvent(event: string) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback({}))
    }
  }
}

describe('AudioPlayer', () => {
  let mockAudio: MockAudioElement
  
  beforeEach(() => {
    // Mock HTMLAudioElement constructor
    mockAudio = new MockAudioElement()
    global.Audio = vi.fn(() => mockAudio) as any
    
    // Mock window.addEventListener
    window.addEventListener = vi.fn()
    window.removeEventListener = vi.fn()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })
  
  describe('组件渲染', () => {
    it('应该正确渲染播放器组件', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
          duration: 120,
        },
      })
      
      expect(wrapper.find('.audio-player').exists()).toBe(true)
      expect(wrapper.find('.player-controls').exists()).toBe(true)
      expect(wrapper.find('.shortcuts-hint').exists()).toBe(true)
    })
    
    it('应该显示播放控制按钮', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      // 检查是否渲染了播放按钮
      expect(wrapper.find('.control-buttons').exists()).toBe(true)
    })
    
    it('应该显示进度条', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
          duration: 120,
        },
      })
      
      expect(wrapper.find('.progress-section').exists()).toBe(true)
      expect(wrapper.find('.progress-slider').exists()).toBe(true)
    })
    
    it('应该显示音量控制', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(wrapper.find('.volume-control').exists()).toBe(true)
      expect(wrapper.find('.volume-slider').exists()).toBe(true)
    })
    
    it('应该显示播放速度控制', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(wrapper.find('.playback-rate-control').exists()).toBe(true)
    })
    
    it('应该显示循环播放控制', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(wrapper.find('.loop-control').exists()).toBe(true)
    })
  })
  
  describe('播放控制', () => {
    it('应该调用 play 方法播放音频', async () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      const playSpy = vi.spyOn(mockAudio, 'play')
      await wrapper.vm.play()
      
      expect(playSpy).toHaveBeenCalled()
    })
    
    it('应该调用 pause 方法暂停音频', async () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      const pauseSpy = vi.spyOn(mockAudio, 'pause')
      wrapper.vm.pause()
      
      expect(pauseSpy).toHaveBeenCalled()
    })
    
    it('应该调用 stop 方法停止并重置音频', async () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      const pauseSpy = vi.spyOn(mockAudio, 'pause')
      wrapper.vm.stop()
      
      expect(pauseSpy).toHaveBeenCalled()
      expect(mockAudio.currentTime).toBe(0)
    })
    
    it('应该调用 forward 方法前进5秒', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      mockAudio.currentTime = 10
      wrapper.vm.forward()
      
      expect(mockAudio.currentTime).toBe(15)
    })
    
    it('应该调用 backward 方法后退5秒', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      mockAudio.currentTime = 10
      wrapper.vm.backward()
      
      expect(mockAudio.currentTime).toBe(5)
    })
  })
  
  describe('进度条控制', () => {
    it('应该正确更新当前时间', async () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      mockAudio.currentTime = 30
      mockAudio.triggerEvent('timeupdate')
      
      await nextTick()
      
      expect(wrapper.vm.currentTime).toBe(30)
    })
    
    it('应该通过进度条跳转到指定时间', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
          duration: 120,
        },
      })
      
      wrapper.vm.seek(60)
      
      expect(mockAudio.currentTime).toBe(60)
    })
    
    it('应该限制跳转时间在有效范围内', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
          duration: 120,
        },
      })
      
      // 测试超过最大值
      wrapper.vm.seek(200)
      expect(mockAudio.currentTime).toBeLessThanOrEqual(120)
      
      // 测试负值
      wrapper.vm.seek(-10)
      expect(mockAudio.currentTime).toBeGreaterThanOrEqual(0)
    })
  })
  
  describe('音量控制', () => {
    it('应该正确设置音量', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      wrapper.vm.setVolume(0.5)
      
      expect(mockAudio.volume).toBe(0.5)
      expect(wrapper.vm.volume).toBe(0.5)
    })
    
    it('应该限制音量在 0-1 范围内', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      // 测试超过最大值
      wrapper.vm.setVolume(1.5)
      expect(mockAudio.volume).toBeLessThanOrEqual(1)
      
      // 测试负值
      wrapper.vm.setVolume(-0.5)
      expect(mockAudio.volume).toBeGreaterThanOrEqual(0)
    })
    
    it('应该正确切换静音状态', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      wrapper.vm.toggleMute()
      expect(mockAudio.muted).toBe(true)
      expect(wrapper.vm.isMuted).toBe(true)
      
      wrapper.vm.toggleMute()
      expect(mockAudio.muted).toBe(false)
      expect(wrapper.vm.isMuted).toBe(false)
    })
  })
  
  describe('播放速度控制', () => {
    it('应该正确设置播放速度', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      wrapper.vm.setPlaybackRate(1.5)
      
      expect(mockAudio.playbackRate).toBe(1.5)
      expect(wrapper.vm.playbackRate).toBe(1.5)
    })
    
    it('应该限制播放速度在 0.5x-2x 范围内', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      // 测试超过最大值
      wrapper.vm.setPlaybackRate(3.0)
      expect(mockAudio.playbackRate).toBeLessThanOrEqual(2)
      
      // 测试低于最小值
      wrapper.vm.setPlaybackRate(0.2)
      expect(mockAudio.playbackRate).toBeGreaterThanOrEqual(0.5)
    })
  })
  
  describe('循环播放控制', () => {
    it('应该正确设置循环播放', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
          duration: 120,
        },
      })
      
      wrapper.vm.setLoop(30, 60)
      
      expect(wrapper.vm.loopEnabled).toBe(true)
      expect(wrapper.vm.loopStart).toBe(30)
      expect(wrapper.vm.loopEnd).toBe(60)
    })
    
    it('应该正确取消循环播放', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      wrapper.vm.setLoop(30, 60)
      wrapper.vm.clearLoop()
      
      expect(wrapper.vm.loopEnabled).toBe(false)
      expect(wrapper.vm.loopStart).toBe(0)
      expect(wrapper.vm.loopEnd).toBe(0)
    })
    
    it('应该在循环结束时跳转到循环起点', async () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
          duration: 120,
        },
      })
      
      wrapper.vm.setLoop(30, 60)
      
      mockAudio.currentTime = 70
      mockAudio.triggerEvent('timeupdate')
      
      await nextTick()
      
      expect(mockAudio.currentTime).toBe(30)
    })
  })
  
  describe('事件发射', () => {
    it('应该在播放时发射 play 事件', async () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      wrapper.vm.play()
      mockAudio.triggerEvent('play')
      
      await nextTick()
      
      expect(wrapper.emitted('play')).toBeTruthy()
    })
    
    it('应该在暂停时发射 pause 事件', async () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      wrapper.vm.pause()
      mockAudio.triggerEvent('pause')
      
      await nextTick()
      
      expect(wrapper.emitted('pause')).toBeTruthy()
    })
    
    it('应该在时间更新时发射 timeupdate 事件', async () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      mockAudio.currentTime = 30
      mockAudio.triggerEvent('timeupdate')
      
      await nextTick()
      
      expect(wrapper.emitted('timeupdate')).toBeTruthy()
      expect(wrapper.emitted('timeupdate')?.[0]).toEqual([30])
    })
    
    it('应该在播放速度改变时发射 playbackratechange 事件', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      wrapper.vm.setPlaybackRate(1.5)
      
      expect(wrapper.emitted('playbackratechange')).toBeTruthy()
      expect(wrapper.emitted('playbackratechange')?.[0]).toEqual([1.5])
    })
  })
  
  describe('时间格式化', () => {
    it('应该正确格式化时间为 MM:SS', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(wrapper.vm.formatTime(0)).toBe('00:00')
      expect(wrapper.vm.formatTime(65)).toBe('01:05')
      expect(wrapper.vm.formatTime(3665)).toBe('61:05')
    })
    
    it('应该正确格式化详细时间为 HH:MM:SS', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(wrapper.vm.formatTimeDetailed(0)).toBe('00:00:00')
      expect(wrapper.vm.formatTimeDetailed(65)).toBe('01:05')
      expect(wrapper.vm.formatTimeDetailed(3665)).toBe('01:01:05')
    })
    
    it('应该处理无效时间', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(wrapper.vm.formatTime(-1)).toBe('00:00')
      expect(wrapper.vm.formatTime(NaN)).toBe('00:00')
      expect(wrapper.vm.formatTime(Infinity)).toBe('00:00')
    })
  })
  
  describe('快捷键', () => {
    it('应该在按下空格键时切换播放/暂停', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      const playSpy = vi.spyOn(wrapper.vm, 'play')
      const pauseSpy = vi.spyOn(wrapper.vm, 'pause')
      
      wrapper.vm.handleKeyDown({ code: 'Space', preventDefault: vi.fn(), target: document.body })
      
      if (wrapper.vm.isPlaying) {
        expect(pauseSpy).toHaveBeenCalled()
      } else {
        expect(playSpy).toHaveBeenCalled()
      }
    })
    
    it('应该在按下 Esc 键时停止播放', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      const stopSpy = vi.spyOn(wrapper.vm, 'stop')
      
      wrapper.vm.handleKeyDown({ code: 'Escape', preventDefault: vi.fn(), target: document.body })
      
      expect(stopSpy).toHaveBeenCalled()
    })
    
    it('应该在按下左箭头键时后退5秒', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      const backwardSpy = vi.spyOn(wrapper.vm, 'backward')
      
      wrapper.vm.handleKeyDown({ code: 'ArrowLeft', preventDefault: vi.fn(), target: document.body })
      
      expect(backwardSpy).toHaveBeenCalled()
    })
    
    it('应该在按下右箭头键时前进5秒', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      const forwardSpy = vi.spyOn(wrapper.vm, 'forward')
      
      wrapper.vm.handleKeyDown({ code: 'ArrowRight', preventDefault: vi.fn(), target: document.body })
      
      expect(forwardSpy).toHaveBeenCalled()
    })
    
    it('应该在输入框中不触发快捷键', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      const playSpy = vi.spyOn(wrapper.vm, 'play')
      
      const inputElement = document.createElement('input')
      wrapper.vm.handleKeyDown({ code: 'Space', preventDefault: vi.fn(), target: inputElement })
      
      expect(playSpy).not.toHaveBeenCalled()
    })
  })
  
  describe('暴露的方法', () => {
    it('应该暴露 play 方法', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(typeof wrapper.vm.play).toBe('function')
    })
    
    it('应该暴露 pause 方法', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(typeof wrapper.vm.pause).toBe('function')
    })
    
    it('应该暴露 stop 方法', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(typeof wrapper.vm.stop).toBe('function')
    })
    
    it('应该暴露 seek 方法', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(typeof wrapper.vm.seek).toBe('function')
    })
    
    it('应该暴露 setPlaybackRate 方法', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(typeof wrapper.vm.setPlaybackRate).toBe('function')
    })
    
    it('应该暴露 setVolume 方法', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(typeof wrapper.vm.setVolume).toBe('function')
    })
    
    it('应该暴露 toggleMute 方法', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(typeof wrapper.vm.toggleMute).toBe('function')
    })
    
    it('应该暴露 setLoop 方法', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(typeof wrapper.vm.setLoop).toBe('function')
    })
    
    it('应该暴露 clearLoop 方法', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(typeof wrapper.vm.clearLoop).toBe('function')
    })
    
    it('应该暴露 isPlaying 方法', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(typeof wrapper.vm.isPlaying).toBe('function')
    })
    
    it('应该暴露 getCurrentTime 方法', () => {
      const wrapper = mount(AudioPlayer, {
        props: {
          audioUrl: 'http://example.com/audio.mp3',
        },
      })
      
      expect(typeof wrapper.vm.getCurrentTime).toBe('function')
    })
  })
})