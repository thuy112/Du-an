<script>
import moment from "moment";
import { isRequired } from "~/utils/rules";

export default {
    name: "BaseWeekField",
    props: {
        label: { type: String, required: true },
        field: { type: String, required: true },
        data: { type: Object, required: true },
        hideDetails: { type: Boolean, default: false },
        required: { type: [String, Boolean], default: false },
        rules: {
            type: Array,
            default() {
                return [];
            },
        },
        min: { type: String, required: false, default: "" },
        max: { type: String, required: false, default: "" },
        width: { type: [Number, String], default: "" },
        readonly: Boolean,
        clearable: { type: Boolean, default: true },
        displayFormat: {
            type: String,
            default: "Tuần [W]WW, YYYY",
        },
    },
    data() {
        return {
            weekValue: null,
        };
    },
    computed: {
        displayValue() {
            if (!this.weekValue) return "";
            const momentWeek = moment(this.weekValue, "YYYY-[W]WW");
            if (momentWeek.isValid()) {
                return momentWeek.format(this.displayFormat);
            }
            return this.weekValue;
        },
        weekInputValue() {
            // Chuyển đổi từ format YYYY-[W]WW sang YYYY-WWW cho HTML input
            if (!this.weekValue) return "";
            const momentWeek = moment(this.weekValue, "YYYY-[W]WW");
            if (momentWeek.isValid()) {
                return momentWeek.format("YYYY-[W]WW");
            }
            return this.weekValue;
        },
    },
    watch: {
        weekValue(newVal) {
            this.$emit("update-field", { field: this.field, value: newVal });
            this.$emit("input", newVal);
            this.$emit("change", newVal);
        },
    },
    created() {
        this.$watch(
            "data." + this.field,
            (_new) => {
                this.weekValue = _new || null;
            },
            {
                immediate: true,
            }
        );
    },
    methods: {
        isRequired,
        onWeekChange(value) {
            const v = value;
            if (v) {
                const momentWeek = moment(v, "YYYY-[W]WW");
                if (momentWeek.isValid()) {
                    this.weekValue = momentWeek.format("YYYY-[W]WW");
                } else {
                    this.weekValue = v;
                }
            } else {
                this.weekValue = null;
            }
        },
        clearWeek() {
            this.weekValue = null;
            this.$emit("update-field", { field: this.field, value: null });
            this.$emit("input", null);
            this.$emit("change", null);
        },
        validate() {
            return this.$refs.field && this.$refs.field.validate();
        },
        getCurrentWeek() {
            const currentWeek = moment().format("YYYY-[W]WW");
            this.weekValue = currentWeek;
        },
    },
};
</script>

<template>
    <v-text-field
        ref="field"
        v-bind="$attrs"
        dense
        outlined
        :class="{ hideLabel: label === undefined }"
        :hide-details="hideDetails"
        :value="weekInputValue"
        type="week"
        :min="min"
        :max="max"
        :readonly="readonly"
        :clearable="clearable"
        :rules="[
            required && !weekValue
                ? isRequired(
                      typeof required === 'string' ? required : 'Trường này không được để trống'
                  )
                : true,
            ...rules,
        ]"
        :style="{ width: typeof width === 'string' ? width : width + 'px' }"
        @input="onWeekChange"
        @click:clear="clearWeek"
    >
        <template #label>
            {{ label }}
            <span v-if="required" class="error--text ms-1">(*)</span>
        </template>

        <!-- Hiển thị format đẹp hơn khi có giá trị -->
        <template #append>
            <v-tooltip v-if="weekValue" bottom>
                <template #activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on" small color="primary">
                        mdi-calendar-week
                    </v-icon>
                </template>
                <span>{{ displayValue }}</span>
            </v-tooltip>

            <v-btn
                v-if="!readonly && !weekValue"
                icon
                small
                @click="getCurrentWeek"
                title="Chọn tuần hiện tại"
            >
                <v-icon small>mdi-calendar-today</v-icon>
            </v-btn>
        </template>
    </v-text-field>
</template>

<style lang="scss">
// Tùy chỉnh style cho week input
.v-text-field input[type="week"] {
    &::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0.7;

        &:hover {
            opacity: 1;
        }
    }
}

// Ẩn label khi không có label
.hideLabel {
    .v-label {
        display: none !important;
    }
}
</style>
