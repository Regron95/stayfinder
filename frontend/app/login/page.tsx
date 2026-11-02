import AuthForm from "@/components/AuthForm";

// G1: /login – samma formulär som /register, men mode="login"
export default function LoginPage() {
  return <AuthForm mode="login" />;
}
