import AuthForm from "@/components/AuthForm";

// G1: /register – samma formulär som /login, men mode="register"
export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
