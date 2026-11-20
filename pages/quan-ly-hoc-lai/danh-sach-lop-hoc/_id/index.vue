<template>
    <div>
        <v-row dense justify="center">
            <v-col cols="12" md="auto">
                <base-select
                    v-model="search.teacherId"
                    :items="teacherList"
                    hide-details
                    item-text="fullName"
                    item-value="id"
                    label="Giảng viên"
                    width="160px"
                ></base-select>
            </v-col>
            <v-col class="d-flex align-center gap-8" cols="auto">
                <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                        <v-icon color="primary" v-bind="attrs" @click="handleReset" v-on="on"
                            >mdi-refresh
                        </v-icon>
                    </template>
                    <span>Reset bộ lọc</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                        <v-btn
                            color="primary"
                            elevation="0"
                            v-bind="attrs"
                            @click="handleSearch"
                            v-on="on"
                        >
                            <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                    </template>
                    <span>Tìm kiếm</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                        <v-btn
                            color="primary"
                            elevation="0"
                            v-bind="attrs"
                            @click="openAdd"
                            v-on="on"
                        >
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </template>
                    <span>Thêm mới</span>
                </v-tooltip>
            </v-col>
        </v-row>
        <v-row dense justify="end">
            <v-col class="relative" cols="12" md="9">
                <p class="absolute primary--text font-weight-medium" style="top: -5%">
                    Thời khóa biểu
                </p>
                <v-sheet height="500">
                    <v-calendar
                        ref="calendar"
                        v-model="value"
                        color="primary"
                        :event-color="getEventColor"
                        :event-more="false"
                        :weekdays="weekday"
                        interval-height="100px"
                        locale="vi"
                        type="month"
                    >
                        <template #day="{ date }">
                            <div class="d-flex gap-2 flex-wrap ma-2">
                                <v-menu
                                    v-for="item in getEventVisibleByDate(date)"
                                    :key="item.id"
                                    max-width="350px"
                                    offset-x
                                    open-on-hover
                                >
                                    <template #activator="{ on, attrs }">
                                        <span
                                            :class="item.color"
                                            class="v-event white--text px-1 flex-grow-1 text-center flex-shrink-0"
                                            style="flex-basis: 50%"
                                            v-bind="attrs"
                                            @click="showMenuRefEvent(item)"
                                            v-on="on"
                                        >
                                            {{ item?.name }}
                                        </span>
                                    </template>
                                    <v-card color="grey lighten-4" flat min-width="200px">
                                        <v-toolbar :color="item.color" dark dense>
                                            <v-btn icon @click="openUpdate(item)">
                                                <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                            <v-toolbar-title>
                                                <div>{{ item.name }}</div>
                                            </v-toolbar-title>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                icon
                                                @click="
                                                    openDelete = true;
                                                    selectedEvent = item;
                                                "
                                            >
                                                <v-icon>mdi-delete</v-icon>
                                            </v-btn>
                                        </v-toolbar>
                                        <v-card-text>
                                            <v-row dense>
                                                <v-col cols="12">
                                                    <base-detail-item title="Giảng viên phụ trách">
                                                        <template #value>
                                                            <div :class="`${item.color}--text`">
                                                                {{ item?.teacher?.fullName }}
                                                            </div>
                                                        </template>
                                                    </base-detail-item>
                                                </v-col>
                                                <v-col cols="12">
                                                    <base-detail-item title="Môn học lại">
                                                        <template #value>
                                                            <div :class="`${item.color}--text`">
                                                                {{ item?.examSession?.term?.name }}
                                                            </div>
                                                        </template>
                                                    </base-detail-item>
                                                </v-col>
                                                <v-col cols="12">
                                                    <base-detail-item title="Đã đăng ký">
                                                        <template #value>
                                                            <div :class="`${item.color}--text`">
                                                                {{
                                                                    item?.examSession
                                                                        ?.quantityCurrent
                                                                }}
                                                                <span
                                                                    v-if="
                                                                        item &&
                                                                        item.examSession &&
                                                                        item.examSession
                                                                            .quantitySeat
                                                                    "
                                                                >
                                                                    /{{
                                                                        item?.examSession
                                                                            ?.quantitySeat
                                                                    }}</span
                                                                >
                                                            </div>
                                                        </template>
                                                    </base-detail-item>
                                                </v-col>

                                                <v-col cols="12">
                                                    <base-detail-item title="Thời gian">
                                                        <template #value>
                                                            <div :class="`${item.color}--text`">
                                                                {{
                                                                    classPeriodList.find(
                                                                        (data) =>
                                                                            data.value ===
                                                                            item.classPeriod
                                                                    )?.time
                                                                }}
                                                            </div>
                                                        </template>
                                                    </base-detail-item>
                                                </v-col>
                                                <v-col v-if="item.note" cols="12">
                                                    <base-detail-item title="Ghi chú">
                                                        <template #value>
                                                            <div :class="`${item.color}--text`">
                                                                {{ item?.note }}
                                                            </div>
                                                        </template>
                                                    </base-detail-item>
                                                </v-col>
                                            </v-row>
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer />
                                            <v-btn
                                                :color="item.color"
                                                text
                                                @click="selectedOpen = false"
                                            >
                                                Đóng
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-menu>
                                <v-menu
                                    v-if="!!getInvisibleEvent(date).length"
                                    max-width="350px"
                                    offset-x
                                    :close-on-content-click="false"
                                    transition="slide-x-transition"
                                >
                                    <template #activator="{ on, attrs }">
                                        <span
                                            class="v-event flex-grow-1 px-1 text-center"
                                            style="flex-basis: 50%"
                                            v-bind="attrs"
                                            v-on="on"
                                        >
                                            Hiển thị thêm
                                        </span>
                                    </template>
                                    <v-list shaped outlined dense>
                                        <v-menu
                                            open-on-hover
                                            v-for="data in getInvisibleEvent(date)"
                                            :key="data.id"
                                            offset-x
                                            max-width="350px"
                                        >
                                            <template #activator="{ on, attrs }">
                                                <v-list-item dense v-bind="attrs" v-on="on">
                                                    <v-list-item-title
                                                        :class="data.color"
                                                        class="v-event white--text p-2 text-center"
                                                        >Tiết {{ data.classPeriod }}
                                                    </v-list-item-title>
                                                </v-list-item>
                                            </template>
                                            <v-card color="grey lighten-4" min-width="200px" flat>
                                                <v-toolbar :color="data.color" dense dark>
                                                    <v-btn @click="openUpdate(data)" icon>
                                                        <v-icon>mdi-pencil</v-icon>
                                                    </v-btn>
                                                    <v-toolbar-title>
                                                        <div>{{ data.name }}</div>
                                                    </v-toolbar-title>
                                                    <v-spacer></v-spacer>
                                                    <v-btn
                                                        @click="
                                                            openDelete = true;
                                                            selectedEvent = data;
                                                        "
                                                        icon
                                                    >
                                                        <v-icon>mdi-delete</v-icon>
                                                    </v-btn>
                                                </v-toolbar>
                                                <v-card-text>
                                                    <v-row dense>
                                                        <v-col cols="12">
                                                            <base-detail-item
                                                                title="Giảng viên phụ trách"
                                                            >
                                                                <template #value>
                                                                    <div
                                                                        :class="`${data.color}--text`"
                                                                    >
                                                                        {{
                                                                            data?.teacher?.fullName
                                                                        }}
                                                                    </div>
                                                                </template>
                                                            </base-detail-item>
                                                        </v-col>
                                                        <v-col cols="12">
                                                            <base-detail-item title="Môn học lại">
                                                                <template #value>
                                                                    <div
                                                                        :class="`${data.color}--text`"
                                                                    >
                                                                        {{
                                                                            data?.examSession?.term
                                                                                ?.name
                                                                        }}
                                                                    </div>
                                                                </template>
                                                            </base-detail-item>
                                                        </v-col>
                                                        <v-col cols="12">
                                                            <base-detail-item title="Đã đăng ký">
                                                                <template #value>
                                                                    <div
                                                                        :class="`${data.color}--text`"
                                                                    >
                                                                        {{
                                                                            data?.examSession
                                                                                ?.quantityCurrent
                                                                        }}
                                                                        <span
                                                                            v-if="
                                                                                data &&
                                                                                data.examSession &&
                                                                                data.examSession
                                                                                    .quantitySeat
                                                                            "
                                                                        >
                                                                            /{{
                                                                                data?.examSession
                                                                                    ?.quantitySeat
                                                                            }}</span
                                                                        >
                                                                    </div>
                                                                </template>
                                                            </base-detail-item>
                                                        </v-col>

                                                        <v-col cols="12">
                                                            <base-detail-item title="Thời gian">
                                                                <template #value>
                                                                    <div
                                                                        :class="`${data.color}--text`"
                                                                    >
                                                                        {{
                                                                            classPeriodList.find(
                                                                                (item) =>
                                                                                    item.value ===
                                                                                    data.classPeriod
                                                                            )?.time
                                                                        }}
                                                                    </div>
                                                                </template>
                                                            </base-detail-item>
                                                        </v-col>
                                                        <v-col v-if="data.note" cols="12">
                                                            <base-detail-item title="Ghi chú">
                                                                <template #value>
                                                                    <div
                                                                        :class="`${data.color}--text`"
                                                                    >
                                                                        {{ data?.note }}
                                                                    </div>
                                                                </template>
                                                            </base-detail-item>
                                                        </v-col>
                                                    </v-row>
                                                </v-card-text>
                                                <v-card-actions>
                                                    <v-spacer />
                                                    <v-btn
                                                        text
                                                        :color="data.color"
                                                        @click="selectedOpen = false"
                                                    >
                                                        Đóng
                                                    </v-btn>
                                                </v-card-actions>
                                            </v-card>
                                        </v-menu>
                                    </v-list>
                                </v-menu>
                            </div>
                        </template>
                    </v-calendar>
                </v-sheet>
            </v-col>
            <v-col cols="12" md="3">
                <v-sheet>
                    <v-date-picker
                        v-model="dateChoose"
                        ref="datepicker"
                        :selected-items-text="`${dateChoose.length} đã chọn`"
                        locale="vi"
                        range
                    ></v-date-picker>
                </v-sheet>
            </v-col>
        </v-row>
        <base-confirm-modal
            :color="selectedEvent.color"
            :open="openDelete"
            @OK="handleDelete"
            @toggle="openDelete = !openDelete"
        >
            <template #content>
                <div>
                    Xác nhận xóa tiết
                    <span :class="`${selectedEvent.color}--text`" class="font-weight-bold">{{
                        selectedEvent?.classPeriod
                    }}</span
                    >?
                </div>
            </template>
        </base-confirm-modal>
        <schedule-add ref="ScheduleAdd" />
        <schedule-update ref="ScheduleUpdate" :data-item="selectedEvent" />
    </div>
