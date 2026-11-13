import Cookies from "js-cookie";
import moment from "moment";

/**
 * Xử lý danh sách sidebar
 * @param {Array} items - Array đầu vào.
 * @param {number} parentId - id parent (lần đầu chuyền 0)
 * @returns {Array} - The resulting hierarchical structure.
 */
export const handlePageList = (items, parentId = 0) => {
    const result = [];

    items.forEach((item) => {
        if (item.parentId === parentId) {
            const children = handlePageList(items, item.id);
            if (children.length > 0) {
                item.children = children;
            }
            result.push(item);
        }
    });

    return result;
};

export const removeCookies = () => {
    Object.keys(Cookies.get()).forEach(function (cookieName) {
        const neededAttributes = {
            // Here you pass the same attributes that were used when the cookie was created
            // and are required when removing the cookie
        };
        Cookies.remove(cookieName, neededAttributes);
    });
};

export const toSlug = (str) => {
    try {
        // Chuyển hết sang chữ thường
        str = str.toLowerCase();

        // xóa dấu
        str = str
            .normalize("NFD") // chuyển chuỗi sang unicode tổ hợp
            .replace(/[\u0300-\u036F]/g, ""); // xóa các ký tự dấu sau khi tách tổ hợp

        // Thay ký tự đĐ
        str = str.replace(/[đĐ]/g, "d");

        // Xóa ký tự đặc biệt
        str = str.replace(/([^0-9a-z-\s])/g, "");

        // Xóa khoảng trắng thay bằng ký tự -
        str = str.replace(/(\s+)/g, "-");

        // Xóa ký tự - liên tiếp
        str = str.replace(/-+/g, "-");

        // xóa phần dư - ở đầu & cuối
        str = str.replace(/^-+|-+$/g, "");

        // return
        return str;
    } catch (err) {
        console.error(err);
        return "";
    }
};

export const isEmptyObject = (obj) => {
    return !obj || Object.keys(obj).length === 0;
};

export const getStt = (
    index,
    pageInfo = {
        pageIndex: 1,
        pageSize: 500,
    }
) => (pageInfo.pageIndex - 1) * pageInfo.pageSize + index + 1;

export const getRetakeClassTypeText = (classType, courseType, isCourseNormal) => {
    try {
        if (!classType) return "";
        const lists = require("~/consts/list.js");
        const retakeCourseStatus = lists.retakeCourseStatus || [];
        const retakeCourseSubClassTypes = lists.retakeCourseSubClassTypes || [];

        const base = retakeCourseStatus.find((i) => i.value === classType);
        const baseText = base ? base.text : String(classType);

        let result = baseText;

        if (classType === "COMBINE_CLASS") {
            const sub = retakeCourseSubClassTypes.find((i) => i.value === courseType);
            result = sub ? `${baseText} (${sub.text})` : baseText;
        }

        // Thêm loại học phần dựa trên isCourseNormal chỉ cho lớp Đồ án môn học
        if (classType === "PROJECT_BASED_CLASS") {
            if (isCourseNormal === true) {
                result = `${result} (HPTT)`;
            } else if (isCourseNormal === false) {
                result = `${result} (HP.DAMH)`;
            }
        }

        return result;
    } catch (err) {
        return "";
    }
};

export const getStartOfISOWeek = (isoWeekString) => {
    const [yearStr, weekStr] = isoWeekString.split("-W");
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekStr, 10);

    return moment()
        .isoWeekYear(year)
        .isoWeek(week)
        .startOf("isoWeek")
        .format("DD/MM/YYYY HH:mm:ss");
};

export const getEndOfISOWeek = (isoWeekString) => {
    const [yearStr, weekStr] = isoWeekString.split("-W");
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekStr, 10);

    return moment().isoWeekYear(year).isoWeek(week).endOf("isoWeek").format("DD/MM/YYYY HH:mm:ss");
};

export const formatWeekbyDateTime = (dateTime) => {
    if (!dateTime) return "";
    const momentDate = moment(dateTime, "DD/MM/YYYY HH:mm:ss");
    if (!momentDate.isValid()) {
        console.warn("Invalid date format:", dateTime);
        return "";
    }
    return momentDate.format("WW/YYYY");
};

export const formatWeek = (dateTime) => {
    if (!dateTime) return "";
    const momentDate = moment(dateTime, "DD/MM/YYYY HH:mm:ss");
    if (!momentDate.isValid()) {
        console.warn("Invalid date format:", dateTime);
        return "";
    }
    return momentDate.format("YYYY-Www");
};
