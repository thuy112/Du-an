import Cookies from "js-cookie";
import { CHANNEL } from "~/consts/consts";
import { removeCookies } from "~/utils/heppers";

export default ({
  $axios,
  $showWarning,
  $showError,
  app,
  redirect,
  store,
  route,
  error,
}) => {
  $axios.onRequest((config) => {
    store.commit("SET_LOADING", true);
    const token = Cookies.get("token");
    if (token) {
      config.headers.common.Authorization = "Bearer " + token;
    }

    const transid = Date.now().toString();
    const method = config.method ? config.method.toLowerCase() : "";

    const commonParams = {
      channel: CHANNEL,
      transid,
    };

    if (["get", "delete"].includes(method)) {
      config.params = { ...(config.params || {}), ...commonParams };
    }

    if (
      ["post", "put"].includes(method) &&
      !(config.data instanceof FormData)
    ) {
      Array.isArray(config.data)
        ? (config.data = [...(config.data || {})])
        : (config.data = { ...(config.data || {}), ...commonParams });
    }
  });

  $axios.onResponse((response) => {
    store.commit("SET_LOADING", false);
    const status = response.status;
    switch (status) {
      case 201:
      case 202:
      case 200: {
        return {
          success: true,
          data: response.data.data,
        };
      }

      case 1:
      case 401: {
        removeCookies();
        $showWarning(response.data.error.message);
        redirect("/dang-nhap");
        return {
          success: false,
          data: response.data.data,
        };
      }

      default:
        response.data.error.message
          ? $showWarning(response.data.error.message)
          : $showError("Lỗi kết nối tới server");
        return {
          success: false,
          data: response.data.data,
        };
    }
  });

  $axios.onError((err) => {
    try {
      const status = err.response.status;
      const message = err.response.data.error.message;

      const firstDigit = Math.floor(status / 100); // Extract the first digit

      if (status === 401) {
        removeCookies();
        $showWarning(message);
        redirect("/dang-nhap");
        return {
          success: false,
          data: err.response.data.data,
        };
      }

      switch (firstDigit) {
        case 4: {
          message
            ? $showWarning(message)
            : $showError("Lỗi kết nối tới server");
          return {
            success: false,
            data: err.response.data.data,
          };
        }

        case 5: {
          message ? $showError(message) : $showError("Lỗi kết nối tới server");
          return {
            success: false,
            data: err.response.data.data,
          };
        }

        default: {
          message
            ? $showWarning(message)
            : $showError("Lỗi kết nối tới server");
          store.commit("SET_LOADING", false);
          return {
            success: false,
            data: err.response.data.data,
          };
        }
      }
    } catch (e) {
      $showError("Lỗi kết nối tới server");
    }

    // if (status === 403 || status === 404 || status === 500) {
    //     error({ statusCode: status, message: err.response.statusText })
    // }
  });
};
