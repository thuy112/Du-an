<template>
    <v-autocomplete
        v-model="selectValue"
        :hide-details="hideDetails"
        :item-text="itemText"
        :item-value="itemValue"
        :items="items"
        :disabled="disabled"
        :multiple="multiple"
        :rules="required ? [...rules, $required] : rules"
        :style="width && !$vuetify.breakpoint.mobile ? `max-width: ${width}` : ''"
        :clearable="clearable"
        :filter="customFilter"
        dense
        :no-data-text="noDataText"
        outlined
        @change="onChange"
    >
        <template #label>
            <div v-if="!required">{{ label }}</div>
            <base-required-label v-else :name="label" />
        </template>
    </v-autocomplete>
</template>
<script>
export default {
    name: "BaseSelect",
    props: {
        noDataText: { type: String, default: () => "Không có dữ liệu" },
        multiple: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        required: {
            type: Boolean,
            default: false,
        },
        clearable: {
            type: Boolean,
            default: false,
        },
        hideDetails: { type: Boolean, default: () => false },
        rules: { type: Array, default: () => [] },
        itemText: { type: [String, Function], default: () => "text" },
        itemValue: { type: String, default: () => "value" },
        label: {
            type: String,
            default: () => "",
        },
        value: {
            type: [String, Number, Array],
            default: () => "",
        },
        items: {
            type: Array,
            default: () => [],
        },
        width: {
            type: String,
            default: () => "",
        },
        // Thêm prop để chỉ định các trường tìm kiếm
        searchFields: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            selectValue: this.value,
        };
    },
    watch: {
        value(newValue) {
            this.selectValue = newValue;
        },

        selectValue(newValue) {
            this.$emit("input", newValue);
        },
    },
    methods: {
        onChange(event) {
            this.$emit("change", event);
        },
        // Custom filter function để tìm kiếm theo nhiều trường
        customFilter(item, queryText, itemText) {
            // Nếu không có searchFields, sử dụng filter mặc định
            if (!this.searchFields || this.searchFields.length === 0) {
                return itemText.toLowerCase().includes(queryText.toLowerCase());
            }

            // Tìm kiếm trong các trường được chỉ định
            const query = queryText.toLowerCase();
            return this.searchFields.some((field) => {
                const fieldValue = item[field];
                return fieldValue && fieldValue.toString().toLowerCase().includes(query);
            });
        },
    },
};
</script>
<style scoped></style>
