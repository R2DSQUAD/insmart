import dynamic from "next/dynamic";

const Login = dynamic(() => import("./components/auth/Login"), { ssr: false });

export default function LoginPage() {
  return <Login />;
}
