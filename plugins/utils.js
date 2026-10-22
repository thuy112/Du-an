import Cookies from "js-cookie";
import moment from "moment";

export default (context, inject) => {
    inject("removeCookies", () => {
        Object.keys(Cookies.get()).forEach(function (cookieName) {
            const neededAttributes = {
                // Here you pass the same attributes that were used when the cookie was created
                // and are required when removing the cookie
            };
            Cookies.remove(cookieName, neededAttributes);
        });
    });

    inject("ruleRequired", (str = "Trường này không được để trống nha") => (e) => {
        e = e?.toString() || "";
        e = e.trim();
        return !!e || str;
    });
    inject("formatDate", (value) => {
        if (!value) return "";
        return moment(value, "DD/MM/YYYY hh:mm:ss").format("DD/MM/YYYY");
    });

    inject("formatDateV2", (value) => {
        if (!value) return "";
        return moment(value, "DD/MM/YYYY HH:mm:ss").format("HH:mm DD/MM/YYYY");
    });

    inject("formatMonth", (value) => {
        if (!value) return "";
        return moment(value, "DD/MM/YYYY").format("MM/YYYY");
    });

    inject(
        "getStt",
        (
            index,
            pageInfo = {
                pageIndex: 1,
                pageSize: 500,
            }
        ) => (pageInfo.pageIndex - 1) * pageInfo.pageSize + index + 1
    );
    inject("money", (value) => {
        if (!value) return "";
        try {
            const decimalCount = 0;
            const thousands = ",";
            const decimal = ".";

            const negativeSign = value < 0 ? "-" : "";

            const i = parseInt(
                (value = Math.abs(Number(value) || 0).toFixed(decimalCount))
            ).toString();
            const j = i.length > 3 ? i.length % 3 : 0;

            return (
                negativeSign +
                (j ? i.substr(0, j) + thousands : "") +
                i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
                (decimalCount
                    ? decimal +
                      Math.abs(value - i)
                          .toFixed(decimalCount)
                          .slice(2)
                    : "")
            );
        } catch (e) {
            console.log(e);
        }
    });

    inject("getText", (value, list) => list.find((i) => i.value === value)?.text || "");
    inject("formatNumber", (number) => {
        if (!number) return 0;
        return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    });

    inject("isEmptyObject", (obj) => {
        if (!obj) return true;
        return Object.keys(obj).length === 0;
    });

    inject("formatTimeRange", (fromTime, toTime) => {
        if (!fromTime || !toTime) return "";
        const from = moment(fromTime, "DD/MM/YYYY HH:mm:ss");
        const to = moment(toTime, "DD/MM/YYYY HH:mm:ss");

        const sameDay = from.isSame(to, "day");

        const fromFormatted = from.format("HH:mm");
        const toFormatted = to.format("HH:mm");
        const fromDateFormatted = from.format("DD/MM/YYYY");
        const toDateFormatted = to.format("DD/MM/YYYY");

        let output;
        if (sameDay) {
            output = `${fromFormatted} - ${toFormatted} ${fromDateFormatted}`;
        } else {
            output = `${fromFormatted} ${fromDateFormatted} - ${toFormatted} ${toDateFormatted}`;
        }

        return output;
    });

    inject("formatDateRange", (fromTime, toTime) => {
        if (!fromTime || !toTime) return "";
        const from = moment(fromTime, "DD/MM/YYYY HH:mm:ss");
        const to = moment(toTime, "DD/MM/YYYY HH:mm:ss");

        const sameDay = from.isSame(to, "day");
        const fromDateFormatted = from.format("DD/MM/YYYY");
        const toDateFormatted = to.format("DD/MM/YYYY");

        let output;
        if (sameDay) {
            output = fromDateFormatted;
        } else {
            output = `${fromDateFormatted} - ${toDateFormatted}`;
        }

        return output;
    });

    inject("createBreadcrumb", (item, disabled = true) => {
        return {
            text: item.pageName,
            disabled,
            to: item.pageUrl,
            exact: true,
        };
    });

    inject("getNameFromArray", (arr, field = "name") => {
        return arr.map((item) => item[field]).join(", ");
    });

    inject("inputInteger", (e) => {
        if ([187, 190, 189].includes(e.keyCode)) e.preventDefault();
    });

    inject("inputTypeNumber", (e) => {
        if ([69, 188].includes(e.keyCode)) e.preventDefault();
    });
    inject("preventZero", (e) => {
        if (["0"].includes(e.key) && Number(!e.target.value?.replace(/[^\d.-]/g, "")))
            e.preventDefault();
    });

    inject("download", (value) => {
        const link = document.createElement("a");
        link.href = value;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    inject("autoListYear", () => {
        const year = new Date().getFullYear();
        let years = [];
        for (let i = +year - 20 - (year % 10); i <= year + 30 - (year % 10); i++) {
            years = [...years, i];
        }
        return years;
    });
    inject("fileName", (value) => {
        if (!value) return "";
        return value.split("?o=")[1];
    });
};
