import { API_BASE_URL } from "../../lib/api";
import AuthIcons from "@/components/Auth/AuthIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {

    const [btnLoading , setBtnLoading] = useState(false)
    const navigate = useNavigate()

    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBtnLoading(true)
        const formData = new FormData(event.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const nameVerify = /^[A-Za-z\s]+$/;
        const emailVerify = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!nameVerify.test(name)) {
            toast({
                title: "Name should only contain letters and spaces",
                variant: "destructive"
            });
            setBtnLoading(false);
            return;
        }
        if (!emailVerify.test(email)) {
            toast({
                title: "Invalid email format",
                variant: "destructive"
            })
            setBtnLoading(false);
            return;
        }
        
        if (password.length < 6) {
            toast({
                title: "Password must be at least 6 characters",
                variant: "destructive"
            })
            setBtnLoading(false);
            return;
        }
        
        const newUserInfo = {
            name: name,
            email: email,
            password: password
        }
        try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(newUserInfo)
        })
        const data = await response.json()
        if (data.success) {
            toast({
                title: data.message
            })
            navigate("/auth/signin")
        }
        else {
            toast({
                title: data.message,
                variant: "destructive"
            })
        }
        } catch {
            toast({
                title: "Something went wrong. Please try again.",
                variant: "destructive"
            })
        } finally {
            setBtnLoading(false)
        }
    }
    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="w-[50%] h-[90%] rounded-xl flex pr-32 items-center max-md:hidden max-sm:hidden">
                <img src="https://static.vecteezy.com/system/resources/thumbnails/021/666/130/small_2x/login-and-password-concept-3d-illustration-computer-and-account-login-and-password-form-page-on-screen-sign-in-to-account-user-authorization-login-authentication-page-concept-png.png" alt="" />
            </div>

            <form onSubmit={handleSubmit} className="w-[30%] h-[80%] rounded-xl p-6 border max-md:w-[60%] max-sm:border-0 max-sm:w-[90%] max-sm:h-[70%]">
                <p className="font-bold text-xl">Welcome to <span className="text-primary">CMS</span></p>

                <div className="mt-8 flex flex-col gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input required name='name' id="name" type="name" className="bg-secondary" placeholder="Username" />
                </div>

                <div className="mt-7 flex flex-col gap-2">
                    <Label htmlFor="email">Mail ID</Label>
                    <Input required name="email" id="email" type="email" className="bg-secondary" placeholder="Email ID" />
                </div>

                <div className="mt-7 flex flex-col gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input required name="password" type="password" id="password" minLength={6} maxLength={20} className="bg-secondary" placeholder="Password" />
                </div>

                <Button className="w-full mt-7 p-5">{btnLoading ? "Loading..." : "Signup"}</Button>
                <Separator className="bg-border mt-5" />
                <p className="text-xs mt-2 font-bold text-end ">Already have an account ? <Link to='/auth/signin'><span className="text-primary cursor-pointer"> signin</span></Link></p>
                <AuthIcons />
            </form>
        </div>
    )
}
