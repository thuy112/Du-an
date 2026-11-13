<script>
export default {
    name: "DataEntryNumberInput",
    props: {
        label: { type: String, required: true },
        placeholder: { type: String },
        suffix: { type: String },
        value: [String, Number],
        required: { type: Boolean, default: false },
        hideDetails: Boolean,
        width: { type: [Number, String], default: "" },
        rules: {
            type: Array,
            default() {
                return [];
            },
        },
        negative: Boolean,
        outlined: { type: Boolean, default: true },
    },
    methods: {
        input(val) {
            val = val?.toString() || "";
            let number = val.replace(/[^\d.-]/g, "");

            if (!this.negative) {
                number = number.replace(/-/g, "");
            }

            // Giới hạn tối đa 4 chữ số
            if (number.length > 4) {
                number = number.slice(0, 4);
            }

            this.$emit("input", number);
        },
        validateKeypress(event) {
            const char = String.fromCharCode(event.keyCode || event.which);
            const allowedChars = this.negative ? /^[0-9.-]$/ : /^[0-9.]$/;

            // Kiểm tra nếu đã nhập đủ 4 số
            if (!allowedChars.test(char) || this.value?.toString().length >= 4) {
                event.preventDefault();
            }
        },
    },
    watch: {
        value(newVal) {
            if (newVal !== this.value) {
                this.$emit("input", newVal);
            }
        },
    },
};
</script>

<template>
    <v-text-field
        ref="input"
        dense
        :placeholder="placeholder"
        :outlined="outlined"
        :hide-details="hideDetails"
        :rules="[required ? $ruleRequired() : true, ...rules]"
        v-bind="$attrs"
        type="text"
        :suffix="suffix"
        :value="value"
        @input="input($event)"
        @keypress="validateKeypress"
    >
        <template v-if="label" #label>
            {{ label }}
            <span v-if="required" class="error--text ms-1">*</span>
        </template>
    </v-text-field>
</template>
