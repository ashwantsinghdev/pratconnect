const env= import.meta.env

import axios from "axios"

const HttpInterceptor=axios.create({
    baseURL:env.VITE_SERVER,
    withCredentials:true
})
export default HttpInterceptor