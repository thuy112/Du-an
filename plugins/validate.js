import moment from "moment";

export default (context, inject) => {
    inject("required", (e) => {
        e = e?.toString() || "";
        e = e.trim();
        return !!e || "Vui lòng nhập đủ thông tin";
    });

    inject("over255", (e) => {
        if (!isNaN(e) && typeof e === "number") return true;
        return e.length <= 255 || "Không được nhập quá 255 kí tự!";
    });

    inject("checkMail", (e) => {
        const str = e ? e.toString() : "";
        const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        return regex.test(str) || !e || "Vui lòng nhập đúng định dạng email";
    });

    inject("birthday", (e) => {
        if (!e) return true;
        return (
            moment(e, "DD-MM-YYYY").isBefore(moment()) ||
            "Ngày sinh không được vượt qua ngày hiện tại"
        );
    });
    inject("isAfter", (e, value) => {
        if (!e || !value) return true;
        const dateType = value.length === 10 ? "DD/MM/YYYY" : "DD/MM/YYYY HH:mm:ss";

        return (
            moment(e, dateType).isAfter(moment(value, "DD/MM/YYYY HH:mm:ss")) ||
            "Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu"
        );
    });
    inject("phone", (str) => {
        const phoneNot84 = /[0]{1}[35789]{1}[0-9]{8}$/;
        const phone84 = /^[84]{2}[35789]{1}[0-9]{8}$/;
        return phoneNot84.test(str) || phone84.test(str);
    });

    inject("isAfterMonth", (e, value) => {
        if (!e || !value) return true;

        return moment(e, "MM/YYYY").isSameOrAfter(moment(value, "MM/YYYY"))
            ? true
            : "Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu";
    });
};
