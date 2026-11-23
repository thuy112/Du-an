<template>
    <v-textarea
        v-model="textValue"
        :readonly="readonly"
        full-width
        clear-icon="mdi-close-circle"
        :append-icon="appendIcon"
        :hide-details="hideDetails"
        :rules="required ? [...rules, $required, $over255] : [...rules, $over255]"
        :style="width && !$vuetify.breakpoint.mobile ? `max-width: ${width}` : ''"
        :type="type"
        clearable
        dense
        outlined
        @click="$emit('click')"
    >
        <template #label>
            <div v-if="!required">{{ label }}</div>
            <base-required-label v-else :name="label" />
        </template>
    </v-textarea>
</template>

<script>
export default {
    name: "BaseTextArea",
    props: {
        hideDetails: {
            type: Boolean,
            default: false,
        },
        readonly: { type: Boolean, default: false },
        rules: { type: Array, default: () => [] },
        required: {
            type: Boolean,
            default: false,
        },
        appendIcon: { type: String, default: () => "" },
        label: { type: String, default: () => "" },
        type: { type: String, default: "text" },
        value: {
            type: [String, Number],
            default: () => "",
        },
        width: { type: String, default: "" },
    },

    data() {
        return {
            textValue: this.value || "",
        };
    },

    watch: {
        value(newValue) {
            this.textValue = newValue;
        },
        textValue(newValue) {
            if (!newValue) return this.$emit("input", "");
            this.$emit("input", typeof newValue === "string" ? newValue.trimStart() : newValue);
        },
    },
};
</script>
