<template>
    <v-menu v-model="menu" content-class="date-picker" :close-on-content-click="false">
        <v-text-field
            slot="activator"
            v-bind="{ ...$attrs, ...attrs }"
            ref="field"
            slot-scope="{ attrs, on }"
            dense
            outlined
            :class="{ hideLabel: label === undefined }"
            :hide-details="hideDetails"
            :value="data[field]"
            :type="type"
            :rules="[
                required && !dateSelected
                    ? isRequired(
                          typeof required === 'string' ? required : 'Trường này không được để trống'
                      )
                    : true,
                ...rules,
            ]"
            readonly
            :clearable="clearable"
            :placeholder="format"
            :style="{ width: typeof width === 'string' ? width : width + 'px' }"
            v-on="on"
            @click:clear="emitFieldValue(null)"
        >
            <template #label>
                {{ label }} {{ dateSelected }}
                <span v-if="required" class="error--text ms-1">(*)</span>
            </template>
        </v-text-field>

        <template v-if="!readonly">
            <v-date-picker
                v-if="!dateSelected"
                ref="datepicker"
                :picker-date="pickerDate"
                locale="vi"
                :value="datePicker"
                @change="changeDate"
            />
            <v-time-picker v-else no-title :use-seconds="seconds || false" @change="changeTime" />
        </template>
    </v-menu>
</template>

<script>
import moment from "moment";
import { isRequired } from "~/utils/rules";

export default {
    name: "BaseDateField",
    props: {
        label: { type: String, required: true },
        field: { type: String, required: true },
        data: { type: Object, required: true },
        hideDetails: { type: Boolean, default: false },
        required: { type: [String, Boolean], default: false },
        time: { type: Boolean, default: false },
        type: {
            type: String,
            default: "text",
        },
        rules: {
            type: Array,
            default() {
                return [];
            },
        },
        min: { type: [String, Object], required: false, default: "" },
        max: { type: [String, Object], required: false, default: "" },
        isEnd: Boolean,
        isStart: Boolean,
        seconds: Boolean,
        width: { type: [Number, String], default: "" },
        formatTime: { type: String, default: "" },
        readonly: Boolean,
        clearable: { type: Boolean, default: true },
        formatDash: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            menu: false,
            datePicker: null,
            dateSelected: null,
            pickerDate: undefined,
        };
    },
    computed: {
        format() {
            return (
                this.formatTime ||
                (this.time
                    ? this.formatDash
                        ? "DD-MM-YYYY_HH:mm:ss"
                        : "DD/MM/YYYY HH:mm:ss"
                    : this.formatDash
                    ? "DD-MM-YYYY"
                    : "DD/MM/YYYY")
            );
        },
    },
    watch: {
        min(_new) {
            const currentValue = this.data[this.field];
            if (!_new || !currentValue) return;
            const minDate = this.isEnd
                ? moment(_new, this.format).startOf("D")
                : moment(_new, this.format);
            const currentDate = moment(currentValue, this.format);
            if (minDate.isAfter(currentDate)) {
                this.emitFieldValue(minDate.endOf("D").format(this.format));
                this.setDate(_new);
            }
        },
        max(_new) {
            const currentValue = this.data[this.field];
            if (!_new || !currentValue) return;
            const maxDate = this.isStart
                ? moment(_new, this.format).endOf("D")
                : moment(_new, this.format);
            const currentDate = moment(currentValue, this.format);
            if (maxDate.isBefore(currentDate)) {
                this.emitFieldValue(maxDate.startOf("D").format(this.format));
                this.setDate(_new);
            }
        },
        menu() {
            this.dateSelected = null;
        },
    },
    created() {
        this.$watch(
            "data." + this.field,
            (_new) => {
                this.setDate(_new);
                if (!_new) {
                    this.dateSelected = null;
                }
            },
            {
                immediate: true,
            }
        );
    },
    methods: {
        isRequired,
        emitFieldValue(value) {
            this.$emit("update-field", { field: this.field, value });
            this.$emit("input", value);
        },
        changeDate(value) {
            if (!this.time) {
                let date = moment(value, "YYYY-MM-DD");
                if (this.isEnd) date = date.endOf("D");
                else if (this.isStart) date = date.startOf("D");
                this.emitFieldValue(date.format(this.format));
                this.menu = false;
            } else {
                this.dateSelected = value;
            }
        },
        changeTime(value) {
            const dateTimeStr = `${this.dateSelected} ${value}`;
            let date = moment(dateTimeStr, "YYYY-MM-DD HH:mm");
            if (this.isEnd) date = date.endOf("D");
            else if (this.isStart) date = date.startOf("D");
            this.emitFieldValue(date.format(this.format));
            this.menu = false;
        },
        setDate(val) {
            let date = moment(val, this.format);
            if (date.isValid()) {
                if (this.isEnd) date = date.endOf("D");
                else if (this.isStart) date = date.startOf("D");
                this.datePicker = date.format("YYYY-MM-DD");
            } else {
                this.datePicker = null;
                this.emitFieldValue(null);
                this.resetViewDate();
            }
        },
        validate() {
            return this.$refs.field && this.$refs.field.validate();
        },
        resetViewDate() {
            this.pickerDate = moment().format("YYYY-MM-DD");
            this.$nextTick(() => {
                this.pickerDate = undefined;
            });
        },
    },
};
</script>

<style lang="scss">
.v-menu__content.date-picker {
    min-width: auto !important;
}
</style>