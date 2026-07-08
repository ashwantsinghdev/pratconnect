import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/shared/Button";
import { Label } from "../components/shared/Label";
import { Input } from "../components/shared/Input";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/shared/Card";
import Form, { type FormDataType } from "./shared/Form";
import AuthBackdrop from "./shared/AuthBackdrop";
import HttpInterceptor from "../lib/HttpInterceptor";
import CatchError from "../lib/CatchError";
import { ArrowRight } from "lucide-react";
import Logo from "./shared/Logo";
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
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <AuthBackdrop />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        <div className="flex justify-center">
          <Logo />
        </div>

        <Card className="rounded-3xl shadow-sm border-border">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-xl font-bold">Welcome back</CardTitle>
            <CardDescription>Log in to get back to your chats</CardDescription>
          </CardHeader>

          <CardContent>
            <Form className="space-y-4" onValue={login}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                    Forgot password?
                  </span>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Your password"
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full rounded-full mt-2 h-12 text-base font-semibold"
              >
                Log in
                <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </Form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-foreground font-medium hover:underline"
              >
                Sign up free
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
