import { Link, useNavigate } from "react-router-dom";
import { Label } from "../components/shared/Label";
import { Input } from "../components/shared/Input"
import { Button } from "../components/shared/Button";

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
const Signup = () => {
  const navigate = useNavigate();

  const signup = async (values: FormDataType) => {
    try {
      await HttpInterceptor.post("/auth/signup", values);
      navigate("/login");
    } catch (err) {
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
            <CardTitle className="text-xl font-bold">
              Create an account
            </CardTitle>
            <CardDescription>Start your first chat now</CardDescription>
          </CardHeader>

          <CardContent>
            <Form className="space-y-4" onValue={signup}>
              <div className="space-y-2">
                <Label htmlFor="fullname">Full name</Label>
                <Input id="fullname" name="fullname" className="rounded-xl" />
              </div>

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
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  placeholder="9999999999"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  className="rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full mt-2 h-12 text-base font-semibold bg-gradient-to-r from-accent to-amber-400 text-white hover:opacity-90"
              >
                Create account
                <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </Form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-foreground font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
