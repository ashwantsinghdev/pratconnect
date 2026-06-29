import HttpInterceptor from "./HttpInterceptor";

const Fetcher = async (url: string) => {
  try {
    const { data } = await HttpInterceptor.get(url);
    return data;
  } catch (err: unknown) {
    throw new Error("Request failed", { cause: err });
  }
};

export default Fetcher;
