import { Link, useNavigate } from "react-router-dom";
import Button from "./shared/Button";
import Card from "./shared/Card";
import Input from "./shared/Input";
import Form, { type FormDataType } from "./shared/Form";
import HttpInterceptor from "../lib/HttpInterceptor";
import CatchError from "../lib/CatchError";

const Login = () => {
  const navigate = useNavigate();
  const login = async (values: FormDataType) => {
    try {
      await HttpInterceptor.post("/auth/login", values);
      navigate("/app");
    } catch (err: unknown) {
      CatchError(err);
    }
  };

  return (
     <div className="bg-gray-100 flex items-center justify-center h-screen">
      <div className="lg:w-6/12 animate__animated animate__fadeIn">
        <Card noPadding>
          <div className="grid lg:grid-cols-2">

            <div className="p-8 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-black">
                  Sign in an account
                </h1>
                <p className="text-gray-500">Start your first chat now</p>
              </div>

              <Form className="space-y-6" onValue={login}>
                <Input name="email" placeholder="Email id" />
                <Input type="password" name="password" placeholder="Password" />
                <Button type="danger" icon="arrow-right-up-line">
                  Sign in
                </Button>
              </Form>

              <div className="flex gap-2">
                <p>Don't have an account?</p>
                <Link to="/signup" className="text-green-400 font-medium hover:underline">
                  Sign up
                </Link>
              </div>
            </div>

            <div className="overflow-hidden h-125 bg-linear-to-t from-sky-500 to-indigo-500 rounded-r-xl flex items-center justify-center">
              <img
                src="/public/images/avt.jpeg"
                alt="auth"
                className="w-[70%] animate__animated animate__slideInUp animate__faster"
              />
            </div>

          </div>
        </Card>
      </div>
    </div>
  )
};

export default Login;
