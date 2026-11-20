<template>
    <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :nudge-right="20"
        :nudge-top="20"
        min-width="auto"
        offset-y
        transition="scale-transition"
    >
        <template #activator="{ on, attrs }">
            <v-text-field
                :hide-details="hideDetails"
                :rules="required ? [...rules, $required] : rules"
                :style="width && !$vuetify.breakpoint.mobile ? `max-width: ${width}` : ''"
                :value="formattedDate"
                clearable
                dense
                outlined
                readonly
                v-bind="attrs"
                v-on="on"
                @click:clear="handleClear"
            >
                <template #label>
                    <div v-if="!required">{{ label }}</div>
                    <base-required-label v-else :name="label" />
                </template>
            </v-text-field>
        </template>
        <v-date-picker
            v-model="selectedDate"
            :active-picker.sync="activePicker"
            :type="monthPicker ? 'month' : 'date'"
            locale="vi"
            :min="formatDate(min)"
            :max="formatDate(max)"
            @input="onDateSelected"
        ></v-date-picker>
    </v-menu>
</template>

<script>
import moment from "moment";

export default {
    name: "BaseDatePicker",
    props: {
        yearPicker: { type: Boolean, default: () => false },
        monthPicker: { type: Boolean, default: () => false },
        toTime: { type: Boolean, default: () => false },
        rules: { type: Array, default: () => [] },
        width: { type: String, default: () => "" },
        hideDetails: {
            type: Boolean,
            default: false,
        },
        required: {
            type: Boolean,
            default: false,
        },
        value: {
            type: String,
            default: () => "",
        },
        min: {
            type: String,
            required: false,
            default: () => null,
        },
        max: {
            type: String,
            required: false,
            default: () => null,
        },
        label: {
            type: String,
            default: () => "Chọn ngày",
        },
    },
    data() {
        return {
            activePicker: null,
            menu: false,
            selectedDate: this.value,
        };
    },
    computed: {
        formattedDate() {
            if (!this.selectedDate) return "";
            if (this.monthPicker) {
                return moment(this.selectedDate).format("MM/YYYY");
            }
            return moment(this.selectedDate).format("DD/MM/YYYY") !== "Invalid date"
                ? moment(this.selectedDate).format("DD/MM/YYYY")
                : "";
        },
    },
    created() {
        if (!this.value) {
            this.selectedDate = "";
        } else if (this.monthPicker) {
            this.selectedDate = moment(this.value, "MM/YYYY").format("YYYY-MM");
        } else {
            this.selectedDate = moment(this.value, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD");
        }
    },
    watch: {
        menu(newVal) {
            if (newVal) {
                if (this.yearPicker) {
                    setTimeout(() => (this.activePicker = "YEAR"));
                } else if (this.monthPicker) {
                    setTimeout(() => (this.activePicker = "MONTH"));
                }
            }
        },
        value(newValue) {
            if (!newValue) {
                this.selectedDate = "";
                return;
            }
            if (this.monthPicker) {
                this.selectedDate = moment(newValue, "MM/YYYY").format("YYYY-MM");
            } else {
                this.selectedDate = moment(newValue, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD");
            }
        },
    },
    methods: {
        handleClear() {
            this.$emit("input", "");
        },
        onDateSelected(date) {
            if (this.monthPicker) {
                this.$emit("input", moment(date, "YYYY-MM").format("MM/YYYY"));
            } else {
                this.$emit(
                    "input",
                    !this.toTime
                        ? `${moment(date, "YYYY-MM-DD").format("DD/MM/YYYY")} 00:00:00`
                        : `${moment(date, "YYYY-MM-DD").format("DD/MM/YYYY")} 23:59:59`
                );
            }
            this.menu = false;
        },
        formatDate(date) {
            if (!date) return null;
            if (this.monthPicker) {
                return moment(date, "MM/YYYY").format("YYYY-MM");
            }
            return moment(date, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD");
        },
    },
};
</script>

<style scoped></style>
