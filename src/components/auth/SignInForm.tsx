import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import axiosClient from "../../service/axios.service";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!login.trim() || !password.trim()) {
      toast.error("Login va parolni kiriting");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/login', { login, password });

      const user = res.data?.user ?? res.data;
      const role: string = (user?.role ?? "").toUpperCase();
      if (!["SUPER", "ADMIN"].includes(role)) {
        toast.error("Sizda admin huquqi yo'q");
        return;
      }

      const token = res.data.access_token ?? res.data.token ?? "";
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success("Kirish muvaffaqiyatli");
      navigate('/');

    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Login yoki parol noto'g'ri";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto" />
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Kirish
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Diametr Admin paneliga xush kelibsiz!
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Login <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="Login kiriting"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                />
              </div>
              <div>
                <Label>
                  Parol <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Parol kiriting"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
              </div>
              <div>
                <Button type="submit" className="w-full" size="sm" disabled={loading}>
                  {loading ? "Kirish..." : "Kirish"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

