// plugins/v-currency-input.js
import Vue from 'vue'
import VueCurrencyInput from 'vue-currency-input'

const options = {
  currency: 'VND',
  locale: 'vi-VN',
  distractionFree: false,
  precision: 0,
}

Vue.use(VueCurrencyInput, options)