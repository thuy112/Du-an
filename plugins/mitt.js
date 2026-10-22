// plugins/mitt.js
import mitt from 'mitt'

const emitter = mitt()

export default (context, inject) => {
  inject('eventBus', emitter)
}