</template>
<script>
import moment from "moment";
import BaseSelect from "~/components/Base/Select.vue";
import scheduleServices from "~/services/scheduleServices";
import BaseConfirmModal from "~/components/Base/ConfirmModal.vue";
import teacherServices from "~/services/teacherServices";
import BaseDetailItem from "~/components/Base/DetailItem.vue";
import { classPeriodList } from "~/consts/list";

const INIT_SEARCH = {
    endDate: "",
    examSessionId: 0,
    id: 0,
    startDate: "",
    teacherId: 0,
};
const INIT_PAGE_INFO = {
    pageIndex: 1,
    pageSize: 100,
};
export default {
    name: "CalendarView",
    components: { BaseDetailItem, BaseConfirmModal, BaseSelect },
    data() {
        return {
            classPeriodList,
            viewMore: false,
            dateChoose: [],
            mode: "stack",
            selectedEvent: {},
            selectedElement: null,
            selectedOpen: false,
            weekday: [0, 1, 2, 3, 4, 5, 6],
            value: "",
            events: [],
            colors: ["blue", "indigo", "deep-purple", "cyan", "green", "orange"],
            names: [],
            openDelete: false,
            search: {
                ...INIT_SEARCH,
            },
            pageInfo: {
                ...INIT_PAGE_INFO,
            },
            list: [],
            totalPage: 0,
            totalRecord: 0,
            teacherList: [],
            listDayMore: [],
            selectedMore: null,
            selectedMoreContent: {},
        };
    },
    watch: {
        dateChoose(newVal) {
            if (newVal.length === 2) {
                if (moment(newVal[0]).isAfter(newVal[1])) {
                    newVal = newVal.reverse(); // nếu  ngày bắt đầu chọn sau ngày đến
                }
                this.search.startDate = `${moment(newVal[0], "YYYY-MM-DD").format(
                    "DD/MM/YYYY"
                )} 00:00:00`;
                this.search.endDate = `${moment(newVal[1], "YYYY-MM-DD").format(
                    "DD/MM/YYYY"
                )} 23:59:59`;
                this.getList();
            }
        },
    },

    async created() {
        this.getTeachers();
        this.search.examSessionId = this.$route.params.id;
        await this.getList();
    },
    async mounted() {
        await this.$nextTick();
        const prevBtn = this.$refs.datepicker.$el.querySelector(
            '.v-btn[aria-label="Previous month"]'
        );
        prevBtn.addEventListener("click", () => {
            this.$refs.calendar.prev();
        });

        const nextBtn = this.$refs.datepicker.$el.querySelector('.v-btn[aria-label="Next month"]');
        nextBtn.addEventListener("click", () => {
            this.$refs.calendar.next();
        });
    },
    methods: {
        openUpdate(item) {
            this.selectedEvent = { ...item };
            this.$refs.ScheduleUpdate.open = true;
            this.$refs.ScheduleUpdate.teacherList = [...this.teacherList];
        },
        showMenuRefEvent(item) {
            this.selectedEvent = item;
            // this.selectedElement = this.selectedMore;
            // this.viewMore = false;
        },
        getInvisibleEvent(date) {
            const listFilter = this.list
                .filter((item) => {
                    return (
                        item.schoolDay === moment(date, "YYYY-MM-DD").format("DD/MM/YYYY HH:mm:ss")
                    );
                })
                .slice(2);
            return listFilter;
        },
        getEventVisibleByDate(date) {
            return this.list
                .filter((item) => {
                    return (
                        item.schoolDay === moment(date, "YYYY-MM-DD").format("DD/MM/YYYY HH:mm:ss")
                    );
                })
                .slice(0, 2);
        },
        async handleDelete() {
            const res = await scheduleServices.delete(this.selectedEvent.id);
            if (res.success) {
                this.$showSuccess("Xóa TKB thành công");
                this.getList();
            }
            this.openDelete = false;
        },

        getEventColor(event) {
            return event.color;
        },
        rnd(a, b) {
            return Math.floor((b - a + 1) * Math.random()) + a;
        },
        async getTeachers() {
            const res = await teacherServices.getAll({
                status: "ACTIVE",
            });
            if (res.success) {
                this.teacherList = res.data;
            }
        },

        openAdd() {
            this.$refs.ScheduleAdd.open = true;
            this.$refs.ScheduleAdd.teacherList = [...this.teacherList];
        },
        handleReset() {
            this.search = { ...INIT_SEARCH };
            this.pageInfo = { ...INIT_PAGE_INFO };
            this.dateChoose = [];
            this.getList();
        },
        async getList() {
            try {
                this.isLoading = true;
                const res = await scheduleServices.getList({
                    ...this.pageInfo,
                    ...this.search,
                });
                if (res.success) {
                    this.list = res.data.data.map((item) => {
                        // Parse the start date
                        const startMoment = moment(item.schoolDay, "DD/MM/YYYY HH:mm:ss");

                        // Create end timestamp by setting the time to 23:59:59
                        // const endMoment = startMoment.clone().endOf("day");
                        // console.log(endMoment);

                        // Convert to formatted string
                        // const formattedEndTimestamp = endMoment.format("DD/MM/YYYY HH:mm:ss");
                        // console.log(formattedEndTimestamp);
                        // console.log(endMoment.toDate());
                        // console.log(startMoment.toDate());

                        return {
                            ...item,
                            name: `Tiết ${item?.classPeriod}`,
                            start: startMoment.toDate(),
                            color: this.colors[this.rnd(0, this.colors.length - 1)],
                        };
                    });
                    // this.list = res.data.data;
                    this.totalPage = res.data?.totalPages;
                    this.totalRecord = res.data?.totalRecords;
                }
            } catch (e) {
                console.error(e);
            }
            this.isLoading = false;
        },
        handleSearch() {
            this.pageInfo.pageIndex = 1;
            this.getList({});
        },
    },
};
</script>
<style></style>
