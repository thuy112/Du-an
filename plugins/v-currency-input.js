import Vue from "vue"
import VCurrencyField from "v-currency-field"

Vue.use(VCurrencyField, {
  locale: "en-US",
  decimalLength: 0,
  autoDecimalMode: false,
  min: null,
  max: null,
  defaultValue: 0,
  valueAsInteger: true,
  allowNegative: true
})
